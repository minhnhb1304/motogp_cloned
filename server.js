const express = require('express');
require('dotenv').config();

const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

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

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
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
            team_picture: team.team_picture ? `/images/teams/${team.team_picture}` : null,
            rider1_image: team.rider1_image ? `/images/rider/${team.rider1_image}` : null,
            rider2_image: team.rider2_image ? `/images/rider/${team.rider2_image}` : null
        }));

        res.json(results);
    });
});

// Results for a specific race
app.get('/api/results', (req, res) => {
    const sql = `
        SELECT 
            r.*,
            c.race_name, 
            c.country as race_country,
            rd.name as rider_name, 
            rd.country as rider_country,
            t.team_name
        FROM results r 
        JOIN calendar c ON r.calendar_id = c.calendar_id 
        JOIN riders rd ON r.rider_id = rd.rider_id
        JOIN teams t ON r.team_id = t.team_id
        ORDER BY c.start_date DESC, r.position ASC`;
    
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching results:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        // Process results to ensure all fields are present
        results = results.map(result => ({
            ...result,
            position: result.position || 'Not set',
            points: result.points || 0,
            race_time: result.race_time || 'DNF'
        }));
        
        res.json(results);
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

// Add a new result
app.post('/api/results', requireAuth, (req, res) => {
    const { calendar_id, rider_id, team_id, race_time } = req.body;
    
    // Calculate position and points based on race_time
    const getPositionSql = `
        SELECT COUNT(*) + 1 as position
        FROM results 
        WHERE calendar_id = ? AND race_time < ?`;
    
    pool.query(getPositionSql, [calendar_id, race_time], (err, positionResult) => {
        if (err) {
            console.error('Error calculating position:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        const position = positionResult[0].position;
        let points = 0;
        
        // Assign points based on position
        if (position === 1) points = 25;
        else if (position === 2) points = 20;
        else if (position === 3) points = 16;
        else if (position === 4) points = 13;
        else if (position === 5) points = 11;
        else if (position === 6) points = 10;
        else if (position <= 15) points = 15 - position + 1;
        
        const insertSql = `
            INSERT INTO results 
            (calendar_id, rider_id, team_id, position, points, race_time)
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        pool.query(insertSql, [calendar_id, rider_id, team_id, position, points, race_time], (err, result) => {
            if (err) {
                console.error('Error adding result:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ id: result.insertId, message: 'Result added successfully' });
        });
    });
});

// Update a result
app.put('/api/results/:id', requireAuth, (req, res) => {
    const { calendar_id, rider_id, team_id, race_time } = req.body;
    
    // Recalculate position and points
    const getPositionSql = `
        SELECT COUNT(*) + 1 as position
        FROM results 
        WHERE calendar_id = ? AND race_time < ? AND result_id != ?`;
    
    pool.query(getPositionSql, [calendar_id, race_time, req.params.id], (err, positionResult) => {
        if (err) {
            console.error('Error calculating position:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        
        const position = positionResult[0].position;
        let points = 0;
        
        // Assign points based on position
        if (position === 1) points = 25;
        else if (position === 2) points = 20;
        else if (position === 3) points = 16;
        else if (position === 4) points = 13;
        else if (position === 5) points = 11;
        else if (position === 6) points = 10;
        else if (position <= 15) points = 15 - position + 1;
        
        const updateSql = `
            UPDATE results 
            SET calendar_id = ?, rider_id = ?, team_id = ?, 
                position = ?, points = ?, race_time = ?
            WHERE result_id = ?`;
        
        pool.query(updateSql, [calendar_id, rider_id, team_id, position, points, race_time, req.params.id], (err) => {
            if (err) {
                console.error('Error updating result:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Result updated successfully' });
        });
    });
});

// Delete a result
app.delete('/api/results/:id', requireAuth, (req, res) => {
    const sql = 'DELETE FROM results WHERE result_id = ?';
    pool.query(sql, [req.params.id], (err) => {
        if (err) {
            console.error('Error deleting result:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json({ message: 'Result deleted successfully' });
    });
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

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
