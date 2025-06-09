-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 04, 2025 at 11:04 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `motogp`
--

-- --------------------------------------------------------

--
-- Table structure for table `calendar`
--

CREATE TABLE `calendar` (
  `calendar_id` int(11) NOT NULL,
  `race_name` varchar(100) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calendar`
--

INSERT INTO `calendar` (`calendar_id`, `race_name`, `country`, `start_date`, `end_date`) VALUES
(1, 'PT Grand Prix of Thailand', 'THAILAND', '2025-02-28', '2025-03-02'),
(2, 'Gran Premio YPF Energía de Argentina', 'ARGENTINA', '2025-03-14', '2025-03-16'),
(3, 'Red Bull Grand Prix of The Americas', 'USA', '2025-03-28', '2025-03-30'),
(4, 'Qatar Airways Grand Prix of Qatar', 'QATAR', '2025-04-11', '2025-04-13'),
(5, 'Estrella Galicia 0,0 Grand Prix of Spain', 'SPAIN', '2025-04-25', '2025-04-27'),
(6, 'Michelin Grand Prix of France', 'FRANCE', '2025-05-09', '2025-05-11'),
(7, 'Tissot Grand Prix of the United Kingdom', 'UNITED KINGDOM', '2025-05-23', '2025-05-25'),
(8, 'GoPro Grand Prix of Aragon', 'ARAGON', '2025-06-06', '2025-06-08'),
(9, 'Brembo Grand Prix of Italy', 'ITALY', '2025-06-20', '2025-06-22'),
(10, 'Motul Grand Prix of the Netherlands', 'NETHERLANDS', '2025-06-27', '2025-06-29'),
(11, 'Liqui Moly Grand Prix of Germany', 'GERMANY', '2025-07-11', '2025-07-13'),
(12, 'Grand Prix of Czechia', 'CZECHIA', '2025-07-18', '2025-07-20'),
(13, 'Grand Prix of Austria', 'AUSTRIA', '2025-08-15', '2025-08-17'),
(14, 'Grand Prix of Hungary', 'HUNGARY', '2025-08-22', '2025-08-24'),
(15, 'Monster Energy Grand Prix of Catalonia', 'CATALONIA', '2025-09-05', '2025-09-07'),
(16, 'Red Bull Grand Prix of San Marino and the Rimini Riviera', 'SAN MARINO', '2025-09-12', '2025-09-14'),
(17, 'Motul Grand Prix of Japan', 'JAPAN', '2025-09-26', '2025-09-28'),
(18, 'Pertamina Grand Prix of Indonesia', 'INDONESIA', '2025-10-03', '2025-10-05'),
(19, 'Australian Motorcycle Grand Prix', 'AUSTRALIA', '2025-10-17', '2025-10-19'),
(20, 'Petronas Grand Prix of Malaysia', 'MALAYSIA', '2025-10-24', '2025-10-26'),
(21, 'Qatar Airways Grand Prix of Portugal', 'PORTUGAL', '2025-11-07', '2025-11-09'),
(22, 'Motul Grand Prix of the Valencian Community', 'VALENCIA', '2025-11-14', '2025-11-16');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE `login` (
  `login_id` int(11) NOT NULL,
  `usename` varchar(20) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`login_id`, `usename`, `password`) VALUES
(1, 'admin', '123456'),
(2, '1', '1');

-- --------------------------------------------------------

--
-- Table structure for table `results`
--

CREATE TABLE `results` (
  `result_id` int(11) NOT NULL,
  `calendar_id` int(11) DEFAULT NULL,
  `rider_id` int(11) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `points` int(11) DEFAULT NULL,
  `race_time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `results`
--

INSERT INTO `results` (`result_id`, `calendar_id`, `rider_id`, `team_id`, `position`, `points`, `race_time`) VALUES
(1, 1, 6, 3, 1, 25, '00:40:55'),
(2, 1, 3, 2, 2, 20, '00:41:03'),
(3, 1, 5, 3, 3, 16, '00:41:15'),
(4, 1, 13, 7, 4, 13, '00:41:28'),
(5, 1, 9, 5, 5, 11, '00:41:40'),
(6, 1, 14, 7, 6, 10, '00:41:53'),
(7, 1, 2, 1, 7, 9, '00:42:05'),
(8, 1, 8, 4, 8, 8, '00:42:18'),
(9, 1, 17, 9, 9, 7, '00:42:30'),
(10, 1, 4, 2, 10, 6, '00:42:45'),
(11, 1, 18, 9, 11, 5, '00:42:55'),
(12, 1, 15, 8, 12, 4, '00:43:05'),
(13, 1, 7, 4, 13, 3, '00:43:17'),
(14, 1, 12, 6, 14, 2, '00:43:25'),
(15, 1, 11, 6, 15, 1, '00:43:40'),
(16, 1, 1, 1, 16, 0, '00:44:00'),
(17, 1, 16, 8, 17, 0, '00:44:10'),
(18, 1, 19, 10, 18, 0, '00:44:30'),
(19, 1, 20, 10, 19, 0, NULL),
(20, 1, 21, 11, 20, 0, NULL),
(21, 1, 22, 11, 21, 0, NULL),
(22, 1, 10, 5, 22, 0, NULL),
(23, 2, 6, 3, 1, 25, '00:39:50'),
(24, 2, 3, 2, 2, 20, '00:39:58'),
(25, 2, 5, 3, 3, 16, '00:40:10'),
(26, 2, 13, 7, 4, 13, '00:40:22'),
(27, 2, 9, 5, 5, 11, '00:40:34'),
(28, 2, 14, 7, 6, 10, '00:40:46'),
(29, 2, 2, 1, 7, 9, '00:40:55'),
(30, 2, 8, 4, 8, 8, '00:41:05'),
(31, 2, 17, 9, 9, 7, '00:41:12'),
(32, 2, 4, 2, 10, 6, '00:41:20'),
(33, 2, 18, 9, 11, 5, '00:41:28'),
(34, 2, 15, 8, 12, 4, '00:41:36'),
(35, 2, 7, 4, 13, 3, '00:41:44'),
(36, 2, 12, 6, 14, 2, '00:41:52'),
(37, 2, 11, 6, 15, 1, '00:42:00'),
(38, 2, 1, 1, 16, 0, '00:42:08'),
(39, 2, 16, 8, 17, 0, '00:42:15'),
(40, 2, 19, 10, 18, 0, '00:42:23'),
(41, 2, 20, 10, 19, 0, NULL),
(42, 2, 21, 11, 20, 0, NULL),
(43, 2, 22, 11, 21, 0, NULL),
(44, 2, 10, 5, 22, 0, NULL),
(45, 3, 3, 2, 1, 25, '00:41:05'),
(46, 3, 6, 3, 2, 20, '00:41:13'),
(47, 3, 5, 3, 3, 16, '00:41:25'),
(48, 3, 13, 7, 4, 13, '00:41:38'),
(49, 3, 9, 5, 5, 11, '00:41:49'),
(50, 3, 14, 7, 6, 10, '00:41:59'),
(51, 3, 2, 1, 7, 9, '00:42:09'),
(52, 3, 8, 4, 8, 8, '00:42:18'),
(53, 3, 17, 9, 9, 7, '00:42:26'),
(54, 3, 4, 2, 10, 6, '00:42:34'),
(55, 3, 18, 9, 11, 5, '00:42:42'),
(56, 3, 15, 8, 12, 4, '00:42:50'),
(57, 3, 7, 4, 13, 3, '00:42:58'),
(58, 3, 12, 6, 14, 2, '00:43:06'),
(59, 3, 11, 6, 15, 1, '00:43:14'),
(60, 3, 1, 1, 16, 0, '00:43:22'),
(61, 3, 16, 8, 17, 0, '00:43:30'),
(62, 3, 19, 10, 18, 0, '00:43:38'),
(63, 3, 20, 10, 19, 0, NULL),
(64, 3, 21, 11, 20, 0, NULL),
(65, 3, 22, 11, 21, 0, NULL),
(66, 3, 10, 5, 22, 0, NULL),
(67, 4, 6, 3, 1, 25, '00:40:10'),
(68, 4, 3, 2, 2, 20, '00:40:18'),
(69, 4, 5, 3, 3, 16, '00:40:26'),
(70, 4, 13, 7, 4, 13, '00:40:35'),
(71, 4, 9, 5, 5, 11, '00:40:44'),
(72, 4, 14, 7, 6, 10, '00:40:53'),
(73, 4, 2, 1, 7, 9, '00:41:01'),
(74, 4, 8, 4, 8, 8, '00:41:09'),
(75, 4, 17, 9, 9, 7, '00:41:18'),
(76, 4, 4, 2, 10, 6, '00:41:27'),
(77, 4, 18, 9, 11, 5, '00:41:36'),
(78, 4, 15, 8, 12, 4, '00:41:45'),
(79, 4, 7, 4, 13, 3, '00:41:54'),
(80, 4, 12, 6, 14, 2, '00:42:02'),
(81, 4, 11, 6, 15, 1, '00:42:11'),
(82, 4, 1, 1, 16, 0, '00:42:20'),
(83, 4, 16, 8, 17, 0, '00:42:29'),
(84, 4, 19, 10, 18, 0, '00:42:37'),
(85, 4, 20, 10, 19, 0, NULL),
(86, 4, 21, 11, 20, 0, NULL),
(87, 4, 22, 11, 21, 0, NULL),
(88, 4, 10, 5, 22, 0, NULL),
(89, 5, 3, 2, 1, 25, '00:40:45'),
(90, 5, 6, 3, 2, 20, '00:40:52'),
(91, 5, 5, 3, 3, 16, '00:41:01'),
(92, 5, 13, 7, 4, 13, '00:41:12'),
(93, 5, 9, 5, 5, 11, '00:41:22'),
(94, 5, 14, 7, 6, 10, '00:41:31'),
(95, 5, 2, 1, 7, 9, '00:41:41'),
(96, 5, 8, 4, 8, 8, '00:41:49'),
(97, 5, 17, 9, 9, 7, '00:41:58'),
(98, 5, 4, 2, 10, 6, '00:42:07'),
(99, 5, 18, 9, 11, 5, '00:42:15'),
(100, 5, 15, 8, 12, 4, '00:42:24'),
(101, 5, 7, 4, 13, 3, '00:42:33'),
(102, 5, 12, 6, 14, 2, '00:42:41'),
(103, 5, 11, 6, 15, 1, '00:42:50'),
(104, 5, 1, 1, 16, 0, '00:42:59'),
(105, 5, 16, 8, 17, 0, '00:43:07'),
(106, 5, 19, 10, 18, 0, '00:43:16'),
(107, 5, 20, 10, 19, 0, NULL),
(108, 5, 21, 11, 20, 0, NULL),
(109, 5, 22, 11, 21, 0, NULL),
(110, 5, 10, 5, 22, 0, NULL),
(111, 6, 6, 3, 1, 25, '00:39:55'),
(112, 6, 3, 2, 2, 20, '00:40:03'),
(113, 6, 5, 3, 3, 16, '00:40:14'),
(114, 6, 13, 7, 4, 13, '00:40:23'),
(115, 6, 9, 5, 5, 11, '00:40:33'),
(116, 6, 14, 7, 6, 10, '00:40:42'),
(117, 6, 2, 1, 7, 9, '00:40:51'),
(118, 6, 8, 4, 8, 8, '00:41:00'),
(119, 6, 17, 9, 9, 7, '00:41:09'),
(120, 6, 4, 2, 10, 6, '00:41:17'),
(121, 6, 18, 9, 11, 5, '00:41:25'),
(122, 6, 15, 8, 12, 4, '00:41:33'),
(123, 6, 7, 4, 13, 3, '00:41:41'),
(124, 6, 12, 6, 14, 2, '00:41:49'),
(125, 6, 11, 6, 15, 1, '00:41:57'),
(126, 6, 1, 1, 16, 0, '00:42:05'),
(127, 6, 16, 8, 17, 0, '00:42:12'),
(128, 6, 19, 10, 18, 0, '00:42:20'),
(129, 6, 20, 10, 19, 0, NULL),
(130, 6, 21, 11, 20, 0, NULL),
(131, 6, 22, 11, 21, 0, NULL),
(132, 6, 10, 5, 22, 0, NULL),
(133, 7, 3, 2, 1, 25, '00:41:20'),
(134, 7, 6, 3, 2, 20, '00:41:27'),
(135, 7, 5, 3, 3, 16, '00:41:36'),
(136, 7, 13, 7, 4, 13, '00:41:45'),
(137, 7, 9, 5, 5, 11, '00:41:54'),
(138, 7, 14, 7, 6, 10, '00:42:02'),
(139, 7, 2, 1, 7, 9, '00:42:11'),
(140, 7, 8, 4, 8, 8, '00:42:19'),
(141, 7, 17, 9, 9, 7, '00:42:27'),
(142, 7, 4, 2, 10, 6, '00:42:35'),
(143, 7, 18, 9, 11, 5, '00:42:43'),
(144, 7, 15, 8, 12, 4, '00:42:51'),
(145, 7, 7, 4, 13, 3, '00:42:59'),
(146, 7, 12, 6, 14, 2, '00:43:07'),
(147, 7, 11, 6, 15, 1, '00:43:15'),
(148, 7, 1, 1, 16, 0, '00:43:23'),
(149, 7, 16, 8, 17, 0, '00:43:31'),
(150, 7, 19, 10, 18, 0, '00:43:39'),
(151, 7, 20, 10, 19, 0, NULL),
(152, 7, 21, 11, 20, 0, NULL),
(153, 7, 22, 11, 21, 0, NULL),
(154, 7, 10, 5, 22, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `riders`
--

CREATE TABLE `riders` (
  `rider_id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `country` varchar(50) DEFAULT NULL,
  `image_url` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `riders`
--

INSERT INTO `riders` (`rider_id`, `name`, `team_id`, `country`, `image_url`) VALUES
(1, 'Jorge Martín', 1, 'Spain', 'martin.webp'),
(2, 'Marco Bezzecchi', 1, 'Italy', 'bezzecchi.webp'),
(3, 'Álex Márquez', 2, 'Spain', 'alex_marquez.webp'),
(4, 'Fermín Aldeguer', 2, 'Spain', 'aldeguer.webp'),
(5, 'Francesco Bagnaia', 3, 'Italy', 'bagnaia.webp'),
(6, 'Marc Márquez', 3, 'Spain', 'marc_marquez.webp'),
(7, 'Joan Mir', 4, 'Spain', 'mir.webp'),
(8, 'Luca Marini', 4, 'Italy', 'marini.webp'),
(9, 'Johann Zarco', 5, 'France', 'zarco.webp'),
(10, 'Somkiat Chantra', 5, 'Thailand', 'chantra.webp'),
(11, 'Fabio Quartararo', 6, 'France', 'quartararo.webp'),
(12, 'Álex Rins', 6, 'Spain', 'rins.webp'),
(13, 'Franco Morbidelli', 7, 'Italy', 'morbidelli.webp'),
(14, 'Fabio Di Giannantonio', 7, 'Italy', 'digia.webp'),
(15, 'Jack Miller', 8, 'Australia', 'miller.webp'),
(16, 'Miguel Oliveira', 8, 'Portugal', 'oliveira.webp'),
(17, 'Brad Binder', 9, 'South Africa', 'binder.webp'),
(18, 'Pedro Acosta', 9, 'Spain', 'acosta.webp'),
(19, 'Enea Bastianini', 10, 'Italy', 'bastianini.webp'),
(20, 'Maverick Viñales', 10, 'Spain', 'vinales.webp'),
(21, 'Raúl Fernández', 11, 'Spain', 'raul_fernandez.webp'),
(22, 'Ai Ogura', 11, 'Japan', 'ogura.webp');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `team_id` int(11) NOT NULL,
  `team_name` varchar(100) DEFAULT NULL,
  `rider1_id` int(11) DEFAULT NULL,
  `rider2_id` int(11) DEFAULT NULL,
  `team_picture` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`team_id`, `team_name`, `rider1_id`, `rider2_id`, `team_picture`) VALUES
(1, 'Aprilia Racing', 1, 2, 'Aprilia.webp'),
(2, 'Bk8 Gresini Racing MotoGP', 3, 4, 'Bk8.webp'),
(3, 'Ducati Lenovo Team', 5, 6, 'Ducati.webp'),
(4, 'Honda HRC Castrol', 7, 8, 'Honda.webp'),
(5, 'LCR Honda', 9, 10, 'lcr.webp'),
(6, 'Monster Energy Yamaha MotoGP', 11, 12, 'Monster.webp'),
(7, 'Pertamina Enduro VR46 Racing Team', 13, 14, 'Pertamina.webp'),
(8, 'Prima Pramac Yamaha MotoGP', 15, 16, 'Prima.webp'),
(9, 'Red Bull KTM Factory Racing', 17, 18, 'Factory.webp'),
(10, 'Red Bull KTM Tech3', 19, 20, 'Tech3.webp'),
(11, 'Trackhouse MotoGP Team', 21, 22, 'Trackhouse.webp');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `calendar`
--
ALTER TABLE `calendar`
  ADD PRIMARY KEY (`calendar_id`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`login_id`);

--
-- Indexes for table `results`
--
ALTER TABLE `results`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `fk_calendar` (`calendar_id`),
  ADD KEY `fk_rider` (`rider_id`);

--
-- Indexes for table `riders`
--
ALTER TABLE `riders`
  ADD PRIMARY KEY (`rider_id`),
  ADD KEY `fk_team` (`team_id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`team_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calendar`
--
ALTER TABLE `calendar`
  MODIFY `calendar_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `login_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `results`
--
ALTER TABLE `results`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT for table `riders`
--
ALTER TABLE `riders`
  MODIFY `rider_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `team_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `results`
--
ALTER TABLE `results`
  ADD CONSTRAINT `fk_calendar` FOREIGN KEY (`calendar_id`) REFERENCES `calendar` (`calendar_id`),
  ADD CONSTRAINT `fk_rider` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`rider_id`);

--
-- Constraints for table `riders`
--
ALTER TABLE `riders`
  ADD CONSTRAINT `fk_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
