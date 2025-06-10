const express = require('express');
require('dotenv').config();

const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const busboy = require('busboy');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Check file type to determine destination
        const dest = file.fieldname === 'team_photo' ? 'public/images/teams/' : 'public/images/rider/';
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // Just use the original filename
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Accept only webp images
        if (!file.originalname.match(/\.(webp)$/)) {
            return cb(new Error('Only webp images are allowed!'), false);
        }
        cb(null, true);
    }
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: 'motogp-secret',
    resave: false,
    saveUninitialized: true
}));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'motogp',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the database');
  connection.release();
});

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Auth routes
app.get('/check-auth', (req, res) => {
    res.json({ authenticated: !!req.session.userId });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const sql = 'SELECT * FROM login WHERE usename = ?';
    pool.query(sql, [username], async (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.json({ success: false });
        }

        const user = results[0];
        if (password === user.password) {
            req.session.userId = user.login_id;
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ success: false, error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

// Riders
app.get('/api/riders', (req, res) => {
    const sql = `
        SELECT 
            r.rider_id,
            r.name,
            r.country as nationality,
            r.image_url,
            r.team_id,
            t.team_name as team,
            t.team_picture
        FROM riders r
        LEFT JOIN teams t ON r.team_id = t.team_id
        ORDER BY r.rider_id ASC`;
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching riders:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Process results to add complete image URLs
        results = results.map(rider => ({
            ...rider,
            image: rider.image_url ? `/images/rider/${rider.image_url}` : null
        }));
        
        res.json(results);
    });
});

// Add new rider
app.post('/api/riders', requireAuth, (req, res) => {
    const { name, country, team_id, image_url } = req.body;

    // Validate required fields
    if (!name || !country) {
        return res.status(400).json({ error: 'Name and nationality are required' });
    }

    const sql = 'INSERT INTO riders (name, country, team_id, image_url) VALUES (?, ?, ?, ?)';
    pool.query(sql, [name, country, team_id || null, image_url || null], (err, result) => {
        if (err) {
            console.error('Error adding rider:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ 
            success: true, 
            rider_id: result.insertId,
            message: 'Rider added successfully' 
        });
    });
});

// Get specific rider
app.get('/api/riders/:id', requireAuth, (req, res) => {
    const sql = `
        SELECT 
            r.rider_id,
            r.name,
            r.country,
            r.team_id,
            r.image_url,
            t.team_name
        FROM riders r
        LEFT JOIN teams t ON r.team_id = t.team_id
        WHERE r.rider_id = ?`;
    
    pool.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching rider:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Rider not found' });
        }
        res.json(results[0]);
    });
});

// Update rider
app.put('/api/riders/:id', requireAuth, (req, res) => {
    const { name, country, team_id, image_url } = req.body;
    
    // Validate required fields
    if (!name || !country) {
        return res.status(400).json({ error: 'Name and nationality are required' });
    }

    const sql = `
        UPDATE riders 
        SET name = ?, country = ?, team_id = ?, image_url = ?
        WHERE rider_id = ?`;
    
    pool.query(sql, [name, country, team_id || null, image_url || null, req.params.id], (err) => {
        if (err) {
            console.error('Error updating rider:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ success: true, message: 'Rider updated successfully' });
    });
});

// Delete rider
app.delete('/api/riders/:id', requireAuth, (req, res) => {
    const rider_id = req.params.id;

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                // First delete any results associated with this rider
                await connection.promise().query(
                    'DELETE FROM results WHERE rider_id = ?',
                    [rider_id]
                );

                // Then delete the rider
                await connection.promise().query(
                    'DELETE FROM riders WHERE rider_id = ?',
                    [rider_id]
                );

                // Commit the transaction
                await connection.promise().commit();

                res.json({ 
                    success: true, 
                    message: 'Rider and associated results deleted successfully' 
                });

            } catch (error) {
                // Rollback on error
                await connection.promise().rollback();
                console.error('Error in rider deletion transaction:', error);
                res.status(500).json({ error: 'Failed to delete rider' });
            } finally {
                connection.release();
            }
        });
    });
});

// Teams
app.get('/api/teams', (req, res) => {
    const sql = `
        SELECT 
            t.*,
            r1.name as rider1_name, 
            r1.country as rider1_nationality, 
            r1.image_url as rider1_image,
            r2.name as rider2_name, 
            r2.country as rider2_nationality, 
            r2.image_url as rider2_image
        FROM teams t
        LEFT JOIN riders r1 ON t.rider1_id = r1.rider_id
        LEFT JOIN riders r2 ON t.rider2_id = r2.rider_id
        ORDER BY t.team_id ASC`;
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching teams:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        // Process results to add complete image URLs
        results = results.map(team => ({
            ...team,
            team_picture: team.team_picture,
            rider1_image: team.rider1_image ? `/images/rider/${team.rider1_image}` : null,
            rider2_image: team.rider2_image ? `/images/rider/${team.rider2_image}` : null
        }));

        res.json(results);
    });
});

// Get specific team
app.get('/api/teams/:id', requireAuth, (req, res) => {
    const sql = `
        SELECT 
            t.*,
            r1.name as rider1_name, 
            r1.country as rider1_nationality,
            r2.name as rider2_name, 
            r2.country as rider2_nationality
        FROM teams t
        LEFT JOIN riders r1 ON t.rider1_id = r1.rider_id
        LEFT JOIN riders r2 ON t.rider2_id = r2.rider_id
        WHERE t.team_id = ?`;
    
    pool.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching team:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(results[0]);
    });
});

// Results for a specific race or all races
app.get('/api/results', (req, res) => {
    const calendar_id = req.query.race;
    
    let sql = `
        SELECT 
            r.*,
            c.race_name, 
            c.country as race_country,
            c.start_date,
            c.end_date,
            rd.name as rider_name, 
            rd.country as rider_country,
            rd.image_url as rider_image,
            t.team_name,
            t.team_picture,
            CASE 
                WHEN r.race_time IS NULL THEN 1
                ELSE 0
            END as is_dnf
        FROM results r 
        JOIN calendar c ON r.calendar_id = c.calendar_id 
        JOIN riders rd ON r.rider_id = rd.rider_id
        JOIN teams t ON r.team_id = t.team_id`;

    const params = [];
    
    // If specific race is requested
    if (calendar_id) {
        sql += ' WHERE r.calendar_id = ?';
        params.push(calendar_id);
    }
    
    sql += ' ORDER BY c.start_date DESC, r.points DESC, is_dnf ASC, CASE WHEN r.race_time IS NOT NULL THEN r.race_time ELSE "99:99:99" END ASC';
    
    pool.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching results:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // If specific race was requested
        if (calendar_id) {
            // If no results found, check if race exists
            if (results.length === 0) {
                const checkRaceSql = 'SELECT * FROM calendar WHERE calendar_id = ?';
                pool.query(checkRaceSql, [calendar_id], (err, raceResults) => {
                    if (err) {
                        console.error('Error checking race:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    
                    if (raceResults.length === 0) {
                        return res.status(404).json({ error: 'Race not found' });
                    }
                    
                    const race = raceResults[0];
                    const now = new Date();
                    const startDate = new Date(race.start_date);
                    const endDate = new Date(race.end_date);
                    
                    if (endDate < now) {
                        return res.json({
                            race_status: 'finished',
                            results: []
                        });
                    } else if (startDate <= now && endDate >= now) {
                        return res.json({
                            race_status: 'ongoing',
                            race_name: race.race_name,
                            start_date: race.start_date,
                            end_date: race.end_date,
                            message: 'Race is currently in progress'
                        });
                    } else {
                        return res.json({
                            race_status: 'upcoming',
                            race_name: race.race_name,
                            start_date: race.start_date,
                            end_date: race.end_date,
                            message: 'Race has not started yet'
                        });
                    }
                });
                return;
            }
            
            // Process results for specific race
            const processedResults = results.map(result => ({
                ...result,
                position: result.position || 'Not set',
                points: result.points || 0,
                race_time: result.race_time || 'DNF',
                rider_image: result.rider_image
            }));
            
            res.json({
                race_status: 'finished',
                results: processedResults
            });
        } else {
            // Return all results for admin view
            res.json(results.map(result => ({
                ...result,
                position: result.position || 'Not set',
                points: result.points || 0,
                race_time: result.race_time || 'DNF'
            })));
        }
    });
});

// Get a specific result
app.get('/api/results/:id', (req, res) => {
    const sql = `
        SELECT r.*, c.race_name, rd.name as rider_name, t.team_name
        FROM results r
        JOIN calendar c ON r.calendar_id = c.calendar_id
        JOIN riders rd ON r.rider_id = rd.rider_id
        JOIN teams t ON r.team_id = t.team_id
        WHERE r.result_id = ?`;
    
    pool.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching result:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }
        res.json(results[0]);
    });
});

// Results endpoints
app.post('/api/results', requireAuth, async (req, res) => {
    const { calendar_id, rider_id, team_id, race_time } = req.body;

    // Validate required fields
    if (!calendar_id || !rider_id || !team_id || !race_time) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if rider already has a result for this race
        const [existingResult] = await pool.promise().query(
            'SELECT * FROM results WHERE calendar_id = ? AND rider_id = ?',
            [calendar_id, rider_id]
        );

        if (existingResult.length > 0) {
            return res.status(400).json({ 
                error: 'This rider already has a result for this race'
            });
        }

        // Get all existing results for this race
        const [existingResults] = await pool.promise().query(
            `SELECT * FROM results 
            WHERE calendar_id = ?`,
            [calendar_id]
        );

        // Function to convert race time to seconds for comparison
        const timeToSeconds = (time) => {
            if (time === 'DNF' || time === null) return Number.MAX_VALUE;
            const [hours, minutes, seconds] = time.split(':');
            return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
        };

        // Add new result to the array and sort all results
        const allResults = [...existingResults, { race_time, rider_id, team_id }];
        allResults.sort((a, b) => {
            // Handle DNF cases
            if ((a.race_time === 'DNF' || a.race_time === null) && (b.race_time === 'DNF' || b.race_time === null)) return 0;
            if (a.race_time === 'DNF' || a.race_time === null) return 1;
            if (b.race_time === 'DNF' || b.race_time === null) return -1;
            
            return timeToSeconds(a.race_time) - timeToSeconds(b.race_time);
        });

        // Points distribution
        const pointsSystem = {
            1: 25, 2: 20, 3: 16, 4: 13, 5: 11,
            6: 10, 7: 9, 8: 8, 9: 7, 10: 6,
            11: 5, 12: 4, 13: 3, 14: 2, 15: 1
        };

        // Start transaction
        const connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        try {
            // Calculate position and points for the new result
            const position = allResults.findIndex(r => 
                r.rider_id === rider_id && r.team_id === team_id
            ) + 1;
            
            const points = race_time === 'DNF' ? 0 : (pointsSystem[position] || 0);

            // Insert the new result with NULL race_time for DNF
            await connection.query(
                'INSERT INTO results (calendar_id, rider_id, team_id, race_time, points, position) VALUES (?, ?, ?, ?, ?, ?)',
                [calendar_id, rider_id, team_id, race_time === 'DNF' ? null : race_time, points, position]
            );

            // Update positions and points for all other results
            for (let i = 0; i < allResults.length; i++) {
                const result = allResults[i];
                if (result.result_id) { // Only update existing results
                    const newPosition = i + 1;
                    const newPoints = result.race_time === 'DNF' ? 0 : (pointsSystem[newPosition] || 0);
                    
                    await connection.query(
                        'UPDATE results SET position = ?, points = ? WHERE result_id = ?',
                        [newPosition, newPoints, result.result_id]
                    );
                }
            }

            await connection.commit();
            res.json({
                success: true,
                message: 'Result added successfully'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

    } catch (error) {
        console.error('Error adding result:', error);
        res.status(500).json({ error: 'Failed to add result' });
    }
});

app.get('/api/results/race/:calendar_id', requireAuth, async (req, res) => {
    try {
        const [results] = await pool.promise().query(
            `SELECT r.*, rd.name as rider_name, t.team_name 
             FROM results r 
             JOIN riders rd ON r.rider_id = rd.rider_id 
             JOIN teams t ON r.team_id = t.team_id 
             WHERE r.calendar_id = ? 
             ORDER BY r.points DESC`,
            [req.params.calendar_id]
        );
        res.json(results);
    } catch (error) {
        console.error('Error fetching race results:', error);
        res.status(500).json({ error: 'Failed to fetch race results' });
    }
});

app.put('/api/results/:id', requireAuth, async (req, res) => {
    const result_id = req.params.id;
    
    // Log the entire request body
    console.log('Update Result - Full request:', {
        params: req.params,
        body: req.body,
        result_id: result_id
    });

    // Extract only race_time, ignore other fields even if sent
    const { race_time } = req.body;

    console.log('Update Result - Extracted time:', {
        race_time: race_time,
        isDNF: race_time === 'DNF'
    });

    // Validate race_time is provided
    if (!race_time) {
        console.log('Update Result - Validation failed: No race time provided');
        return res.status(400).json({ error: 'Race time is required' });
    }

    try {
        // Start a transaction
        const connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        try {
            // First get the existing result to preserve other fields
            const [existingResult] = await connection.query(
                'SELECT * FROM results WHERE result_id = ?',
                [result_id]
            );

            if (existingResult.length === 0) {
                throw new Error('Result not found');
            }

            console.log('Update Result - Existing result found:', existingResult[0]);

            // Update only the race_time
            const updateQuery = 'UPDATE results SET race_time = ? WHERE result_id = ?';
            const updateValues = [race_time === 'DNF' ? null : race_time, result_id];
            
            console.log('Update Result - Executing update:', {
                query: updateQuery,
                values: updateValues
            });

            await connection.query(updateQuery, updateValues);

            // Get all results for this race to update positions and points
            const [allResults] = await connection.query(
                `SELECT * FROM results WHERE calendar_id = ?`,
                [existingResult[0].calendar_id]
            );

            console.log('Update Result - All race results retrieved:', {
                raceId: existingResult[0].calendar_id,
                resultCount: allResults.length
            });

            // Sort results by race time
            allResults.sort((a, b) => {
                // Handle DNF cases
                if ((a.race_time === null) && (b.race_time === null)) return 0;
                if (a.race_time === null) return 1;
                if (b.race_time === null) return -1;
                
                // Convert times to seconds for comparison
                const timeToSeconds = (time) => {
                    const [hours, minutes, seconds] = time.split(':');
                    return (parseInt(hours) * 3600) + (parseInt(minutes) * 60) + parseInt(seconds);
                };
                
                return timeToSeconds(a.race_time) - timeToSeconds(b.race_time);
            });

            // Points distribution
            const pointsSystem = {
                1: 25, 2: 20, 3: 16, 4: 13, 5: 11,
                6: 10, 7: 9, 8: 8, 9: 7, 10: 6,
                11: 5, 12: 4, 13: 3, 14: 2, 15: 1
            };

            // Update positions and points for all results
            for (let i = 0; i < allResults.length; i++) {
                const newPosition = i + 1;
                const newPoints = allResults[i].race_time === null ? 0 : (pointsSystem[newPosition] || 0);
                
                await connection.query(
                    'UPDATE results SET position = ?, points = ? WHERE result_id = ?',
                    [newPosition, newPoints, allResults[i].result_id]
                );
            }

            console.log('Update Result - Positions and points updated');

            // Commit the transaction
            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: 'Race time updated successfully'
            });

        } catch (error) {
            // Rollback on error
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error updating race time:', error);
        res.status(400).json({ 
            error: error.message || 'Failed to update race time'
        });
    }
});

// Delete a result
app.delete('/api/results/:id', requireAuth, async (req, res) => {
    const result_id = req.params.id;

    try {
        // Get a connection for transaction
        const connection = await pool.promise().getConnection();
        await connection.beginTransaction();

        try {
            // First get the result details to know which race it belongs to
            const [resultDetails] = await connection.query(
                'SELECT calendar_id FROM results WHERE result_id = ?',
                [result_id]
            );

            if (resultDetails.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ error: 'Result not found' });
            }

            const calendar_id = resultDetails[0].calendar_id;

            // Delete the result
            await connection.query(
                'DELETE FROM results WHERE result_id = ?',
                [result_id]
            );

            // Get remaining results for this race
            const [remainingResults] = await connection.query(
                `SELECT * FROM results 
                WHERE calendar_id = ? 
                ORDER BY 
                    CASE WHEN race_time = 'DNF' THEN 1 ELSE 0 END,
                    CASE WHEN race_time != 'DNF' THEN race_time ELSE '99:99:99' END`,
                [calendar_id]
            );

            // Points distribution
            const pointsSystem = {
                1: 25, 2: 20, 3: 16, 4: 13, 5: 11,
                6: 10, 7: 9, 8: 8, 9: 7, 10: 6,
                11: 5, 12: 4, 13: 3, 14: 2, 15: 1
            };

            // Update positions and points for remaining results
            for (let i = 0; i < remainingResults.length; i++) {
                const newPosition = i + 1;
                const newPoints = remainingResults[i].race_time === 'DNF' ? 0 : (pointsSystem[newPosition] || 0);
                
                await connection.query(
                    'UPDATE results SET position = ?, points = ? WHERE result_id = ?',
                    [newPosition, newPoints, remainingResults[i].result_id]
                );
            }

            // Commit the transaction
            await connection.commit();
            connection.release();

            res.json({ 
                success: true,
                message: 'Result deleted successfully'
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ 
            error: 'Failed to delete result. Please try again.' 
        });
    }
});

// Calendar with results only
app.get('/api/calendar', (req, res) => {
    const sql = `
        SELECT 
            c.*,
            (SELECT COUNT(*) FROM results WHERE calendar_id = c.calendar_id) as has_results,
            (SELECT 
                JSON_OBJECT(
                    'name', rd.name,
                    'team', t.team_name,
                    'time', r.race_time
                )
             FROM results r
             JOIN riders rd ON r.rider_id = rd.rider_id
             JOIN teams t ON r.team_id = t.team_id
             WHERE r.calendar_id = c.calendar_id
             AND r.position = 1
             LIMIT 1) as winner
        FROM calendar c 
        LEFT JOIN results r ON c.calendar_id = r.calendar_id
        GROUP BY c.calendar_id
        ORDER BY c.start_date DESC`;

    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching calendar:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Add race status
        const now = new Date();
        results = results.map(race => {
            const startDate = new Date(race.start_date);
            const endDate = new Date(race.end_date);
            
            if (endDate < now) {
                race.status = 'Completed';
            } else if (startDate <= now && endDate >= now) {
                race.status = 'In Progress';
            } else {
                race.status = 'Upcoming';
            }
            
            return race;
        });
        
        res.json(results);
    });
});

// Get specific race
app.get('/api/calendar/:id', requireAuth, (req, res) => {
    const sql = `
        SELECT 
            c.*,
            (SELECT COUNT(*) FROM results WHERE calendar_id = c.calendar_id) as has_results,
            (SELECT 
                JSON_OBJECT(
                    'name', rd.name,
                    'team', t.team_name,
                    'time', r.race_time
                )
             FROM results r
             JOIN riders rd ON r.rider_id = rd.rider_id
             JOIN teams t ON r.team_id = t.team_id
             WHERE r.calendar_id = c.calendar_id
             AND r.position = 1
             LIMIT 1) as winner
        FROM calendar c 
        WHERE c.calendar_id = ?`;

    pool.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching race:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Race not found' });
        }
        
        const race = results[0];
        const now = new Date();
        const startDate = new Date(race.start_date);
        const endDate = new Date(race.end_date);
        
        if (endDate < now) {
            race.status = 'Completed';
        } else if (startDate <= now && endDate >= now) {
            race.status = 'In Progress';
        } else {
            race.status = 'Upcoming';
        }
        
        res.json(race);
    });
});

// Rider Championship Standings
app.get('/api/standings/riders', (req, res) => {
    const sql = `
        SELECT 
            rd.rider_id,
            rd.name,
            rd.country as nationality,
            rd.image_url as image,
            t.team_name as team,
            COUNT(CASE WHEN r.position = 1 THEN 1 END) as wins,
            COUNT(CASE WHEN r.position <= 3 THEN 1 END) as podiums,
            SUM(r.points) as points,
            MIN(CASE WHEN r.position > 0 THEN r.position END) as best_finish
        FROM riders rd
        LEFT JOIN results r ON rd.rider_id = r.rider_id
        JOIN teams t ON rd.team_id = t.team_id
        GROUP BY rd.rider_id, rd.name, rd.country, rd.image_url, t.team_name
        ORDER BY points DESC, wins DESC`;

    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching rider standings:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// Team Championship Standings
app.get('/api/standings/teams', (req, res) => {
    const sql = `
        SELECT 
            t.team_id,
            t.team_name as name,
            t.team_picture as image,
            COUNT(CASE WHEN r.position = 1 THEN 1 END) as wins,
            COUNT(CASE WHEN r.position <= 3 THEN 1 END) as podiums,
            SUM(r.points) as points,
            MIN(CASE WHEN r.position > 0 THEN r.position END) as best_finish
        FROM teams t
        LEFT JOIN results r ON r.team_id = t.team_id
        GROUP BY t.team_id, t.team_name, t.team_picture
        ORDER BY points DESC, wins DESC`;

    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching team standings:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
});

// Add file upload endpoints
app.post('/api/upload/rider', requireAuth, upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
        success: true, 
        filename: req.file.filename,
        message: 'File uploaded successfully' 
    });
});

app.post('/api/upload/team', requireAuth, upload.single('team_photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
        success: true, 
        filename: req.file.filename,
        message: 'File uploaded successfully' 
    });
});

// Add team endpoint
app.post('/api/teams', requireAuth, async (req, res) => {
    const { team_name, team_picture, rider1_id, rider2_id } = req.body;

    // Validate required fields
    if (!team_name || !team_picture) {
        return res.status(400).json({ error: 'Team name and picture are required' });
    }

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                // Insert the team
                const [teamResult] = await connection.promise().query(
                    'INSERT INTO teams (team_name, team_picture) VALUES (?, ?)',
                    [team_name, team_picture]
                );

                const team_id = teamResult.insertId;

                // Update the team with rider IDs
                await connection.promise().query(
                    'UPDATE teams SET rider1_id = ?, rider2_id = ? WHERE team_id = ?',
                    [rider1_id, rider2_id, team_id]
                );

                // Update riders' team_id
                await connection.promise().query(
                    'UPDATE riders SET team_id = ? WHERE rider_id IN (?, ?)',
                    [team_id, rider1_id, rider2_id]
                );

                // Commit the transaction
                await connection.promise().commit();

                res.json({ 
                    success: true, 
                    team_id: team_id,
                    message: 'Team created successfully' 
                });

            } catch (error) {
                // Rollback on error
                await connection.promise().rollback();
                console.error('Error in team creation transaction:', error);
                res.status(500).json({ error: 'Failed to create team' });
            } finally {
                connection.release();
            }
        });
    });
});

// Delete team endpoint
app.delete('/api/teams/:id', requireAuth, (req, res) => {
    const team_id = req.params.id;

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                // First, set team_id to NULL for any riders in this team
                await connection.promise().query(
                    'UPDATE riders SET team_id = NULL WHERE team_id = ?',
                    [team_id]
                );

                // Then delete the team
                await connection.promise().query(
                    'DELETE FROM teams WHERE team_id = ?',
                    [team_id]
                );

                // Commit the transaction
                await connection.promise().commit();

                res.json({ 
                    success: true, 
                    message: 'Team deleted successfully' 
                });

            } catch (error) {
                // Rollback on error
                await connection.promise().rollback();
                console.error('Error in team deletion transaction:', error);
                res.status(500).json({ error: 'Failed to delete team' });
            } finally {
                connection.release();
            }
        });
    });
});

// Update team endpoint
app.put('/api/teams/:id', requireAuth, async (req, res) => {
    const team_id = req.params.id;
    const { team_name, team_picture, rider1_id, rider2_id } = req.body;

    // Validate required fields
    if (!team_name) {
        return res.status(400).json({ error: 'Team name is required' });
    }

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                // First, reset team_id for any riders that were previously in this team
                await connection.promise().query(
                    'UPDATE riders SET team_id = NULL WHERE team_id = ?',
                    [team_id]
                );

                // Update the team details
                const updateFields = ['team_name = ?'];
                const updateValues = [team_name];

                // Add team_picture to update if provided
                if (team_picture) {
                    updateFields.push('team_picture = ?');
                    updateValues.push(team_picture);
                }

                // Add rider IDs to update
                updateFields.push('rider1_id = ?', 'rider2_id = ?');
                updateValues.push(rider1_id, rider2_id);

                // Add team_id to values array
                updateValues.push(team_id);

                await connection.promise().query(
                    `UPDATE teams SET ${updateFields.join(', ')} WHERE team_id = ?`,
                    updateValues
                );

                // Update team_id for the selected riders
                if (rider1_id) {
                    await connection.promise().query(
                        'UPDATE riders SET team_id = ? WHERE rider_id = ?',
                        [team_id, rider1_id]
                    );
                }
                if (rider2_id) {
                    await connection.promise().query(
                        'UPDATE riders SET team_id = ? WHERE rider_id = ?',
                        [team_id, rider2_id]
                    );
                }

                // Commit the transaction
                await connection.promise().commit();

                res.json({ 
                    success: true, 
                    message: 'Team updated successfully' 
                });

            } catch (error) {
                // Rollback on error
                await connection.promise().rollback();
                console.error('Error in team update transaction:', error);
                res.status(500).json({ error: 'Failed to update team' });
            } finally {
                connection.release();
            }
        });
    });
});

// Add new race to calendar
app.post('/api/calendar', requireAuth, (req, res) => {
    const { race_name, country, start_date, end_date } = req.body;

    // Validate required fields
    if (!race_name || !country || !start_date || !end_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (endDate < startDate) {
        return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    const sql = 'INSERT INTO calendar (race_name, country, start_date, end_date) VALUES (?, ?, ?, ?)';
    pool.query(sql, [race_name, country, start_date, end_date], (err, result) => {
        if (err) {
            console.error('Error adding race:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ 
            success: true, 
            calendar_id: result.insertId,
            message: 'Race added successfully' 
        });
    });
});

// Delete a race from calendar
app.delete('/api/calendar/:id', requireAuth, (req, res) => {
    const calendar_id = req.params.id;

    // Start a transaction
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                // First delete any results associated with this race
                await connection.promise().query(
                    'DELETE FROM results WHERE calendar_id = ?',
                    [calendar_id]
                );

                // Then delete the race from calendar
                await connection.promise().query(
                    'DELETE FROM calendar WHERE calendar_id = ?',
                    [calendar_id]
                );

                // Commit the transaction
                await connection.promise().commit();

                res.json({ 
                    success: true, 
                    message: 'Race and associated results deleted successfully' 
                });

            } catch (error) {
                // Rollback on error
                await connection.promise().rollback();
                console.error('Error in race deletion transaction:', error);
                res.status(500).json({ error: 'Failed to delete race' });
            } finally {
                connection.release();
            }
        });
    });
});

// Update race in calendar
app.put('/api/calendar/:id', requireAuth, (req, res) => {
    const calendar_id = req.params.id;
    const { race_name, country, start_date, end_date } = req.body;

    // Validate required fields
    if (!race_name || !country || !start_date || !end_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (endDate < startDate) {
        return res.status(400).json({ error: 'End date cannot be before start date' });
    }

    // Check for date conflicts with other races
    const checkConflictsSql = `
        SELECT calendar_id, race_name 
        FROM calendar 
        WHERE calendar_id != ? 
        AND (
            (start_date <= ? AND end_date >= ?) OR
            (start_date <= ? AND end_date >= ?) OR
            (start_date >= ? AND end_date <= ?)
        )`;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.beginTransaction(async (err) => {
            if (err) {
                connection.release();
                console.error('Error starting transaction:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            try {
                // Check for date conflicts
                const [conflicts] = await connection.promise().query(
                    checkConflictsSql,
                    [calendar_id, start_date, start_date, end_date, end_date, start_date, end_date]
                );

                if (conflicts.length > 0) {
                    throw new Error(`Date conflict with race: ${conflicts[0].race_name}`);
                }

                // Update the calendar entry
                await connection.promise().query(
                    'UPDATE calendar SET race_name = ?, country = ?, start_date = ?, end_date = ? WHERE calendar_id = ?',
                    [race_name, country, start_date, end_date, calendar_id]
                );

                // Commit the transaction
                await connection.promise().commit();

                res.json({ 
                    success: true, 
                    message: 'Race updated successfully' 
                });

            } catch (error) {
                // Rollback on error
                await connection.promise().rollback();
                console.error('Error in calendar update:', error);
                res.status(400).json({ 
                    error: error.message || 'Failed to update race' 
                });
            } finally {
                connection.release();
            }
        });
    });
});

// Get specific rider with comprehensive stats
app.get('/api/riders/:id/stats', async (req, res) => {
    const riderId = req.params.id;

    try {
        const connection = await pool.promise().getConnection();
        
        try {
            // Get basic rider info with team
            const [riderInfo] = await connection.query(`
                SELECT 
                    r.*,
                    t.team_name,
                    t.team_picture,
                    (SELECT name FROM riders WHERE team_id = r.team_id AND rider_id != r.rider_id LIMIT 1) as teammate_name
                FROM riders r
                LEFT JOIN teams t ON r.team_id = t.team_id
                WHERE r.rider_id = ?
            `, [riderId]);

            if (riderInfo.length === 0) {
                return res.status(404).json({ error: 'Rider not found' });
            }

            // Get race statistics using the same logic as standings
            const [raceStats] = await connection.query(`
                SELECT 
                    COUNT(CASE WHEN position = 1 THEN 1 END) as wins,
                    COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums,
                    MIN(CASE WHEN position > 0 THEN position END) as best_finish,
                    COALESCE(SUM(points), 0) as points,
                    COUNT(DISTINCT calendar_id) as races_participated
                FROM results 
                WHERE rider_id = ?
            `, [riderId]);

            // Get recent race results
            const [recentResults] = await connection.query(`
                SELECT 
                    r.*,
                    c.race_name,
                    c.country as race_country,
                    c.start_date
                FROM results r
                JOIN calendar c ON r.calendar_id = c.calendar_id
                WHERE r.rider_id = ?
                ORDER BY c.start_date DESC
                LIMIT 5
            `, [riderId]);

            // Get championship position using the same logic as standings
            const [standings] = await connection.query(`
                SELECT 
                    rider_id,
                    COALESCE(SUM(points), 0) as total_points
                FROM results
                GROUP BY rider_id
                HAVING total_points > 0
                ORDER BY total_points DESC
            `);

            const position = standings.findIndex(r => r.rider_id === parseInt(riderId)) + 1;

            // Format response to match existing data structure
            const response = {
                rider_id: riderInfo[0].rider_id,
                name: riderInfo[0].name,
                nationality: riderInfo[0].country,
                team: riderInfo[0].team_name,
                teammate: riderInfo[0].teammate_name,
                image_url: riderInfo[0].image_url,
                championship_position: position || null,
                statistics: {
                    points: raceStats[0].points,
                    wins: raceStats[0].wins,
                    podiums: raceStats[0].podiums,
                    best_finish: raceStats[0].best_finish,
                    races: raceStats[0].races_participated
                },
                recent_results: recentResults.map(result => ({
                    race_name: result.race_name,
                    country: result.race_country,
                    position: result.position,
                    points: result.points || 0,
                    race_time: result.race_time || 'DNF',
                    date: result.start_date
                }))
            };

            res.json(response);

        } catch (error) {
            console.error('Error fetching rider stats:', error);
            res.status(500).json({ error: 'Failed to fetch rider statistics' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error getting database connection:', error);
        res.status(500).json({ error: 'Database connection error' });
    }
});

// Get rider's race history
app.get('/api/riders/:id/history', async (req, res) => {
    const riderId = req.params.id;

    try {
        const [results] = await pool.promise().query(`
            SELECT 
                r.*,
                c.race_name,
                c.country as race_country,
                c.start_date
            FROM results r
            JOIN calendar c ON r.calendar_id = c.calendar_id
            WHERE r.rider_id = ?
            ORDER BY c.start_date DESC
        `, [riderId]);

        res.json(results);
    } catch (error) {
        console.error('Error fetching rider race history:', error);
        res.status(500).json({ error: 'Failed to fetch race history' });
    }
});

// Get head-to-head comparison with teammate
app.get('/api/riders/:id/teammate-comparison', async (req, res) => {
    const riderId = req.params.id;

    try {
        const connection = await pool.promise().getConnection();
        
        try {
            // First get rider's team and teammate
            const [riderTeam] = await connection.query(`
                SELECT 
                    r1.team_id,
                    r2.rider_id as teammate_id
                FROM riders r1
                JOIN riders r2 ON r1.team_id = r2.team_id AND r1.rider_id != r2.rider_id
                WHERE r1.rider_id = ?
            `, [riderId]);

            if (riderTeam.length === 0) {
                return res.json({ error: 'No teammate found' });
            }

            // Get comparison stats
            const [comparison] = await connection.query(`
                SELECT 
                    rider_id,
                    COUNT(CASE WHEN position = 1 THEN 1 END) as victories,
                    COUNT(CASE WHEN position <= 3 THEN 1 END) as podiums,
                    AVG(CASE WHEN position > 0 THEN position END) as avg_finish,
                    SUM(points) as total_points
                FROM results
                WHERE rider_id IN (?, ?)
                GROUP BY rider_id
            `, [riderId, riderTeam[0].teammate_id]);

            res.json(comparison);

        } catch (error) {
            console.error('Error fetching teammate comparison:', error);
            res.status(500).json({ error: 'Failed to fetch comparison data' });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error getting database connection:', error);
        res.status(500).json({ error: 'Database connection error' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
