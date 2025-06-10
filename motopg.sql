-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: motogp
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `calendar`
--

DROP TABLE IF EXISTS `calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar` (
  `calendar_id` int NOT NULL AUTO_INCREMENT,
  `race_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`calendar_id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar`
--

LOCK TABLES `calendar` WRITE;
/*!40000 ALTER TABLE `calendar` DISABLE KEYS */;
INSERT INTO `calendar` VALUES (1,'PT Grand Prix of Thailand','THAILAND','2025-02-28','2025-03-02'),(2,'Gran Premio YPF Energía de Argentina','ARGENTINA','2025-03-14','2025-03-16'),(3,'Red Bull Grand Prix of The Americas','USA','2025-03-28','2025-03-30'),(4,'Qatar Airways Grand Prix of Qatar','QATAR','2025-04-11','2025-04-13'),(5,'Estrella Galicia 0,0 Grand Prix of Spain','SPAIN','2025-04-25','2025-04-27'),(6,'Michelin Grand Prix of France','FRANCE','2025-05-09','2025-05-11'),(7,'Tissot Grand Prix of the United Kingdom','UNITED KINGDOM','2025-05-23','2025-05-25'),(8,'GoPro Grand Prix of Aragon','ARAGON','2025-06-06','2025-06-08'),(9,'Brembo Grand Prix of Italy','ITALY','2025-06-20','2025-06-22'),(10,'Motul Grand Prix of the Netherlands','NETHERLANDS','2025-06-27','2025-06-29'),(11,'Liqui Moly Grand Prix of Germany','GERMANY','2025-07-11','2025-07-13'),(12,'Grand Prix of Czechia','CZECHIA','2025-07-18','2025-07-20'),(13,'Grand Prix of Austria','AUSTRIA','2025-08-15','2025-08-17'),(14,'Grand Prix of Hungary','HUNGARY','2025-08-22','2025-08-24'),(15,'Monster Energy Grand Prix of Catalonia','CATALONIA','2025-09-05','2025-09-07'),(16,'Red Bull Grand Prix of San Marino and the Rimini Riviera','SAN MARINO','2025-09-12','2025-09-14'),(17,'Motul Grand Prix of Japan','JAPAN','2025-09-26','2025-09-28'),(18,'Pertamina Grand Prix of Indonesia','INDONESIA','2025-10-03','2025-10-05'),(19,'Australian Motorcycle Grand Prix','AUSTRALIA','2025-10-17','2025-10-19'),(20,'Petronas Grand Prix of Malaysia','MALAYSIA','2025-10-24','2025-10-26'),(21,'Qatar Airways Grand Prix of Portugal','PORTUGAL','2025-11-07','2025-11-09'),(22,'Motul Grand Prix of the Valencian Community','VALENCIA','2025-11-14','2025-11-16');
/*!40000 ALTER TABLE `calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login` (
  `login_id` int NOT NULL AUTO_INCREMENT,
  `usename` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`login_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login`
--

LOCK TABLES `login` WRITE;
/*!40000 ALTER TABLE `login` DISABLE KEYS */;
INSERT INTO `login` VALUES (1,'admin','123456'),(2,'1','1');
/*!40000 ALTER TABLE `login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `results` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `calendar_id` int DEFAULT NULL,
  `rider_id` int DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `race_time` time DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  KEY `fk_calendar` (`calendar_id`),
  KEY `fk_rider` (`rider_id`),
  CONSTRAINT `fk_calendar` FOREIGN KEY (`calendar_id`) REFERENCES `calendar` (`calendar_id`),
  CONSTRAINT `fk_rider` FOREIGN KEY (`rider_id`) REFERENCES `riders` (`rider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `results`
--

LOCK TABLES `results` WRITE;
/*!40000 ALTER TABLE `results` DISABLE KEYS */;
INSERT INTO `results` VALUES (1,1,6,3,1,25,'01:39:27'),(2,1,3,2,2,20,'01:39:32'),(3,1,5,3,3,16,'01:39:34'),(4,1,13,7,4,13,'01:39:39'),(5,1,22,11,5,11,'01:39:46'),(6,1,2,1,6,10,'01:40:07'),(7,1,9,5,7,9,'01:40:15'),(8,1,17,9,8,8,'01:40:20'),(9,1,19,10,9,7,'01:40:22'),(10,1,14,7,10,6,'01:40:36'),(11,1,15,8,11,5,'01:40:43'),(12,1,8,4,12,4,'01:40:49'),(13,1,4,2,13,3,'01:40:55'),(14,1,7,4,14,2,'01:41:08'),(15,1,16,8,15,1,'01:41:11'),(16,1,12,6,16,0,'01:41:15'),(17,1,11,6,17,0,'01:41:21'),(18,1,10,5,18,0,'01:41:30'),(19,1,18,9,19,0,'01:41:31'),(20,1,1,1,20,0,'01:41:37'),(21,2,6,3,1,25,'41:11:00'),(22,2,3,2,2,20,'41:12:22'),(23,2,13,7,3,16,'41:15:06'),(24,2,5,3,4,13,'41:16:07'),(25,2,14,7,5,11,'41:18:09'),(26,2,9,5,6,10,'41:18:22'),(27,2,17,9,7,9,'41:25:14'),(28,2,18,9,8,8,'41:26:56'),(29,2,7,4,9,7,'41:27:48'),(30,2,8,4,10,6,'41:28:02'),(31,2,12,6,11,5,'41:30:10'),(32,2,20,10,12,4,'41:30:59'),(33,2,15,8,13,3,'41:31:55'),(34,2,11,6,14,2,'41:32:05'),(35,2,21,11,15,1,'41:35:03'),(36,2,4,2,16,0,'41:35:20'),(37,2,19,10,17,0,'41:40:45'),(38,2,10,5,18,0,'41:41:41'),(39,3,5,3,1,25,'39:00:19'),(40,3,3,2,2,20,'39:02:28'),(41,3,14,7,3,16,'39:04:19'),(42,3,13,7,4,13,'39:10:59'),(43,3,15,8,5,11,'39:11:51'),(44,3,2,1,6,10,'39:12:14'),(45,3,19,10,7,9,'39:12:49'),(46,3,8,4,8,8,'39:15:38'),(47,3,22,11,9,7,'39:16:20'),(48,3,11,6,10,6,'39:18:15'),(49,3,12,6,11,5,'39:24:26'),(50,3,21,11,12,4,'39:27:54'),(51,3,16,8,13,3,'39:30:54'),(52,3,20,10,14,2,'39:42:44'),(53,3,1,1,15,1,'39:46:24'),(54,3,10,5,16,0,'39:53:01'),(55,3,9,5,17,0,'40:03:01'),(56,4,6,3,1,25,'41:29:18'),(57,4,5,3,2,20,'41:33:43'),(58,4,13,7,3,16,'41:36:41'),(59,4,9,5,4,13,'41:37:12'),(60,4,4,2,5,11,'41:38:45'),(61,4,3,2,6,10,'41:40:18'),(62,4,11,6,7,9,'41:41:13'),(63,4,18,9,8,8,'41:42:35'),(64,4,2,1,9,7,'41:43:35'),(65,4,8,4,10,6,'41:44:42'),(66,4,19,10,11,5,'41:45:45'),(67,4,12,6,12,4,'41:46:20'),(68,4,17,9,13,3,'41:46:41'),(69,4,20,10,14,2,'41:47:00'),(70,4,22,11,15,1,'41:47:18'),(71,4,14,7,16,0,'41:54:58'),(72,4,21,11,17,0,'41:55:23'),(73,4,10,5,18,0,'41:59:04'),(74,5,3,2,1,25,'40:56:37'),(75,5,11,6,2,20,'40:58:02'),(76,5,5,3,3,16,'40:58:54'),(77,5,20,10,4,13,'41:01:03'),(78,5,14,7,5,11,'41:01:25'),(79,5,16,8,6,10,'41:03:10'),(80,5,17,9,7,9,'41:03:27'),(81,5,18,9,8,8,'41:06:18'),(82,5,22,11,9,7,'41:06:29'),(83,5,19,10,10,6,'41:07:57'),(84,5,8,4,11,5,'41:08:32'),(85,5,9,5,12,4,'41:09:04'),(86,5,6,3,13,3,'41:14:10'),(87,5,12,6,14,2,'41:14:55'),(88,5,2,1,15,1,'41:22:18'),(89,5,4,2,16,0,'41:25:27'),(90,5,7,4,17,0,'41:26:53'),(91,5,1,1,18,0,'41:30:03'),(92,6,9,5,1,25,'46:47:54'),(93,6,6,3,2,20,'46:47:54'),(94,6,4,2,3,16,'46:47:54'),(95,6,18,9,4,13,'46:47:54'),(96,6,20,10,5,11,'46:47:54'),(97,6,8,4,6,10,'46:47:54'),(98,6,21,11,7,9,'46:47:54'),(99,6,14,7,8,8,'46:47:54'),(100,6,1,1,9,7,'46:47:54'),(101,6,22,11,10,6,'46:47:54'),(102,6,8,4,11,5,'46:47:54'),(103,6,12,6,12,4,'46:47:54'),(104,6,19,10,13,3,'46:47:54'),(105,6,2,1,14,2,'46:47:54'),(106,6,13,7,15,1,'46:47:54'),(107,6,5,3,16,0,'46:47:54'),(108,7,2,1,1,25,'38:16:03'),(109,7,9,5,2,20,'38:20:11'),(110,7,6,3,3,16,'38:22:32'),(111,7,13,7,4,13,'38:22:33'),(112,7,3,2,5,11,'38:23:07'),(113,7,18,9,6,10,'38:24:12'),(114,7,15,8,7,9,'38:24:31'),(115,7,4,2,8,8,'38:24:51'),(116,7,14,7,9,7,'38:25:05'),(117,7,7,4,10,6,'38:25:09'),(118,7,8,4,11,5,'38:25:32'),(119,7,12,6,12,4,'38:25:33'),(120,7,19,10,13,3,'38:25:33'),(121,7,20,10,14,2,'38:25:35'),(122,7,8,4,15,1,'38:30:15'),(123,7,16,8,16,0,'38:38:54'),(124,7,21,11,17,0,'38:54:28'),(125,7,1,1,18,0,'38:56:49'),(126,7,10,5,19,0,'39:01:08');
/*!40000 ALTER TABLE `results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `riders`
--

DROP TABLE IF EXISTS `riders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `riders` (
  `rider_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `image_url` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`rider_id`),
  KEY `fk_team` (`team_id`),
  CONSTRAINT `fk_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `riders`
--

LOCK TABLES `riders` WRITE;
/*!40000 ALTER TABLE `riders` DISABLE KEYS */;
INSERT INTO `riders` VALUES (1,'Jorge Martín',1,'Spain','martin.webp'),(2,'Marco Bezzecchi',1,'Italy','bezzecchi.webp'),(3,'Álex Márquez',2,'Spain','alex_marquez.webp'),(4,'Fermín Aldeguer',2,'Spain','aldeguer.webp'),(5,'Francesco Bagnaia',3,'Italy','bagnaia.webp'),(6,'Marc Márquez',3,'Spain','marc_marquez.webp'),(7,'Joan Mir',4,'Spain','mir.webp'),(8,'Luca Marini',4,'Italy','marini.webp'),(9,'Johann Zarco',5,'France','zarco.webp'),(10,'Somkiat Chantra',5,'Thailand','chantra.webp'),(11,'Fabio Quartararo',6,'France','quartararo.webp'),(12,'Álex Rins',6,'Spain','rins.webp'),(13,'Franco Morbidelli',7,'Italy','morbidelli.webp'),(14,'Fabio Di Giannantonio',7,'Italy','digia.webp'),(15,'Jack Miller',8,'Australia','miller.webp'),(16,'Miguel Oliveira',8,'Portugal','oliveira.webp'),(17,'Brad Binder',9,'South Africa','binder.webp'),(18,'Pedro Acosta',9,'Spain','acosta.webp'),(19,'Enea Bastianini',10,'Italy','bastianini.webp'),(20,'Maverick Viñales',10,'Spain','vinales.webp'),(21,'Raúl Fernández',11,'Spain','raul_fernandez.webp'),(22,'Ai Ogura',11,'Japan','ogura.webp');
/*!40000 ALTER TABLE `riders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `rider1_id` int DEFAULT NULL,
  `rider2_id` int DEFAULT NULL,
  `team_picture` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`team_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Aprilia Racing',1,2,'Aprilia.webp'),(2,'Bk8 Gresini Racing MotoGP',3,4,'Bk8.webp'),(3,'Ducati Lenovo Team',5,6,'Ducati.webp'),(4,'Honda HRC Castrol',7,8,'Honda.webp'),(5,'LCR Honda',9,10,'lcr.webp'),(6,'Monster Energy Yamaha MotoGP',11,12,'Monster.webp'),(7,'Pertamina Enduro VR46 Racing Team',13,14,'Pertamina.webp'),(8,'Prima Pramac Yamaha MotoGP',15,16,'Prima.webp'),(9,'Red Bull KTM Factory Racing',17,18,'Factory.webp'),(10,'Red Bull KTM Tech3',19,20,'Tech3.webp'),(11,'Trackhouse MotoGP Team',21,22,'Trackhouse.webp');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'motogp'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-10 23:25:35
