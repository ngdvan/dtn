/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.18-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: nhsvsvwx_seee_activity_hub_db
-- ------------------------------------------------------
-- Server version	10.11.18-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(180) NOT NULL,
  `description` text NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `public_image_url` varchar(1000) DEFAULT NULL,
  `proposal_document_url` varchar(1000) DEFAULT NULL,
  `type` enum('event','assigned') NOT NULL,
  `status` enum('proposed','approved','active','completed','cancelled') NOT NULL DEFAULT 'proposed',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `team_id` int(10) unsigned NOT NULL,
  `creator_id` int(10) unsigned NOT NULL,
  `requested_by` varchar(160) DEFAULT NULL,
  `location` varchar(180) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `deadline` date NOT NULL,
  `result_summary` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `team_id` (`team_id`),
  KEY `creator_id` (`creator_id`),
  KEY `activities_public` (`is_public`,`created_at`),
  FULLTEXT KEY `activity_search` (`title`,`description`,`result_summary`),
  CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `activities_ibfk_2` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` (`id`, `title`, `description`, `is_public`, `public_image_url`, `proposal_document_url`, `type`, `status`, `priority`, `team_id`, `creator_id`, `requested_by`, `location`, `start_date`, `deadline`, `result_summary`, `created_at`, `updated_at`) VALUES (2,'HÀNH TRÌNH SEEE MÊ','Chuỗi sự kiện online kỉ niệm 5 năm thành lập SEEE dành cho sinh viên, cựu sinh viên.',0,NULL,'https://drive.google.com/drive/folders/17mmUW90k4wbKIFbx5-4rNARuLjbCIdGq','event','proposed','high',5,68,NULL,NULL,'2026-08-10','2026-09-22',NULL,'2026-08-15 06:23:38','2026-08-22 10:04:34'),
(3,'CHÀO TÂN 2026 - SEEEWARTS','Em xin phép gửi BTV đề án chương trình Chào tân ạ. Do cần thông tin từ phía SKĐA nên phần dự trù trong đề án là dự trù đề xuất ạ: ',0,NULL,'https://docs.google.com/document/d/1dItLwYF7vp6DripT0zZwjPTKju0xcaN6/edit?usp=sharing&ouid=112274738490606723312&rtpof=true&sd=true','event','proposed','high',5,68,NULL,NULL,'2026-08-05','2026-10-02',NULL,'2026-08-15 16:32:59','2026-08-22 10:01:03'),
(4,'Tuyển CTV Ban Chấp hành ĐTN - HSV 2026 - 2027','Tuyển CTV cho BCH ĐTN - HSV Trường Điện - Điện tử năm học 2026 - 2027',0,NULL,'https://drive.google.com/drive/folders/1m3cCuUt-5wQd4P-UB4h2GJcqrsghG9E2?usp=drive_link','event','active','high',6,66,NULL,NULL,'2026-08-26','2026-09-16',NULL,'2026-08-18 01:46:30','2026-08-22 10:35:39'),
(5,'Tuyển BCS Khóa 71 Trường Điện - Điện tử','Tuyển BCS Khóa 71 Trường Điện - Điện tử',0,NULL,'https://drive.google.com/drive/folders/1cW_Bfd173n1SNSJg1hYfh26814hNLuok?usp=drive_link','event','proposed','high',6,66,NULL,NULL,'2026-09-07','2026-09-23',NULL,'2026-08-18 01:48:34','2026-08-21 07:56:48'),
(7,'Tuyển CTV Đội SVTN ngành ĐTVT lần 1 năm học 2026-2027','Tuyển nhân sự cho Đội SVTN ĐT - VT',0,NULL,'https://docs.google.com/document/d/1IgAPBRIevGnu24kBznmPlvZ4BAiH5Bhb/edit?usp=drive_link&ouid=105983365713106260020&rtpof=true&sd=true','event','active','high',9,98,NULL,NULL,'2026-09-07','2026-10-16',NULL,'2026-08-21 07:01:47','2026-08-25 11:28:06'),
(10,'Tập huấn cán bộ chủ chốt BCH ĐTN - HSV Trường Điện - Điện tử','Là hoạt động giúp mọi người hiểu rõ hơn về cơ chế hoạt động của BCH, ngoài ra cũng là sự kiện giúp gắn kết các thành viên với nhau',0,NULL,NULL,'event','completed','medium',1,97,NULL,'Công viên Yên Sở','2026-08-26','2026-08-26',NULL,'2026-08-22 10:52:42','2026-08-26 15:29:48'),
(14,'Tuyển CTV Đội SVTN ngành Điện kỳ 2026.1','\n- Đẩy mạnh các phong trào hành động cách mạng của tuổi trẻ; tổ chức thực hiện hiệu quả các công trình, phần việc thanh niên.\n\n\n- Nâng cao tính cộng đồng, kỹ năng làm việc nhóm, kỹ năng xã hội cho sinh viên tình nguyện; đào tạo nguồn Cán bộ Đoàn - Hội chủ chốt.\n',0,NULL,'https://drive.google.com/drive/folders/1wzdKwyHwWnm2OunpKhYZqTBGW7oeVqK7?usp=drive_link','event','active','medium',4,87,NULL,NULL,'2026-08-31','2026-09-15',NULL,'2026-08-24 10:15:11','2026-08-26 15:30:02'),
(20,'Gặp mặt cựu giáo chức và BLĐ Trường Điện - Điện tử','Hỗ trợ đón tiếp cựu giáo chức',0,NULL,NULL,'assigned','active','high',1,2,'BGH Trường','E615 C7',NULL,'2026-09-12',NULL,'2026-08-28 06:18:34','2026-08-28 06:42:28'),
(21,'Chào tân sinh viên toàn ĐHBKHN','Chào tân sinh viên k71 cấp ĐH\nTừ 25 - 26/09',0,NULL,NULL,'assigned','approved','medium',1,2,'Đoàn ĐH','Sân Tạ Quang Bửu',NULL,'2026-09-25',NULL,'2026-08-28 07:03:57','2026-08-28 07:11:44');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_teams`
--

DROP TABLE IF EXISTS `activity_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_teams` (
  `activity_id` int(10) unsigned NOT NULL,
  `team_id` int(10) unsigned NOT NULL,
  `role` enum('primary','supporting') NOT NULL DEFAULT 'supporting',
  `responsibility` varchar(255) DEFAULT NULL,
  `contact_user_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`activity_id`,`team_id`),
  KEY `team_id` (`team_id`),
  KEY `contact_user_id` (`contact_user_id`),
  CONSTRAINT `activity_teams_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `activity_teams_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `activity_teams_ibfk_3` FOREIGN KEY (`contact_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_teams`
--

LOCK TABLES `activity_teams` WRITE;
/*!40000 ALTER TABLE `activity_teams` DISABLE KEYS */;
INSERT INTO `activity_teams` (`activity_id`, `team_id`, `role`, `responsibility`, `contact_user_id`) VALUES (2,5,'primary','Coordinates the activity',NULL),
(3,5,'primary','Coordinates the activity',NULL),
(4,6,'primary','Coordinates the activity',NULL),
(5,6,'primary','Coordinates the activity',NULL),
(7,9,'primary','Coordinates the activity',NULL),
(10,1,'primary','Coordinates the activity',NULL),
(10,2,'supporting','Supports the activity',NULL),
(10,3,'supporting','Supports the activity',NULL),
(10,4,'supporting','Supports the activity',NULL),
(10,5,'supporting','Supports the activity',NULL),
(10,6,'supporting','Supports the activity',NULL),
(10,7,'supporting','Supports the activity',NULL),
(10,8,'supporting','Supports the activity',NULL),
(10,9,'supporting','Supports the activity',NULL),
(10,10,'supporting','Supports the activity',NULL),
(10,11,'supporting','Supports the activity',NULL),
(14,4,'primary','Coordinates the activity',NULL),
(20,1,'primary','Coordinates the activity',NULL),
(20,2,'supporting','Supports the activity',NULL),
(20,3,'supporting','Supports the activity',NULL),
(20,4,'supporting','Supports the activity',NULL),
(20,5,'supporting','Supports the activity',NULL),
(20,6,'supporting','Supports the activity',NULL),
(20,7,'supporting','Supports the activity',NULL),
(20,9,'supporting','Supports the activity',NULL),
(20,10,'supporting','Supports the activity',NULL),
(21,1,'primary','Coordinates the activity',NULL),
(21,8,'supporting','Supports the activity',NULL),
(21,11,'supporting','Supports the activity',NULL);
/*!40000 ALTER TABLE `activity_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `link_url` varchar(1000) NOT NULL,
  `description` text NOT NULL,
  `applicable_year` smallint(5) unsigned NOT NULL,
  `issuing_team_id` int(10) unsigned NOT NULL,
  `visibility` enum('all_teams','issuing_team') NOT NULL DEFAULT 'issuing_team',
  `created_by` int(10) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `documents_year` (`applicable_year`),
  KEY `documents_team` (`issuing_team_id`),
  KEY `fk_documents_creator` (`created_by`),
  CONSTRAINT `fk_documents_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_documents_team` FOREIGN KEY (`issuing_team_id`) REFERENCES `teams` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` (`id`, `name`, `link_url`, `description`, `applicable_year`, `issuing_team_id`, `visibility`, `created_by`, `created_at`, `updated_at`) VALUES (2,'Dự trù hoạt động năm 2026-2027','https://docs.google.com/spreadsheets/d/1_xYy7K2UXcV_V45pbaW1CG4uuDFu24hrXWAMgDqH6uM/edit?usp=sharing','Dự trù và kế hoạch các hoạt động sắp tới của BCH Đoàn thanh niên - Hội sinh viên trường Điện - Điện tử năm học 2026 - 2027.',2026,1,'issuing_team',64,'2026-08-23 04:10:51','2026-08-23 04:10:51');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(10) unsigned NOT NULL,
  `activity_id` int(10) unsigned DEFAULT NULL,
  `task_id` int(10) unsigned DEFAULT NULL,
  `kind` varchar(50) NOT NULL,
  `title` varchar(180) NOT NULL,
  `body` varchar(500) NOT NULL,
  `url` varchar(500) DEFAULT NULL,
  `source_key` varchar(190) NOT NULL,
  `seen_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `notifications_user_source` (`user_id`,`source_key`),
  KEY `notifications_inbox` (`user_id`,`seen_at`,`created_at`),
  KEY `notifications_expiry` (`expires_at`),
  KEY `notifications_activity` (`activity_id`),
  KEY `notifications_task` (`task_id`),
  CONSTRAINT `fk_notifications_activity` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_task` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2284 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` (`id`, `user_id`, `activity_id`, `task_id`, `kind`, `title`, `body`, `url`, `source_key`, `seen_at`, `expires_at`, `created_at`) VALUES (1,87,14,33,'task_deadline','Task due today','“Hoàn thiện đề án giấy tờ” in “Tuyển Cộng tác viên kỳ 20261” is due today.','/#activity/14','task-deadline:33:2026-08-24','2026-08-26 03:03:20','2026-08-31 12:18:19','2026-08-24 12:18:19'),
(2,87,14,34,'task_deadline','Task due today','“Hoàn thiện đề án giấy tờ” in “Tuyển Cộng tác viên kỳ 20261” is due today.','/#activity/14','task-deadline:34:2026-08-24','2026-08-26 03:03:20','2026-08-31 12:33:19','2026-08-24 12:33:19'),
(21,66,10,12,'task_deadline','Task due today','“Chuẩn bị các nội dung tập huấn ” in “Tập huấn cán bộ chủ chốt BCH ĐTN - HSV Trường Điện - Điện tử” is due today.','/#activity/10','task-deadline:12:2026-08-25','2026-08-25 13:51:28','2026-08-31 17:03:19','2026-08-24 17:03:19'),
(22,69,10,12,'task_deadline','Task due today','“Chuẩn bị các nội dung tập huấn ” in “Tập huấn cán bộ chủ chốt BCH ĐTN - HSV Trường Điện - Điện tử” is due today.','/#activity/10','task-deadline:12:2026-08-25','2026-08-24 17:19:55','2026-08-31 17:03:19','2026-08-24 17:03:19'),
(23,69,10,21,'task_deadline','Task due today','“Chuẩn bị hướng dẫn sử dụng hệ thống sv-seee” in “Tập huấn cán bộ chủ chốt BCH ĐTN - HSV Trường Điện - Điện tử” is due today.','/#activity/10','task-deadline:21:2026-08-25','2026-08-24 17:19:55','2026-08-31 17:03:19','2026-08-24 17:03:19'),
(24,71,4,31,'task_deadline','Task due today','“Làm Tờ trình mượn phòng, đặt bàn, treo ấn phẩm, quay chụp” in “Tuyển CTV Ban Chấp hành ĐTN - HSV 2026 - 2027” is due today.','/#activity/4','task-deadline:31:2026-08-25','2026-08-25 14:34:10','2026-08-31 17:03:19','2026-08-24 17:03:19'),
(25,72,4,31,'task_deadline','Task due today','“Làm Tờ trình mượn phòng, đặt bàn, treo ấn phẩm, quay chụp” in “Tuyển CTV Ban Chấp hành ĐTN - HSV 2026 - 2027” is due today.','/#activity/4','task-deadline:31:2026-08-25','2026-08-25 13:52:52','2026-08-31 17:03:19','2026-08-24 17:03:19'),
(26,73,4,31,'task_deadline','Task due today','“Làm Tờ trình mượn phòng, đặt bàn, treo ấn phẩm, quay chụp” in “Tuyển CTV Ban Chấp hành ĐTN - HSV 2026 - 2027” is due today.','/#activity/4','task-deadline:31:2026-08-25','2026-08-25 07:26:31','2026-08-31 17:03:19','2026-08-24 17:03:19'),
(27,124,4,31,'task_deadline','Task due today','“Làm Tờ trình mượn phòng, đặt bàn, treo ấn phẩm, quay chụp” in “Tuyển CTV Ban Chấp hành ĐTN - HSV 2026 - 2027” is due today.','/#activity/4','task-deadline:31:2026-08-25',NULL,'2026-08-31 17:03:19','2026-08-24 17:03:19'),
(2186,66,4,NULL,'comment_tag','You were tagged in a comment','Nguyễn Đình Văn tagged you in “Tuyển CTV Ban Chấp hành ĐTN - HSV 2026 - 2027”.','/#activity/4','comment-tag:31:66',NULL,'2026-09-03 05:35:22','2026-08-27 05:35:22'),
(2187,22,20,48,'task_deadline','Task due today','“Thiết kế giấy mời sự kiện” in “Gặp mặt cựu giáo chức và BLĐ Trường Điện - Điện tử” is due today.','/#activity/20','task-deadline:48:2026-08-28',NULL,'2026-09-04 06:24:31','2026-08-28 06:24:31'),
(2190,64,21,NULL,'comment_tag','You were tagged in a comment','Nguyễn Đình Văn tagged you in “Chào tân sinh viên toàn ĐHBKHN”.','/#activity/21','comment-tag:32:64','2026-08-28 09:49:00','2026-09-04 07:05:13','2026-08-28 07:05:13');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participants`
--

DROP TABLE IF EXISTS `participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `participants` (
  `activity_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `state` enum('volunteered','confirmed','declined') NOT NULL DEFAULT 'volunteered',
  `responsibility` varchar(255) DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`activity_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `participants_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participants`
--

LOCK TABLES `participants` WRITE;
/*!40000 ALTER TABLE `participants` DISABLE KEYS */;
INSERT INTO `participants` (`activity_id`, `user_id`, `state`, `responsibility`, `joined_at`) VALUES (4,66,'confirmed','Activity participant','2026-08-22 11:01:38'),
(4,69,'confirmed','Activity participant','2026-08-22 11:01:38'),
(4,70,'confirmed','Activity participant','2026-08-22 11:01:38'),
(4,71,'confirmed','Activity participant','2026-08-22 11:01:38'),
(4,72,'confirmed','Activity participant','2026-08-22 11:01:38'),
(4,73,'confirmed','Activity participant','2026-08-22 11:01:38'),
(4,97,'volunteered',NULL,'2026-08-18 07:51:19'),
(7,69,'confirmed','Activity participant','2026-08-24 01:48:57'),
(7,98,'volunteered',NULL,'2026-08-21 07:24:35'),
(7,99,'confirmed','Activity participant','2026-08-21 07:24:44'),
(7,100,'confirmed','Activity participant','2026-08-21 07:24:44'),
(10,2,'confirmed','Activity participant','2026-08-25 13:54:36'),
(10,21,'volunteered',NULL,'2026-08-24 18:52:28'),
(10,22,'volunteered',NULL,'2026-08-26 03:09:55'),
(10,53,'confirmed','Activity participant','2026-08-25 13:54:36'),
(10,97,'volunteered',NULL,'2026-08-24 14:32:38'),
(10,98,'volunteered',NULL,'2026-08-24 14:19:36'),
(10,101,'volunteered',NULL,'2026-08-24 14:57:08'),
(20,21,'confirmed','Activity participant','2026-08-28 06:19:29'),
(20,22,'confirmed','Activity participant','2026-08-28 06:19:29'),
(20,64,'confirmed','Activity participant','2026-08-28 06:18:50'),
(20,67,'confirmed','Activity participant','2026-08-28 06:18:50'),
(20,173,'confirmed','Activity participant','2026-08-28 06:18:50'),
(21,60,'confirmed','Activity participant','2026-08-28 07:04:48'),
(21,64,'confirmed','Activity participant','2026-08-28 07:04:48'),
(21,80,'confirmed','Activity participant','2026-08-28 12:35:50'),
(21,90,'confirmed','Activity participant','2026-08-28 12:35:50'),
(21,167,'confirmed','Activity participant','2026-08-28 07:04:48'),
(21,168,'confirmed','Activity participant','2026-08-28 07:04:48'),
(21,169,'confirmed','Activity participant','2026-08-28 07:04:48'),
(21,170,'confirmed','Activity participant','2026-08-28 07:04:48'),
(21,171,'confirmed','Activity participant','2026-08-28 07:04:48');
/*!40000 ALTER TABLE `participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schema_migrations`
--

DROP TABLE IF EXISTS `schema_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `schema_migrations` (
  `filename` varchar(255) NOT NULL,
  `checksum` char(64) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schema_migrations`
--

LOCK TABLES `schema_migrations` WRITE;
/*!40000 ALTER TABLE `schema_migrations` DISABLE KEYS */;
INSERT INTO `schema_migrations` (`filename`, `checksum`, `applied_at`) VALUES ('002_roles_multi_team.sql','e88825d6b7d6a96244111707bbc2f22111f8fa16f5010a922a5dd9b6fb77c02a','2026-08-21 03:12:56'),
('003_task_attachments.sql','a8b7852d0f00b71fffc2a7a90d84ce7ccfadf5925cd1a8d23bd0d8df82d322b2','2026-08-28 23:17:40'),
('003_task_evidence_demo_data.sql','5f34131faafa09a62f08954d341564244821e164d09c69b81022d955c9ccb5be','2026-08-21 03:12:56'),
('004_documents.sql','da291770e607b1d8c63c5cab0a530169e5bcd948db1b7890ffcb623fbbbe749d','2026-08-21 03:12:56'),
('005_document_visibility.sql','c50529e820fce1d0b6cfe11722a0c9daac4b6009a919c655db0027b653cf2ed5','2026-08-21 03:12:56'),
('006_activity_proposal_document.sql','3c7b19cfebb9ca3fc8d06065b2ebe2d8784d3313d605936d1feb01c4879c2ce9','2026-08-21 07:00:56'),
('007_vice_leader_document_audience.sql','01785067a31e3699d8debe6628ea2ba9fe2205aac4b92fa2e82fdc79bc5034f7','2026-08-22 09:34:00'),
('008_task_assigner_notifications.sql','3999ea9ed1f39acc8bb64d472228c3fb159dc85278ed6690d8a9855694031d23','2026-08-22 18:12:53'),
('009_notifications.sql','3a748bae116040cb8bede3dc3bf2a8f6234a49e3515d9a49ce8c945adc102e00','2026-08-23 08:00:42'),
('010_notification_sources.sql','7e9e6ce9498883c4e8e1085749a061b003442e3265bacfd5405346d0ed380a71','2026-08-23 08:00:42'),
('011_comment_person_tags.sql','585860fad5eb0004d3b1a28140a598267415a820ea3ecb375036c164c035712d','2026-08-26 15:23:02'),
('012_public_activities.sql','ee2813149c2d174fa7a82be67e9fe383975e308a590bdcfadab7f477b2bd0a19','2026-08-28 07:23:56'),
('013_remove_seed_records.sql','ef97d8c57137b9aaa5003440ed245b5beb2397cc5e737a6ef40ce7be116196dc','2026-08-28 23:17:40'),
('014_multiple_comment_person_tags.sql','5acbf8cd1a2f30f8e3bab0dc882d116f345a3ae64c06456fc469b3aa63230d04','2026-08-28 23:17:40');
/*!40000 ALTER TABLE `schema_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES ('0G65NwrMO_AF1H8Dxze2wgRwXmzrhdqp',1787963768,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-28T18:18:47.844Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":64,\"name\":\"Đoàn Duy Anh\",\"email\":\"anh.dd233826@sis.hust.edu.vn\",\"role\":\"admin\",\"phone\":null,\"avatar_color\":\"#1622d0\"}}'),
('6uH0d8OTBM2AaqpcW7RyvuomF26PZRYK',1787975913,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-29T03:57:01.926Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":98,\"name\":\"Đào Văn Quang\",\"email\":\"quang.dv233602@sis.hust.edu.vn\",\"role\":\"leader\",\"phone\":\"0919279659\",\"avatar_color\":\"#315C4C\"}}'),
('CLpDockhIc2elS7OuBdeShXS9ikIQKW8',1787974570,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-28T18:39:53.227Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":2,\"name\":\"Nguyễn Đình Văn\",\"email\":\"van.nguyendinh@hust.edu.vn\",\"role\":\"admin\",\"phone\":null,\"avatar_color\":\"#5577a5\"}}'),
('I40W0c-jKTU1QMwNJ3M_z-2m0exaaqzF',1787980293,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-29T04:59:17.001Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":68,\"name\":\"Đặng Thùy Linh\",\"email\":\"linh.dt2414638@sis.hust.edu.vn\",\"role\":\"leader\",\"phone\":null,\"avatar_color\":\"#ffebaf\"}}'),
('ROEpkdWLBP5XKrTzNaYDHmlyLjpldY28',1787961521,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-28T23:58:41.130Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"microsoftSsoState\":\"b938bf3b17f18b4f5def42a13bcb5f0f374d52b397e919b860bee7bbbdec07fa\"}'),
('dq-OD2EkCpp5pyxfASHXkkqt1J7NNy-K',1788000006,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-29T10:37:04.066Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":2,\"name\":\"Nguyễn Đình Văn\",\"email\":\"van.nguyendinh@hust.edu.vn\",\"role\":\"admin\",\"phone\":null,\"avatar_color\":\"#5577a5\"}}'),
('eaza7TY3mWoSjWZ8Y2ouUZwPB0wrqX0x',1788002848,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-29T11:21:41.158Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":2,\"name\":\"Nguyễn Đình Văn\",\"email\":\"van.nguyendinh@hust.edu.vn\",\"role\":\"admin\",\"phone\":null,\"avatar_color\":\"#5577a5\"}}'),
('gMafsExns4v3oBObynKsGpMM14R_ENY8',1787975662,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-28T21:20:14.202Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":73,\"name\":\"Cao Nhất Đăng\",\"email\":\"dang.cn2512334@sis.hust.edu.vn\",\"role\":\"vice_leader\",\"phone\":\"0327070207\",\"avatar_color\":\"#315c4c\"}}'),
('vwnZtQm8sqn5wfSVtqpLeTikJDTEkoyA',1787961995,'{\"cookie\":{\"originalMaxAge\":43200000,\"expires\":\"2026-08-28T17:36:07.015Z\",\"secure\":true,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":55,\"name\":\"Hoàng Gia Minh\",\"email\":\"minh.hg2414858@sis.hust.edu.vn\",\"role\":\"member\",\"phone\":\"0935122828\",\"avatar_color\":\"#315C4C\"}}');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_assignees`
--

DROP TABLE IF EXISTS `task_assignees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_assignees` (
  `task_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`task_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_assignees_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_assignees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_assignees`
--

LOCK TABLES `task_assignees` WRITE;
/*!40000 ALTER TABLE `task_assignees` DISABLE KEYS */;
INSERT INTO `task_assignees` (`task_id`, `user_id`, `assigned_at`) VALUES (3,68,'2026-08-16 16:33:40'),
(4,68,'2026-08-17 14:34:40'),
(4,101,'2026-08-17 14:34:40'),
(6,69,'2026-08-22 13:10:49'),
(12,66,'2026-08-22 15:52:14'),
(12,69,'2026-08-22 15:52:14'),
(21,69,'2026-08-23 07:28:54'),
(31,71,'2026-08-23 20:19:44'),
(31,72,'2026-08-23 20:19:44'),
(31,73,'2026-08-23 20:19:44'),
(31,124,'2026-08-23 20:19:44'),
(33,87,'2026-08-24 12:14:23'),
(34,87,'2026-08-24 12:28:36'),
(48,22,'2026-08-28 06:20:06'),
(49,173,'2026-08-28 06:21:39'),
(50,60,'2026-08-28 07:06:38');
/*!40000 ALTER TABLE `task_assignees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachments`
--

DROP TABLE IF EXISTS `task_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_attachments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `task_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `kind` enum('clarification','evidence','issue','deliverable') NOT NULL DEFAULT 'clarification',
  `label` varchar(180) NOT NULL,
  `link_url` varchar(1000) DEFAULT NULL,
  `stored_name` varchar(255) DEFAULT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `mime_type` varchar(120) DEFAULT NULL,
  `size_bytes` bigint(20) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_attachments_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_attachments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_attachments`
--

LOCK TABLES `task_attachments` WRITE;
/*!40000 ALTER TABLE `task_attachments` DISABLE KEYS */;
INSERT INTO `task_attachments` (`id`, `task_id`, `user_id`, `kind`, `label`, `link_url`, `stored_name`, `original_name`, `mime_type`, `size_bytes`, `created_at`) VALUES (3,3,68,'evidence','Sửa đề án, bổ sung đơn xin và tách phụ lục ĐRL','https://drive.google.com/drive/folders/17mmUW90k4wbKIFbx5-4rNARuLjbCIdGq?usp=drive_link',NULL,NULL,NULL,0,'2026-08-17 17:40:22'),
(10,33,87,'clarification','[SEEE] Äá» ÃN TUYá»N CTV VEE Ká»² 2026.1.docx',NULL,'33-1197c26b-bf63-4505-922e-673621800d8a.docx','[SEEE] Äá» ÃN TUYá»N CTV VEE Ká»² 2026.1.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',553193,'2026-08-24 12:17:03'),
(11,33,87,'clarification','[SEEE] TTR Äáº¶T BÃN TREO áº¤N PHáº¨M TUYá»N CTV VEE Ká»² 2026.2 - Copy - Copy (2).docx',NULL,'33-9900abbf-d0b2-47d7-a699-0ec0f47ed914.docx','[SEEE] TTR Äáº¶T BÃN TREO áº¤N PHáº¨M TUYá»N CTV VEE Ká»² 2026.2 - Copy - Copy (2).docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',5087004,'2026-08-24 12:17:19'),
(12,33,87,'clarification','[SEEE] TTR MÆ¯á»¢N PHÃNG TUYá»N CTV VEE Ká»² 2026.1.docx',NULL,'33-d0e26f25-9e0d-4f76-bd96-f8e6f9f998a9.docx','[SEEE] TTR MÆ¯á»¢N PHÃNG TUYá»N CTV VEE Ká»² 2026.1.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',1678261,'2026-08-24 12:17:30'),
(13,33,87,'clarification','[SEEE] TTR Äá» NGHá» QUAY PHIM CHá»¤P áº¢NH TUYá»N CTV VEE.docx',NULL,'33-9276c3c0-4c9e-4ea9-bad3-f563f3ada94b.docx','[SEEE] TTR Äá» NGHá» QUAY PHIM CHá»¤P áº¢NH TUYá»N CTV VEE.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',1677477,'2026-08-24 12:17:56'),
(14,33,87,'clarification','[SEEE] TTR Äáº¶T BÃN TREO áº¤N PHáº¨M TUYá»N CTV VEE Ká»² 2026.1.docx',NULL,'33-dbfb706f-7c74-4287-bacc-4196a9d3c791.docx','[SEEE] TTR Äáº¶T BÃN TREO áº¤N PHáº¨M TUYá»N CTV VEE Ká»² 2026.1.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',5087004,'2026-08-24 12:25:19'),
(15,34,87,'clarification','[SEEE] Äá» ÃN TUYá»N CTV VEE Ká»² 2026.1.docx',NULL,'34-76147122-e536-42be-b5ae-0825252cf964.docx','[SEEE] Äá» ÃN TUYá»N CTV VEE Ká»² 2026.1.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',553193,'2026-08-24 12:28:48'),
(16,34,87,'clarification','[SEEE] TTR Äáº¶T BÃN TREO áº¤N PHáº¨M TUYá»N CTV VEE Ká»² 2026.1.docx',NULL,'34-fcec9a50-b28d-4a72-9d06-508354bf52fe.docx','[SEEE] TTR Äáº¶T BÃN TREO áº¤N PHáº¨M TUYá»N CTV VEE Ká»² 2026.1.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',5087004,'2026-08-24 12:29:20'),
(17,34,87,'clarification','[SEEE] TTR MÆ¯á»¢N PHÃNG TUYá»N CTV VEE Ká»² 2026.1.docx',NULL,'34-2a37bbf9-14e1-4d9b-8b5e-0f3fb8866f3b.docx','[SEEE] TTR MÆ¯á»¢N PHÃNG TUYá»N CTV VEE Ká»² 2026.1.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',1678261,'2026-08-24 12:29:38'),
(18,34,87,'clarification','[SEEE] TTR Äá» NGHá» QUAY PHIM CHá»¤P áº¢NH TUYá»N CTV VEE.docx',NULL,'34-620e07ad-80f4-44f3-83d1-8e9355851bcf.docx','[SEEE] TTR Äá» NGHá» QUAY PHIM CHá»¤P áº¢NH TUYá»N CTV VEE.docx','application/vnd.openxmlformats-officedocument.wordprocessingml.document',1677477,'2026-08-24 12:30:10');
/*!40000 ALTER TABLE `task_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `activity_id` int(10) unsigned NOT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `stage` enum('before','during','after','general') NOT NULL DEFAULT 'general',
  `status` enum('open','in_progress','review','done') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `team_id` int(10) unsigned NOT NULL,
  `assignee_id` int(10) unsigned DEFAULT NULL,
  `assigned_by` int(10) unsigned DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `deadline` date NOT NULL,
  `deliverable` varchar(255) DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `team_id` (`team_id`),
  KEY `assignee_id` (`assignee_id`),
  KEY `tasks_assigned_by` (`assigned_by`),
  CONSTRAINT `fk_tasks_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`assignee_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` (`id`, `activity_id`, `title`, `description`, `stage`, `status`, `priority`, `team_id`, `assignee_id`, `assigned_by`, `start_date`, `deadline`, `deliverable`, `completed_at`, `created_at`) VALUES (3,2,'Sửa đề án',NULL,'before','done','medium',5,68,68,NULL,'2026-08-18',NULL,'2026-08-18 14:39:58','2026-08-16 16:33:40'),
(4,3,'Sửa đề án:  Chào tân là HĐ của SEEE, không có kp đtn. Kinh phí tổ chức dưới 50 triệu (cả KPPC và KPTT).',NULL,'before','done','medium',5,68,68,NULL,'2026-08-22',NULL,'2026-08-22 16:36:25','2026-08-17 14:34:40'),
(6,4,'Triển khai giao việc về các thành viên trong ban. ','Cần giao rõ việc cho các thành viên.\nĐây sẽ là hoạt động làm mẫu để tập huấn cho ĐTN','before','done','medium',6,69,66,NULL,'2026-08-25',NULL,'2026-08-24 03:17:33','2026-08-22 13:10:49'),
(12,10,'Chuẩn bị các nội dung tập huấn ','1. Tập huấn Quy trình đề án\n2. Tập huấn Quy trình thanh toán\n3. Tập huấn Quy trình truyền thông sự kiện','before','done','medium',6,69,97,NULL,'2026-08-25',NULL,'2026-08-25 21:34:47','2026-08-22 15:52:14'),
(21,10,'Chuẩn bị hướng dẫn sử dụng hệ thống sv-seee','Cách sử dụng hệ thống cho BCH','before','done','medium',6,69,2,NULL,'2026-08-25',NULL,'2026-08-26 09:53:46','2026-08-23 07:28:54'),
(31,4,'Làm Tờ trình mượn phòng, đặt bàn, treo ấn phẩm, quay chụp',NULL,'before','open','high',6,73,69,'2026-08-23','2026-08-25',NULL,NULL,'2026-08-23 20:19:44'),
(33,14,'Hoàn thiện đề án giấy tờ',NULL,'before','done','high',4,87,87,'2026-08-24','2026-08-24','Đề án và các loại tờ trình','2026-08-24 19:26:12','2026-08-24 12:14:23'),
(34,14,'Hoàn thiện đề án giấy tờ',NULL,'before','done','high',4,87,87,'2026-08-24','2026-08-24','Đề án và các loại tờ trình','2026-08-25 13:36:40','2026-08-24 12:28:36'),
(48,20,'Thiết kế giấy mời sự kiện','Thiết kế giấy mời. ','before','open','high',2,22,2,NULL,'2026-08-28',NULL,NULL,'2026-08-28 06:20:06'),
(49,20,'Huy động sinh viên hỗ trợ sự kiện','HUy động mỗi buổi (sáng / chiều) 6 sinh viên. ','before','open','medium',1,173,2,NULL,'2026-09-11',NULL,NULL,'2026-08-28 06:21:39'),
(50,21,'Chuẩn bị kế hoạch gian trại EGDC',NULL,'before','open','high',8,60,167,'2026-08-27','2026-08-30','Kế hoạch cụ thể và dự kiến đồ cần chuẩn bị',NULL,'2026-08-28 07:06:38');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `color` char(7) NOT NULL DEFAULT '#315C4C',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` (`id`, `name`, `description`, `color`, `is_active`, `sort_order`, `created_at`) VALUES (1,'Ban Thường Vụ','Ban Thường Vụ ĐTN - HSV SEEE 2026 - 2027','#248eff',1,0,'2026-08-14 02:11:53'),
(2,'Ban Thông tin Tuyên truyền - Truyền thông Sự kiện','Ban 4T SEEE 2026-2027','#26c087',1,0,'2026-08-14 03:07:39'),
(3,'Ban Học Tập/NCKH - HTSV','Ban Học Tập 2026-2027','#00ccff',1,0,'2026-08-14 07:55:21'),
(4,'Đội SVTN Ngành Điện ','Đội SVTN Ngành Điện (ĐTN - HSV SEEE 2026-2027)','#315c4c',1,0,'2026-08-14 09:08:25'),
(5,'Ban Văn nghê -  Thể Thao',NULL,'#fc3512',1,0,'2026-08-14 09:36:33'),
(6,'Ban Tổ chức - Kiểm tra / Tổ chức & Xây dựng Hội','Ban TC-KT/TC&XDH SEEE 2026 - 2027','#00ffd5',1,0,'2026-08-14 09:37:13'),
(7,'Tiểu ban Tài chính - Hậu cần','Tiểu ban TCHC SEEE 2026 - 2027','#fff829',1,0,'2026-08-14 09:46:52'),
(8,'EGDC - CLB Thiết kế & Lập trình Game',NULL,'#004187',1,0,'2026-08-14 17:36:59'),
(9,'Đội SVTN Ngành Điện tử - Viễn thông','Đội SVTN Ngành Điện tử - Viễn thông SEEE 2026-2027','#54325d',1,0,'2026-08-15 03:26:00'),
(10,'Ban Phong trào Sinh viên 5 Tốt','Ban 5T SEEE 2026-2027','#a98aff',1,0,'2026-08-15 09:40:29'),
(11,'SRC - CLB Sinh viên NCKH Trường Điện - Điện tử',NULL,'#002c69',1,0,'2026-08-17 03:36:50');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `update_tagged_users`
--

DROP TABLE IF EXISTS `update_tagged_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `update_tagged_users` (
  `update_id` int(10) unsigned NOT NULL,
  `user_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`update_id`,`user_id`),
  KEY `update_tagged_users_user` (`user_id`),
  CONSTRAINT `fk_update_tagged_users_update` FOREIGN KEY (`update_id`) REFERENCES `updates` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_update_tagged_users_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `update_tagged_users`
--

LOCK TABLES `update_tagged_users` WRITE;
/*!40000 ALTER TABLE `update_tagged_users` DISABLE KEYS */;
INSERT INTO `update_tagged_users` (`update_id`, `user_id`) VALUES (31,66),
(32,64);
/*!40000 ALTER TABLE `update_tagged_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `updates`
--

DROP TABLE IF EXISTS `updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `updates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `activity_id` int(10) unsigned NOT NULL,
  `task_id` int(10) unsigned DEFAULT NULL,
  `user_id` int(10) unsigned NOT NULL,
  `tagged_user_id` int(10) unsigned DEFAULT NULL,
  `body` text NOT NULL,
  `kind` enum('comment','progress','evidence','issue') NOT NULL DEFAULT 'comment',
  `attachment_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `activity_id` (`activity_id`),
  KEY `task_id` (`task_id`),
  KEY `user_id` (`user_id`),
  KEY `updates_tagged_user` (`tagged_user_id`),
  CONSTRAINT `fk_updates_tagged_user` FOREIGN KEY (`tagged_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `updates_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `updates_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `updates_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `updates`
--

LOCK TABLES `updates` WRITE;
/*!40000 ALTER TABLE `updates` DISABLE KEYS */;
INSERT INTO `updates` (`id`, `activity_id`, `task_id`, `user_id`, `tagged_user_id`, `body`, `kind`, `attachment_url`, `created_at`) VALUES (1,2,NULL,68,NULL,'đã sửa lại các các nội dung về BGK và dự trù ạ ','progress','https://drive.google.com/drive/folders/1pdRcnPuo1_XBhTjeUITytTUnL-FDSU7i?usp=drive_link','2026-08-21 06:02:50'),
(4,7,NULL,2,NULL,'Đề án sai format, sai thứ tự ký. sửa lại trước khi ký.','comment',NULL,'2026-08-22 09:58:14'),
(5,2,NULL,2,NULL,'Sửa đề án phần 2:\n1. Giải yêu thích nhất => giải khuyến khích (để giải ngân được)\n2. Hỗ trợ sinh viên giảm xuống còn 10 bạn (không thể hỗ trợ quá nhiều cho 1 cuộc thi online)','issue',NULL,'2026-08-22 10:13:21'),
(6,4,NULL,2,NULL,'Đã có đề án ký trong folder. ','progress',NULL,'2026-08-22 10:29:26'),
(7,4,NULL,2,NULL,'Ban TCKT khẩn trương triển khai, giao việc, thêm các thành viên liên quan vào sự kiện. ','comment',NULL,'2026-08-22 10:29:53'),
(9,2,NULL,68,NULL,'đã xử lí các note gần nhất ạ','progress',NULL,'2026-08-23 04:13:45'),
(10,4,6,69,NULL,'Đã giao làm các giấy tờ liên quan: Tờ trình mượn phòng, đặt bàn, ấn phẩm, quay chụp cho buổi nhập học 27/9 và các ngày diễn ra chương trình','progress',NULL,'2026-08-23 20:17:33'),
(11,7,NULL,98,NULL,'Em xin phép gửi lại đề án ạ','progress','https://docs.google.com/document/d/1Qt-WiDwL9vhIPqAqk9mQmB7vGpfMzdcD/edit?usp=drive_web&ouid=105983365713106260020&rtpof=true','2026-08-24 01:40:54'),
(13,7,NULL,98,NULL,'Em xin phép gửi lại đề án đã có số và chỉnh lại thứ tự ký ạ','comment','https://docs.google.com/document/d/1lVtvxF260wjtB7wxxBg88ddETaMMuMrc/edit?usp=drive_web&ouid=105983365713106260020&rtpof=true','2026-08-24 07:06:53'),
(14,7,NULL,2,NULL,'Đã duyệt, cần đặt phòng nhắc thầy','comment',NULL,'2026-08-24 08:29:59'),
(17,14,34,2,NULL,'Đồng ý','progress',NULL,'2026-08-25 06:36:39'),
(31,4,NULL,2,66,'Em giao task và add các bạn trực bàn tuyển ctv vào để ghi nhận cho mọi người. Nhớ chọn là trong sự kiện nhé.','comment',NULL,'2026-08-27 05:35:22'),
(32,21,NULL,2,64,'Em add bạn cán sự k70 đại diện phụ trách vào sự kiện','comment',NULL,'2026-08-28 07:05:13');
/*!40000 ALTER TABLE `updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_teams`
--

DROP TABLE IF EXISTS `user_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_teams` (
  `user_id` int(10) unsigned NOT NULL,
  `team_id` int(10) unsigned NOT NULL,
  `is_lead` tinyint(1) NOT NULL DEFAULT 0,
  `is_vice_lead` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`,`team_id`),
  KEY `team_id` (`team_id`),
  CONSTRAINT `user_teams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_teams_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_teams`
--

LOCK TABLES `user_teams` WRITE;
/*!40000 ALTER TABLE `user_teams` DISABLE KEYS */;
INSERT INTO `user_teams` (`user_id`, `team_id`, `is_lead`, `is_vice_lead`) VALUES (2,1,0,0),
(21,2,1,0),
(22,2,1,0),
(23,2,0,0),
(24,2,0,0),
(25,2,0,0),
(26,2,0,0),
(27,2,0,0),
(28,2,0,0),
(29,2,0,0),
(30,2,0,0),
(31,2,0,0),
(32,2,0,0),
(33,2,0,0),
(34,2,0,0),
(35,2,0,0),
(36,2,0,0),
(37,2,0,0),
(38,2,0,0),
(39,2,0,0),
(40,2,0,0),
(41,2,0,0),
(42,2,0,0),
(43,2,0,0),
(44,2,0,0),
(45,2,0,0),
(46,2,0,0),
(47,2,0,0),
(48,2,0,0),
(49,2,0,0),
(50,2,1,0),
(51,2,1,0),
(52,3,1,0),
(53,1,0,0),
(54,3,1,0),
(55,3,0,0),
(56,3,0,0),
(57,3,0,0),
(58,3,0,0),
(59,3,0,0),
(60,3,0,0),
(60,8,0,0),
(61,3,0,0),
(62,3,0,0),
(63,3,0,0),
(64,1,0,0),
(65,4,1,0),
(66,6,1,0),
(67,1,0,0),
(67,7,1,0),
(68,5,1,0),
(69,6,1,0),
(70,6,0,1),
(71,6,0,1),
(72,6,0,0),
(73,6,0,1),
(74,5,0,0),
(75,5,0,0),
(78,5,0,0),
(79,5,0,0),
(80,5,0,0),
(81,5,0,0),
(82,5,0,0),
(83,5,0,0),
(84,5,0,0),
(85,5,0,0),
(86,5,0,0),
(87,4,1,0),
(88,5,0,0),
(89,5,0,0),
(90,5,0,0),
(91,4,0,0),
(92,5,0,0),
(93,5,0,0),
(94,5,0,0),
(95,5,0,0),
(96,5,0,0),
(97,1,0,0),
(98,9,1,0),
(99,9,0,0),
(100,9,1,0),
(101,5,1,0),
(102,3,0,0),
(103,3,0,0),
(104,3,0,0),
(105,3,0,0),
(106,3,0,0),
(107,3,0,0),
(108,3,0,0),
(109,3,0,0),
(110,3,0,0),
(111,3,0,0),
(112,3,0,0),
(113,10,1,0),
(114,10,0,0),
(115,10,0,0),
(116,10,0,0),
(117,10,0,0),
(118,10,0,0),
(119,10,0,0),
(120,10,0,0),
(121,10,0,0),
(122,10,0,0),
(123,6,0,0),
(124,6,0,0),
(125,6,0,0),
(126,6,0,0),
(127,6,0,0),
(128,6,0,0),
(129,7,0,1),
(130,7,0,1),
(131,7,0,0),
(133,6,0,0),
(134,6,0,0),
(135,6,0,0),
(136,6,0,0),
(137,7,0,0),
(138,7,0,0),
(139,7,0,0),
(140,7,0,0),
(141,7,0,0),
(142,7,0,0),
(167,8,1,0),
(168,8,0,0),
(169,11,1,0),
(170,11,0,0),
(171,11,0,0),
(173,1,0,0),
(173,3,0,0),
(174,5,0,0);
/*!40000 ALTER TABLE `user_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','leader','vice_leader','member') NOT NULL DEFAULT 'member',
  `phone` varchar(30) DEFAULT NULL,
  `avatar_color` char(7) NOT NULL DEFAULT '#315C4C',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=175 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `avatar_color`, `is_active`, `created_at`) VALUES (2,'Nguyễn Đình Văn','van.nguyendinh@hust.edu.vn','$2b$10$Obio182oaLl4usmky55UM.29HByYXAc2M29e5ZCp3UjnSLkC72RVm','admin',NULL,'#5577a5',1,'2026-08-05 05:02:14'),
(21,'Đặng Quang Minh','minh.dq2412644@sis.hust.edu.vn','$2b$10$eEA9ZsILOq0Skxp/6cAIqe6PFN8RwPliwGakXjPFyi9ADWVt7axWW','leader','0358796989','#00378f',1,'2026-08-14 03:12:23'),
(22,'Nguyễn Phương Anh','anh.np2414605@sis.hust.edu.vn','$2b$10$fbo67SI5qk4JGYXAPiFVWOodQauCDxdiROFPPJ9If5cMJVh0YqXbW','leader','0343118999','#315c4c',1,'2026-08-14 03:13:25'),
(23,'Nguyễn Phương Trang','trang.np2414668@sis.hust.edu.vn','$2b$10$eFNGlWvkhE0u7RyVVVAXAuGs2YozjtlQifJ48/I2cnN7jySq1uyzS','member','0866610317','#315C4C',1,'2026-08-14 03:14:08'),
(24,'Trần Nguyễn Ngọc Khánh','khanh.tnn2415012@sis.hust.edu.vn','$2b$10$MceztwLjnC3.HfOI3b7XfOyoXSvnv9mhbvYA8CIHLKcigR.CQHrb.','member','0942368705','#315c4c',1,'2026-08-14 03:14:42'),
(25,'Lê Công Hải Quân','quan.lch2414659@sis.hust.edu.vn','$2b$10$BiQdjz1Sm01P2bLJQ/qGV.g2ZJpBv.ytfO8tWkH9WoM69/yVdgRdy','member','0838150477','#315c4c',1,'2026-08-14 03:17:10'),
(26,'Nguyễn Quang Hải Anh','anh.nqh2414603@sis.hust.edu.vn','$2b$10$W9ahsfKsQ7dJndKr9Pcv..8V2CJmOK/4YxUhrdoPg8n2l0NPNqGF2','member','0969613318','#315C4C',1,'2026-08-14 03:17:39'),
(27,'Bạch Đàm Quân','quan.bd2412273@sis.hust.edu.vn','$2b$10$vfgsPu8i0dlAUIJKGMWZF.Ni.9HkO1fM76Ig71hW48G1PBWefpGAC','member','0839288916','#315C4C',1,'2026-08-14 03:18:02'),
(28,'Ninh Trọng Nghĩa','nghia.nt2414766@sis.hust.edu.vn','$2b$10$vIFybsnZ473UMJHoT.famummgIdc3EkYw1FtIV4SwNnJkXniS4gBm','member','0919831728','#315C4C',1,'2026-08-14 03:18:26'),
(29,'Nguyễn Nhật Nguyên','nguyen.nn2514721@sis.hust.edu.vn','$2b$10$HQpwQIm2JsVzj/Lqo7SHR.owy7xlvBXCYB1oHKeyc1iTb46NRhBSK','member','0333981007','#315c4c',1,'2026-08-14 03:18:48'),
(30,'Trần Nguyễn Việt Anh','anh.tnv2412374@sis.hust.edu.vn','$2b$10$i3lqIZhKBdycJGVHiZTd0uyWCKarrp0S78dXdsCuuayBx4mWCmSTe','member','0825625687','#58ff5f',1,'2026-08-14 03:19:12'),
(31,'Nguyễn Quỳnh Trang','trang.nq2414405@sis.hust.edu.vn','$2b$10$vejI5fh8GTaPmxNvdtjV6.4CtyjvwsATFtMj5QLdOpDhPQ463W3qq','member','0963245695','#315C4C',1,'2026-08-14 03:19:35'),
(32,'Phạm Đỗ Mai Hương','huong.pdm2514498@sis.hust.edu.vn','$2b$10$NOZiPs8UDpFlCkY8vatwsOifHiVsEgdhcZuboIc0LSaIpi7zx7kG.','member','0888705336','#315c4c',1,'2026-08-14 03:19:58'),
(33,'Phùng Yến Nhi','nhi.py2514852@sis.hust.edu.vn','$2b$10$P5dzFkVFy/4MyP9tzs9ffOWfyeNuF90NY7zqK5b.fiWIEsekbpBcy','member','0397549529','#315C4C',1,'2026-08-14 03:20:21'),
(34,'Nguyễn Thị Linh Giang','giang.ntl2414091@sis.hust.edu.vn','$2b$10$l1XloKjQk6FdplLijtzgr.Fwk7YBaEZfYa9fcV/.vZJZDFlP8xSpW','member','0389155346','#ead6f0',1,'2026-08-14 03:22:46'),
(35,'Nguyễn An Thông','thong.na2414797@sis.hust.edu.vn','$2b$10$IJYAmXuVUhC9QSoisHLM7.KeRWWmXXMVcP.a9RiWIkxfkiwi58L9i','member','0966882405','#315C4C',1,'2026-08-14 03:23:07'),
(36,'Lê Quang Minh','minh.lq2514768@sis.hust.edu.vn','$2b$10$eXXp1dFgqjssvw/UqQHG8uGB7myjq7GCpVaUhkmaZx.eswtP/bPNm','member','0962437531','#315C4C',1,'2026-08-14 03:23:30'),
(37,'Nguyễn Trung Ngọc Bảo','bao.ntn2514642@sis.hust.edu.vn','$2b$10$CxKCfHVQby4d3xPbFfdvL.UYvTxCiti6GZ583whHf99NgWKVVz5om','member','0969884342','#315c4c',1,'2026-08-14 03:23:49'),
(38,'Hoàng Kim Khánh','khanh.hk2512845@sis.hust.edu.vn','$2b$10$KLuI.GCFE9wE/2/wsxRqrOf6B0CwTF/fqb/CJTJnEk1VKXJ4VfTyq','member','0917761611','#315C4C',1,'2026-08-14 03:24:13'),
(39,'Hoàng Minh Đăng','dang.hm2514018@sis.hust.edu.vn','$2b$10$gslzRUXMP1Lm8iTc3lBaSOc3KdzDVBUjZ8jCUHj0me5TfRNhi9Jw2','member','0332361836','#315C4C',1,'2026-08-14 03:24:35'),
(40,'Phạm Khánh Linh','linh.pk2514833@sis.hust.edu.vn','$2b$10$eURd6tW2o0XJ0ATCZoKc1O3U4yI0nfnSr6vW/qYEmAU6tEj6HAuB6','member','0963785966','#74ccd2',1,'2026-08-14 03:24:55'),
(41,'Phạm Đình Tuấn Minh','minh.pdt2514771@sis.hust.edu.vn','$2b$10$iGI53zZN2bZ0hbddz6fbFuoIZ1dv.7iyc7S.uRX6qJ0qRCtze5uBG','member','0989429841','#5d3d32',1,'2026-08-14 03:25:16'),
(42,'Trần Thị Hoa Hồng','hong.tth2512937@sis.hust.edu.vn','$2b$10$/VTwH7fvpTE9DVGKJ/eVT.hlHK4pbyBYfJMqUADOO8MihOYtQueaO','member','0963298879','#315c4c',1,'2026-08-14 03:25:37'),
(43,'Trần Hải Anh','anh.th2412355@sis.hust.edu.vn','$2b$10$ApH.snDLYjhp2ShhldqeK.FF2P9aNJuk0iU41aLUBU1vRJy4mhSyS','member','0379628421','#315C4C',1,'2026-08-14 03:26:29'),
(44,'Nguyễn Đức Minh','minh.nd2514257@sis.hust.edu.vn','$2b$10$zeLBd/4drgMpsH/d4KP/A.2/fBPRc2O21hN4.KHFOgH5/b84qRoEi','member','0363906096','#315c4c',1,'2026-08-14 03:26:52'),
(45,'Đặng Quang Thi','thi.dq2514866@sis.hust.edu.vn','$2b$10$7Z5PsUgO5RCq6VVqTppfkuq0CKPmJkFviWh28EvD2cD02Yjss6ddG','member','0387068851','#315C4C',1,'2026-08-14 03:27:15'),
(46,'Trần Đức Dương','duong.td2514810@sis.hust.edu.vn','$2b$10$ikl6zDTRK7d.3yGthzlf/e4i/lpc4pi.ylCivCoBWlmB7oQYfSY6W','member','0342179254','#315C4C',1,'2026-08-14 03:28:06'),
(47,'Tạ Quốc Khánh','khanh.tq2412569@sis.hust.edu.vn','$2b$10$wHAVB8R6/sD/QrfzwqR1nOcD.AaHrd68SQnTL1qgbtEyXF0cQj2aG','member','0912779161','#315C4C',1,'2026-08-14 03:28:28'),
(48,'Vũ Hoàng Linh','linh.vh233775@sis.hust.edu.vn','$2b$10$cEsDgi.HN1v7D/ONFBQIVeDRcbiWep/nnENNBLP7LViaY0RPatHZK','member','0869507656','#315C4C',1,'2026-08-14 03:29:16'),
(49,'Lê Phương Anh','anh.lp2414606@sis.hust.edu.vn','$2b$10$tt0fduFUgH3D2vd.gyQcnenJYYsIx4W.4qbv.TvZqNldYTy0GAV1a','member','0949100619','#315c4c',1,'2026-08-14 03:29:42'),
(50,'Lê Minh Triết','triet.lm234040@sis.hust.edu.vn','$2b$10$x0Rpcn/GNw/IsfAA3fBCiet2BNUINGaKNTnx5QEFi1ybbI6SD38/i','leader','0979858828','#315C4C',1,'2026-08-14 03:32:16'),
(51,'Trần Đình Hiển','hien.td232062@sis.hust.edu.vn','$2b$10$BBPJNMgJSzrlGjFYQlWq0.DAvqZ1SfbnNYHzH7aTPatMVvniFqxmq','leader','0353693080','#315c4c',1,'2026-08-14 03:32:46'),
(52,'Đồng Minh Dương','duong.dm2414491@sis.hust.edu.vn','$2b$10$icMDGn8ommDP2tjM2aQtXeeeXsTroWPwUFYBnSSvIr3KWKxqdKcnW','leader','0383863378','#315C4C',1,'2026-08-14 07:54:00'),
(53,'Phạm Thị Nhẫn','nhan.phamthi@hust.edu.vn','$2b$10$GByPHFueR2NTZXflwcc.M.A7T9LlHa6mp.tm9i0msqFMf5SmFdpQ.','admin',NULL,'#315c4c',1,'2026-08-14 07:54:16'),
(54,'Lê Quang Trung','trung.lq2412822@sis.hust.edu.vn','$2b$10$4ve5i59ZbT3sNKo9xrZHSuQgRtdGZL7g.hE8Tncdox4OHjJdRBK9K','leader','0337083766','#315c4c',1,'2026-08-14 07:58:22'),
(55,'Hoàng Gia Minh','minh.hg2414858@sis.hust.edu.vn','$2b$10$euQYWLCGb2VLz.UmQX5NYOh8N5VXhAAccS6BuEkmy68AQDUUkS28m','member','0935122828','#315C4C',1,'2026-08-14 07:59:20'),
(56,'Nguyễn Gia Luân','luan.ng2412624@sis.hust.edu.vn','$2b$10$hZk3oTe1F.N5yTTtcNYn7.Rt.GF2viqcLUKc3n3sW1iF9YhL.8W6u','member','0375169892','#315C4C',1,'2026-08-14 08:01:00'),
(57,'Trương Vũ Hoàng Long','long.tvh2414224@sis.hust.edu.vn','$2b$10$UiE2BAcsGk0/.tUYB9jhr.fEI43CMkiFUfdDu4Bw5LL/BQ60hrLAO','member','0336189941','#315c4c',1,'2026-08-14 08:02:09'),
(58,'Trần Huy Nam','nam.th2412663@sis.hust.edu.vn','$2b$10$dMohbnUA0gl0nak.gIqKmem9H/Beu3dHcKkaXUm48SeHJDa43HuHK','member','0877697799','#315C4C',1,'2026-08-14 08:02:42'),
(59,'Đàm Khánh Huyền','huyen.dk2412565@sis.hust.edu.vn','$2b$10$m1CUQe2/bItYEkCCkqOEHOSlChRvuSdPaAPfBDwsbNxx0bHpDeQ1O','member','0985593894','#315C4C',1,'2026-08-14 08:03:02'),
(60,'Đàm Thế Anh','anh.dt2414607@sis.hust.edu.vn','$2b$10$/aDuK9NoeuYrQO3W0gEZXOyhIZkTA0Sr4UTgN6BofKIEmEgKbOjnW','member','0348577024','#315c4c',1,'2026-08-14 08:03:24'),
(61,'Nguyễn Thị Thủy','thuy.nt2414396@sis.hust.edu.vn','$2b$10$0PBwgoWqeAEQMm2elqMp/u4m/9gz1Mx31P7Vrp6hJADBEEJ.DRif.','member','0336004655','#315c4c',1,'2026-08-14 08:05:35'),
(62,'Nguyễn Quốc Bảo','bao.nq2412387@sis.hust.edu.vn','$2b$10$KFQCmTy3ht/5IQLsOV2RfuSVus1xIXUByKI1glugf/L.T.IYsqEyy','member',NULL,'#315c4c',1,'2026-08-14 08:05:48'),
(63,'Vương Bá Long','long.vb2414225@sis.hust.edu.vn','$2b$10$t9NYXKNpaAKg2HbW3XpxXepJkw2h1IUTZMtDgwPe0MaOKXmfTu2vu','member','0859073288','#315C4C',1,'2026-08-14 08:06:47'),
(64,'Đoàn Duy Anh','anh.dd233826@sis.hust.edu.vn','$2b$10$7BobGeRNrM.oTp2c6gWwdeH8xHRwqh.MKwKG5c20uz/BE2.J6Mq52','admin',NULL,'#1622d0',1,'2026-08-14 09:32:25'),
(65,'Lê Trọng Kiên','kien.lt232152@sis.hust.edu.vn','$2b$10$HOLxgI6m/UufH6pFGaxqpe/OpyNPgUHwFKx.A/o0lH0ZC7rXoa90W','leader','0367887622','#315C4C',1,'2026-08-14 09:33:01'),
(66,'Trương Tuấn Kiệt','kiet.tt2414631@sis.hust.edu.vn','$2b$10$R3JysV/bq3jLjHVna0GX2eAHfd2UKXIFUT674avtx1NYRmV9cWWae','leader','0886740360','#315C4C',1,'2026-08-14 09:38:42'),
(67,'Nguyễn Hoàng Anh','anh.nh233994@sis.hust.edu.vn','$2b$10$sMQNDfBGrWFbf.e.dHI2D.FKCeFGrZTtiksN135B7naNnE8aLNTZy','admin',NULL,'#8adaf4',1,'2026-08-14 09:40:56'),
(68,'Đặng Thùy Linh','linh.dt2414638@sis.hust.edu.vn','$2b$10$AtGBrEy8JA0J/TPKl2G/Ou9todb3dv4gVee8u.nU8blbRPowV/Yhe','leader',NULL,'#ffebaf',1,'2026-08-14 09:41:13'),
(69,'Nguyễn Long Vũ','vu.nl2412337@sis.hust.edu.vn','$2b$10$QVNdupvlK9iY4eXacP.tROAbAwnvH0Vs766DaOe0onuxE2NEaKVBm','leader','0973027635','#ff0000',1,'2026-08-14 09:41:26'),
(70,'Chu Nguyễn Hà Anh','anh.cnh2414461@sis.hust.edu.vn','$2b$10$2DcSeflMY76SxV1NT1He2OHsyqgRSpYLGRHQKt0X1SfyeO9JrlPhi','vice_leader','0779518666','#315c4c',1,'2026-08-14 09:42:21'),
(71,'Đỗ Thị Bảng Anh','anh.dtb2514873@sis.hust.edu.vn','$2b$10$rs/tIMKwO7qYyYYU/0M3X./ct6iBuk.HujS5Lmi3Xr3p8YiKOp.L2','vice_leader','0839922389','#315C4C',1,'2026-08-14 09:42:56'),
(72,'Nguyễn Đức Anh','anh.nd2514453@sis.hust.edu.vn','$2b$10$cWnT3c3.EXMLpxm7fbaxzeC3bnrAVv4h74warcepWwzw9mpDVpKy6','member','0849696222','#315C4C',1,'2026-08-14 09:43:26'),
(73,'Cao Nhất Đăng','dang.cn2512334@sis.hust.edu.vn','$2b$10$TmJa3NazUpwonf.uWYAEZuIGSQ30Ef/MPmUx5w5SSK1d/EWA8cHlO','vice_leader','0327070207','#315c4c',1,'2026-08-14 09:43:47'),
(74,'Trần Nguyễn Quang Khoa','khoa.tnq2514215@sis.hust.edu.vn','$2b$10$VJ0PBoHkOiPS.JPt3wUF4.E361ecpCYO1pUsUqWJObzab8VboXM4m','member',NULL,'#315C4C',1,'2026-08-14 09:48:27'),
(75,'Nguyễn Đức Kiên','kien.nd2514830@sis.hust.edu.vn','$2b$10$jrKVY8G4S3/CnXlyAKjfL.hMjGhZpvMNVooRPWMvVWdMYVbgmMfL.','member',NULL,'#315C4C',1,'2026-08-14 09:48:58'),
(78,'Hoàng Thế Hải','hai.ht2512422@sis.hust.edu.vn','$2b$10$H8zSLt0gtoq682lOVivBju3nBiX2UWuMArjHH9RzYwev06sG0dwWq','member',NULL,'#315C4C',1,'2026-08-14 09:50:34'),
(79,'Bùi Nguyễn Huy','huy.bn2512495@sis.hust.edu.vn','$2b$10$nAXVpYw5vtJ7kKjE3cQr1uchVF0bwKEgaCx7nDe79kRons/uj.tBq','member',NULL,'#315C4C',1,'2026-08-14 09:51:00'),
(80,'Nguyễn Tiến Thành','thanh.nt2512736@sis.hust.edu.vn','$2b$10$pcc3QUUyyeRLThWhdbw5cuW8iFTKYCPTJuKzhCS5IASVLd5QqQUM.','member',NULL,'#315C4C',1,'2026-08-14 09:51:31'),
(81,'Phạm Tiến Đạt','dat.pt2512353@sis.hust.edu.vn','$2b$10$C6T/gMMUfMj.IcVQf6IBz.Cn8Hw5LJkWKUzER/Jlj2t7rC8kHcjki','member',NULL,'#315C4C',1,'2026-08-14 09:52:02'),
(82,'Phạm Đức Anh ','anh.pd2514793@sis.hust.edu.vn','$2b$10$mxiZirBuoPrM61OlbiltjOeEjV.rYw/MtWrbJxIsgeFBX4aVghATm','member',NULL,'#315C4C',1,'2026-08-14 09:52:52'),
(83,'Lê Thị Hồng Anh','anh.lth2513954@sis.hust.edu.vn','$2b$10$A6FMbZPWDHdJV5jCgLPZsO5kZ7UaJBbR91n96veVUiMvKPrI842UW','member',NULL,'#315C4C',1,'2026-08-14 09:53:17'),
(84,'Đăng Bạch Dương','duong.db2514080@sis.hust.edu.vn','$2b$10$ULmsmK4nWGMgULMUCYYv1uN5rpeoqg5KobByu5nXRkb3Ln5NjydG2','member',NULL,'#315C4C',1,'2026-08-14 09:53:44'),
(85,'Nguyễn Công Hải Đăng','dang.nch2514019@sis.hust.edu.vn','$2b$10$5tdmYlVV1SjxJjDKX.a9luJUu2qWLDZRRgxEsosU5aZ07VcN8IJrK','member',NULL,'#315C4C',1,'2026-08-14 09:55:25'),
(86,'Lê Khánh Linh','linh.lk2514232@sis.hust.edu.vn','$2b$10$TvGntq/ZnnWepbYx2uex8.EByHip1gryyHtEVCxm3Xmhlvs730UJ.','member',NULL,'#315C4C',1,'2026-08-14 09:55:48'),
(87,'Trần Nguyễn Hồng Phúc ','phuc.tnh2412714@sis.hust.edu.vn','$2b$10$d.HvNX0FUdp.2m07gGMPduqTadpLCEUvb0EteudxTVURhAxHYXAAO','leader','0889766599','#315C4C',1,'2026-08-14 09:56:14'),
(88,'Nguyễn Tiến Minh','minh.tn2512138@sis.hust.edu.vn','$2b$10$3NTOP2JDEDJED5N/ATrB0.Bamx5MVrYeoV3sEwsvpiFPpM2eFqQsW','member',NULL,'#315C4C',1,'2026-08-14 09:56:25'),
(89,'Dương Thành Đạt','dat.dt2514805@sis.hust.edu.vn','$2b$10$uGiZnt2xaZQo5TWQJFSJ4.PrH2jlti504FKscGIJh7k6uaALfRjLq','member',NULL,'#315C4C',1,'2026-08-14 09:56:52'),
(90,'Đào Hồng Ngọc','ngoc.dh2514524@sis.hust.edu.vn','$2b$10$sdrK7Z3JYm3jnAarExmlEeS5CMAMdXmy3zoRSDjHJA6yaGuUk2nWK','member',NULL,'#315C4C',1,'2026-08-14 09:57:17'),
(91,'Chu Thị Thu ','thu.ct2412307@sis.hust.edu.vn','$2b$10$v/WUt6qpWndb0ggSaN6TFetzhe/zUza07onwJ43u2iKpxNexZDWYm','member',NULL,'#315C4C',1,'2026-08-14 09:57:29'),
(92,'Mai Hải An','an.mh2514557@sis.hust.edu.vn','$2b$10$oXDes.DaasaTmW5X/9jvMOPKJf/S1MwDo770XyDDqdHlUxdl1nRmK','member',NULL,'#315C4C',1,'2026-08-14 09:57:44'),
(93,'Tống Minh Khoa ','khoa.tm2514504@sis.hust.edu.vn','$2b$10$LZiZD4H5vhxoEOFgRUrAhO.QMbyKuR3nOaNVSdLnDWCv4Y4uMPeoS','member',NULL,'#315C4C',1,'2026-08-14 09:58:11'),
(94,'Ngô Đức Hoàng','hoang.nd2414840@sis.hust.edu.vn','$2b$10$nq4g/YutYI0oxdRLlW3xtu9Vy0dqU1yhHxIk7ozFS2yBAvkrmDkOe','member',NULL,'#315C4C',1,'2026-08-14 09:59:41'),
(95,'Lê Ngọc Tuân','tuan.ln2414806@sis.hust.edu.vn','$2b$10$K25BAvHulBjOzc/Ac87Vv.OXMjGzjMRgeRJr0rBQFJsvsLxVtasyS','member',NULL,'#315C4C',1,'2026-08-14 10:00:04'),
(96,'Nguyễn Khắc Tuấn Anh','anh.nkt2413960@sis.hust.edu.vn','$2b$10$nLh9M30ishcCaMFDzw.OFe4v.ENygVjkVkjsRagqvZKleR9o9PCY2','member',NULL,'#315C4C',1,'2026-08-14 10:00:35'),
(97,'Nguyễn Xuân Long','long.nx234022@sis.hust.edu.vn','$2b$10$Wtd/BoVkgKLU5BrpSEYCoufBmpYBAKj5mwqLvCyMEAGccmn/r08SK','admin','0978641622','#eaaeda',1,'2026-08-14 10:55:52'),
(98,'Đào Văn Quang','quang.dv233602@sis.hust.edu.vn','$2b$10$kGxWCTSAxQxJLyOxtVAyW.IJeW/F.VUuXUWErc8txZNfkkLinNyPu','leader','0919279659','#315C4C',1,'2026-08-15 03:29:38'),
(99,'Nguyễn Quang Tùng','tung.nq2414443@sis.hust.edu.vn','$2b$10$/2QAOoeY6gI5pwLaW4hy0uptUUGbr.phzcjx2LE.5dA1r26shUnFG','member','0339458276','#315C4C',1,'2026-08-15 03:38:55'),
(100,'Chu Nguyễn Hà Phương','phuong.cnh2414865@sis.hust.edu.vn','$2b$10$gMcnADMpi1KpehZrrsQNQemCkw7zK4pla6q1i2GIYYf1GYriEiKR.','leader','0946213694','#315C4C',1,'2026-08-15 03:42:14'),
(101,'Trần Đình Gia Khánh ','khanh.tdg2412886@sis.hust.edu.vn','$2b$10$GENlhEXXLcLcb3ykwdnioecBgTs0KEaxQvoC3GM4bU7yR0gsC.Zza','leader','0707191006','#f38c16',1,'2026-08-15 06:02:25'),
(102,'Lưu Xuân Chức','chuc.lx2514802@sis.hust.edu.vn','$2b$10$zxgt5dOVAt8XYX/NBZ9PvObiPRnfccEEiBohOZh8fZQJI.dMWrHQe','member','0981636070','#315c4c',1,'2026-08-15 06:03:00'),
(103,'Đoàn Khánh Chi','chi.dk2512317@sis.hust.edu.vn','$2b$10$BIuRGfU3KBr/Fu9aqXuT.ObNltIhafDfC9lYWds2RVHakc6I.rmBu','member','0965672462','#315C4C',1,'2026-08-15 06:04:58'),
(104,'Trương Việt Hùng','hung.tv2514165@hust.sis.edu.vn','$2b$10$v8CeVCWsxvbxJcs5V4tcNu.QrCApxDdnqAckgqqBi65MxK6xG585a','member','0982526749','#315C4C',1,'2026-08-15 06:05:26'),
(105,'Võ Thị Minh Huyền','huyen.vtm2512513@sis.hust.edu.vn','$2b$10$XHMBZS2fRZ1OjhXPYD9kGePxHFE1OW9zbVBi1bcr.Wv6gfLPCez7i','member','0912164013','#315c4c',1,'2026-08-15 06:05:54'),
(106,'Cao Minh Hiển','hien.cm2512435@sis.hust.edu.vn','$2b$10$mmsGOmberbEPtfnHf44y5eOyxl5d5gXVSjimheZ2ZEJQo8A85twya','member','0976618135','#315C4C',1,'2026-08-15 06:06:15'),
(107,'Phạm Minh Nguyệt','nguyet.pm2514527@sis.hust.edu.vn','$2b$10$fqwbW6QtCNgBA0WL00ujku08ufVIcZNVLkwNayzRbyOg5rvU1cNka','member','0978656498','#315c4c',1,'2026-08-15 06:06:47'),
(108,'Nguyễn Trần Ngọc Anh','anh.ntn2514458@sis.hust.edu.vn','$2b$10$Ihz4xzyxvQbE6On/hxqDbO01xlVyuomyt76qDPz8AWMOWO7RyGpVa','member','0395182218','#ff00ff',1,'2026-08-15 06:07:11'),
(109,'Trần Xuân Tùng','tung.tx2512793@sis.hust.edu.vn','$2b$10$gfn5nv6WW5jWjs3TDgA84.Y1PPEJrGc2mVj.bTGMabXy.4LXCJWUi','member','0918657251','#315C4C',1,'2026-08-15 06:07:34'),
(110,'Cao Gia Bảo','bao.cg2512305@sis.hust.edu.vn','$2b$10$281GisuvJw/b8BoAl6of/u4IIwcHLpqDbwL0aiZChwSgaiesTg9eC','member','0829904889','#315C4C',1,'2026-08-15 06:07:55'),
(111,'Vũ Anh Tú','tu.va2512775@sis.hust.edu.vn','$2b$10$QanVfdzKuNbxCT/tb5hJeOWSKPkE970V0gaubvWe1YwbrYcYiAhey','member','0966374298','#315c4c',1,'2026-08-15 06:08:17'),
(112,'Nguyễn Hữu Phước','phuoc.nh2514600@sis.hust.edu.vn','$2b$10$C2YYMEnq1sMQBehZWzEXOejQBkN1gkj/w7qFKL4tYIxa28vjd/Ewi','member','0383418262','#315C4C',1,'2026-08-15 06:08:40'),
(113,'Nguyễn Mai Trang','trang.nm2412924@sis.hust.edu.vn','$2b$10$3AaT6/NQcFGVCe4eBOxvAOERb2zG0JxSHtUa09ewUmZyOjNwzlkMC','leader','0944482602','#315C4C',1,'2026-08-15 09:44:33'),
(114,'Nguyễn Trường Giang','giang.nt2414835@sis.hust.edu.vn','$2b$10$SObMpWIY8TT2n61ozV.Ai.5.SOIXYOu06PQXKm0vPOAtTD8w.nAhe','member','0982548747','#315C4C',1,'2026-08-15 09:46:33'),
(115,'Hà Thu Hoài','hoai.ht2414508@sis.hust.edu.vn','$2b$10$3C1Ohzj6CDVV6IyfvjiLfeuigDyz7Adm5A7yZdWL7MdnTcdzvLCpq','member','0362484360','#315C4C',1,'2026-08-15 09:47:15'),
(116,'Ngô Gia Huy','huy.ng2414918@sis.hust.edu.vn','$2b$10$C.Vb8RJi9K9RTVOEB/eifObuuoV1h3.doaveda7pNyK6hV5NnQ35e','member','0932682566','#315C4C',1,'2026-08-15 09:47:51'),
(117,'Nguyễn Đoàn Hồng Thái','thai.ndh2414370@sis.hust.edu.vn','$2b$10$1CpiyBfdoiICYj0uh0LiEOIbjBjMMVQsf1NJMG1CQ8gFcEtI7vhNK','member','0348530798','#315C4C',1,'2026-08-15 09:48:23'),
(118,'Phạm Lê Dũng','dung.pl2512915@sis.hust.edu.vn','$2b$10$1Y0CpnEO/Vs.CEJw.a1greOzDgduWQNyXH0WaxW7sJ2SOknFmgTm6','member','0855250207','#315C4C',1,'2026-08-15 09:49:45'),
(119,'Vũ Việt Hùng','hung.vv2514168@sis.hust.edu.vn','$2b$10$qN8FEKMK.lwfYnw4GEIFmuzZxTK3ryXzWP2WZUsCdvyTR3LvVUspa','member','0389200706','#315C4C',1,'2026-08-15 09:50:16'),
(120,'Bùi Khánh Linh','linh.bk2514229@sis.hust.edu.vn','$2b$10$jpLKIQ2Wcd5LnHZWjUTtVOZWVx3VVMtHy.AjdgkRNu2AVZ60Ghxoe','member','0827955266','#315C4C',1,'2026-08-15 09:50:45'),
(121,'Trần Quang Minh','minh.tq2512862@sis.hust.edu.vn','$2b$10$TO0U9ttbUQ932k6v7xsIhe/DflVkTUr9W6gZDutDMTaXa7RdtGo86','member','0981240307','#315C4C',1,'2026-08-15 09:51:14'),
(122,'Vũ Khánh Nguyên','nguyen.vk2512640@sis.hust.edu.vn','$2b$10$akvzNBon98rvKsDRjSCeReeMcT8fpoD28DbQaghCjqj8q4kaEIdhO','member','0912576545','#315C4C',1,'2026-08-15 09:52:06'),
(123,'Nguyễn Hồng Anh','anh.nh2514631@sis.hust.edu.vn','$2b$10$FLk8mv7nIeqMy55O1MY21e.8HX0TYWywS/dpvF3aKRb71ZO7nOtru','member','0904728959','#315C4C',1,'2026-08-15 12:42:06'),
(124,'Vũ Hồng Đăng','dang.vh2514023@sis.hust.edu.vn','$2b$10$T9KSJhX6FXJGhE6lvdVHDO.VXzwlRzB6HAoIYhIOiBqS.JCyZ4Zdm','member','0936306356','#315C4C',1,'2026-08-15 12:42:25'),
(125,'Diêm Quỳnh Hoa','hoa.dq2514492@sis.hust.edu.vn','$2b$10$ERHUWFvU1dz.tT3.67KdWOEydiNV3rQmVhayeldfrH0y5CEINi466','member','0983849463','#315C4C',1,'2026-08-15 12:42:40'),
(126,'Trần Anh Kiên','kien.ta2514831@sis.hust.edu.vn','$2b$10$ZERuQiS7TCmH.2antYfk3eNfG62uj6iYgWvbC5yYyfAsQgr04oDo6','member','0968972007','#315C4C',1,'2026-08-15 12:43:07'),
(127,'Nguyễn Nam Khánh','khanh.nn2514206@sis.hust.edu.vn','$2b$10$uS.aZY/ySuQJNBk2uDDuceoENnDrhpi8NcJ2BAik.rcpjlL8sXDWK','member','0818403026','#315C4C',1,'2026-08-15 12:43:21'),
(128,'Ngô Lê Hà Phương','phuong.nlh2514601@sis.hust.edu.vn','$2b$10$szCMq0KZVgLYL2cpQTwWfeYejmVXojpP4Rhdz6D20SPWPb544geIW','member','0399548851','#315C4C',1,'2026-08-15 12:43:38'),
(129,'Đỗ Xuân Đạt','dat.dx2512346@sis.hust.edu.vn','$2b$10$pDixl3K6Oqno5Uc2P5kTDubCC2fZZF4c0N7gNkcBFdiDxWDtH8MPC','vice_leader','0987393870','#315c4c',1,'2026-08-15 12:43:59'),
(130,'Nguyễn Bảo Ngân','ngan.nb2514847@sis.hust.edu.vn','$2b$10$aAaG397vFLS1SaveqtSSmOyCs0LF59XAHDFjlr2XWJp34BBbw0PkG','vice_leader','0385089058','#fbd0cb',1,'2026-08-15 12:44:16'),
(131,'Nguyễn Minh Thành','thanh.nm2512212@sis.hust.edu.vn','$2b$10$n9r46DCte6pg1Jx1jeq15Op2YZNo2V41QczZEHbmVYY1UDB4tpZLq','member','0865866802','#315C4C',1,'2026-08-15 12:44:31'),
(133,'Lê Đức Hoàng','hoang.ld2412188@sis.hust.edu.vn','$2b$10$GiY1DoVr7UxcotpmpAYrp.4WhOYjinD5EMvlYGikT6/AQDNH/jBTm','member','0911710199','#315C4C',1,'2026-08-15 12:46:30'),
(134,'Phạm Khánh Ly','ly.pk2414541@sis.hust.edu.vn','$2b$10$ieHggTr.ATAuz3O0lfbOz.hGicMnNptqzYii18ym0NoG1EemezSsm','member','0943561130','#315C4C',1,'2026-08-15 12:46:43'),
(135,'Nguyễn Minh Nhật','nhat.nm2413034@sis.hust.edu.vn','$2b$10$tv.0ZdjYXe81fWlZyHpzQOoeuSJLlWgxcgUtdRzm.5L1IBL4coguq','member','0356594742','#315C4C',1,'2026-08-15 12:46:56'),
(136,'Võ Quang Thắng','thang.vq2412776@sis.hust.edu.vn','$2b$10$.kFg6webTxYvdOypnAGlmO.1hb2JkBtGDNLtf7Yk2q0u6w7F/1AHC','member','0329638558','#315C4C',1,'2026-08-15 12:47:09'),
(137,'Dương Ngọc Quỳnh Anh','anh.dnq2414825@sis.hust.edu.vn','$2b$10$c7xEPJnVbsqyVLN.DHqnHeAebyvphhz7bwRs/LufYRL4ci9XblxR.','member','0826932101','#315C4C',1,'2026-08-15 12:47:22'),
(138,'Phạm Anh Quân','quan.pa2414325@sis.hust.edu.vn','$2b$10$g6seM.4.KaTpsRPKX0RNLu9LGZ/ocEjlIVcFbKSMdvzqx8EOgpuPS','member','0986660398','#315C4C',1,'2026-08-15 12:47:38'),
(139,'Phạm Vũ Trường Sơn','son.pvt2414343@sis.hust.edu.vn','$2b$10$Sw2waJNIMJBqrLGbmbvqwOc7FwK7tOPBCN/BMyUpjZSGsd6rjYY8y','member','0981956046','#315C4C',1,'2026-08-15 12:47:54'),
(140,'Lê Hà My','my.lh2413023@sis.hust.edu.vn','$2b$10$fTjCn95TOp2L.Rdy7SuYtu.zqQG2boHfTHMmBUMnhvxAOdM6TRYda','member','0912409850','#315C4C',1,'2026-08-15 12:48:06'),
(141,'Phùng Huy Thành','thanh.ph2414381@sis.hust.edu.vn','$2b$10$0q5.ZRpSUPfObJ7FFTI3NOWEIewV89cen3GuO/xpOhoriIgu8h.BG','member','0867779526','#315C4C',1,'2026-08-15 12:48:18'),
(142,'Lê Phan Quân','quan.lp2514858@sis.hust.edu.vn','$2b$10$4rfVquDZuK4fUdK9DZU.1eHjrE8UZ3vDtEeedXLkrLwRhSz4dgIPK','member','0911904596','#315C4C',1,'2026-08-15 12:48:34'),
(167,'Hà Như Nguyệt','nguyet.hn233560@sis.hust.edu.vn','$2b$10$EiP2Cr7ygHBDDconBf3s5O/3.gKeSz0sKXNSZ8deKHRp0cvRrpZP.','leader','0962080452','#315C4C',1,'2026-08-16 04:06:51'),
(168,'Nguyễn Hương Giang','giang.nh2414622@sis.hust.edu.vn','$2b$10$Od6jmGPN7kbxI3Sx3cZuquLaDFBJBlMj0/Vs9IOPtAVE7/HgnBOvK','member','0783121919','#315C4C',1,'2026-08-16 04:45:14'),
(169,'Nguyễn Tiến Thịnh','thinh.nt233662@sis.hust.edu.vn','$2b$10$FuxCM1uOFxb6dA/868apIuDjQY5/sbRodH4h7PslCyA4aM6QSSXNy','leader','0948996871','#315C4C',1,'2026-08-17 03:38:16'),
(170,'Nguyễn Nhật Minh','minh.nn2414257@sis.hust.edu.vn','$2b$10$CBZKg/SLvYRUHhwT.o1MyOMPhfJLySqKyapBP/mE4XMBjWE7/4L/W','member',NULL,'#315C4C',1,'2026-08-17 03:40:28'),
(171,'Đào Trương Nguyên Hoàng ','hoang.dtn2414719@sis.hust.edu.vn','$2b$10$IfB/TUn4ZL6dfUUCjuqcdOQN8UJZAQm9yAPTby0zQSg0syrI14xjq','member',NULL,'#315C4C',1,'2026-08-17 03:40:55'),
(172,'Tổ kế toán SEEE','ktseee@seee.edu.vn','$2b$10$qavbHD5TNK6Z4KNmuSFMkeZNzbCqddlMstiMMB5Nmv0kjlf8sAB6a','admin',NULL,'#315c4c',1,'2026-08-21 07:18:49'),
(173,'Trần Gia Huy','huy.tg233853@sis.hust.edu.vn','$2b$10$h.VAD.1DjbikFThhCEDHfOafFl8rj3Z7G1IKRh25p5Ht8zjQidOlm','admin','0388377440','#e22400',1,'2026-08-24 02:02:08'),
(174,'Nguyễn Duy Việt','viet.nd234049@sis.hust.edu.vn','$2b$10$mxIpc9dKzgGV8EVju7Mpz.Fm1UB0tUeRVQJtYSeAsCGHKxjZ4Aet6','member',NULL,'#315C4C',1,'2026-08-26 02:53:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'nhsvsvwx_seee_activity_hub_db'
--

--
-- Dumping routines for database 'nhsvsvwx_seee_activity_hub_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-29  6:28:24
