-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (x86_64)
--
-- Host: localhost    Database: femorae_id_system
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `class_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,2,'1'),(2,2,'2'),(3,2,'3'),(4,2,'4'),(5,1,'LKG'),(6,1,'UKG'),(7,1,'1'),(8,1,'2'),(9,1,'3'),(10,1,'4'),(11,1,'5'),(12,1,'6'),(13,1,'7'),(14,1,'8'),(15,1,'9'),(16,1,'10');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `divisions`
--

DROP TABLE IF EXISTS `divisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `divisions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `class_id` int NOT NULL,
  `division_name` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `divisions_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `divisions`
--

LOCK TABLES `divisions` WRITE;
/*!40000 ALTER TABLE `divisions` DISABLE KEYS */;
INSERT INTO `divisions` VALUES (1,1,'A'),(2,1,'B'),(3,2,'A'),(4,2,'B'),(5,3,'A'),(6,3,'B'),(7,4,'A'),(8,4,'B'),(9,5,'A'),(10,5,'B'),(11,5,'C'),(12,6,'A'),(13,6,'B'),(14,6,'C'),(15,7,'A'),(16,7,'B'),(17,7,'C'),(18,8,'A'),(19,8,'B'),(20,8,'C'),(21,9,'A'),(22,9,'B'),(23,9,'C'),(24,10,'A'),(25,10,'B'),(26,10,'C'),(27,11,'A'),(28,11,'B'),(29,11,'C'),(30,12,'A'),(31,12,'B'),(32,12,'C'),(33,13,'A'),(34,13,'B'),(35,13,'C'),(36,14,'A'),(37,14,'B'),(38,14,'C'),(39,15,'A'),(40,15,'B'),(41,15,'C'),(42,16,'A'),(43,16,'B'),(44,16,'C');
/*!40000 ALTER TABLE `divisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `school_student_schema`
--

DROP TABLE IF EXISTS `school_student_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `school_student_schema` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `field_key` varchar(50) NOT NULL,
  `field_label` varchar(100) NOT NULL,
  `field_order` int NOT NULL,
  `required` tinyint(1) DEFAULT '1',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `school_student_schema`
--

LOCK TABLES `school_student_schema` WRITE;
/*!40000 ALTER TABLE `school_student_schema` DISABLE KEYS */;
INSERT INTO `school_student_schema` VALUES (1,1,'student_id','Student ID',1,1,1),(2,1,'student_name','Student Name',2,1,1),(3,1,'mobile','Mobile Number',3,1,1),(4,1,'house','House Name',4,0,1),(5,1,'place','Place',5,0,1),(6,1,'post','Post Office',6,0,1),(7,1,'pin','PIN Code',7,0,1);
/*!40000 ALTER TABLE `school_student_schema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schools`
--

DROP TABLE IF EXISTS `schools`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schools` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schools`
--

LOCK TABLES `schools` WRITE;
/*!40000 ALTER TABLE `schools` DISABLE KEYS */;
INSERT INTO `schools` VALUES (1,'femorae',NULL,NULL,NULL,NULL,NULL,'abdu','1234','2026-01-02 05:22:43'),(2,'CKJM - CHERUR',NULL,NULL,NULL,NULL,NULL,'ckjm','ckjm','2026-01-02 05:23:03');
/*!40000 ALTER TABLE `schools` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `student_field_values`
--

DROP TABLE IF EXISTS `student_field_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_field_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `field_key` varchar(50) NOT NULL,
  `field_value` text,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `student_field_values_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `student_field_values`
--

LOCK TABLES `student_field_values` WRITE;
/*!40000 ALTER TABLE `student_field_values` DISABLE KEYS */;
INSERT INTO `student_field_values` VALUES (15,2,'student_id','1222'),(16,2,'student_name','Abdu PK'),(17,2,'mobile','8138981994'),(18,2,'house','Puli'),(19,2,'place','Vengara'),(20,2,'post','Cherur'),(21,2,'pin','676304'),(22,1,'student_id','1234'),(23,1,'student_name','Abdu Rahman'),(24,1,'mobile','8138981995'),(25,1,'house','Pulikkodan'),(26,1,'place','Cherur'),(27,1,'post','Cherur'),(28,1,'pin','676304'),(29,3,'student_id','9876'),(30,3,'student_name','Sheza'),(31,3,'mobile','1234567890'),(32,3,'house','puli'),(33,3,'place','cherur'),(34,3,'post','cherur'),(35,3,'pin','676304'),(36,4,'student_id','9999'),(37,4,'student_name','sheza'),(38,4,'mobile','3204239840'),(39,4,'house','puli'),(40,4,'place','cherure'),(41,4,'post','cherure'),(42,4,'pin','234234'),(43,5,'student_id','234'),(44,5,'student_name','sheza'),(45,5,'mobile','12332'),(46,5,'house','puli'),(47,5,'place','cherure'),(48,5,'post','cherure'),(49,5,'pin','234234');
/*!40000 ALTER TABLE `student_field_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `class_id` int NOT NULL,
  `division_id` int NOT NULL,
  `photo_name` varchar(255) DEFAULT NULL,
  `photo_status` enum('pending','completed','skipped') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_status` enum('pending','approved') DEFAULT 'pending',
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_role` varchar(50) DEFAULT NULL,
  `approved_mobile` varchar(20) DEFAULT NULL,
  `photo_drive_id` varchar(100) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `deleted_status` tinyint DEFAULT '0',
  `deleted_at` datetime DEFAULT NULL,
  `deleted_by_name` varchar(100) DEFAULT NULL,
  `deleted_by_mobile` varchar(20) DEFAULT NULL,
  `deleted_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,1,7,15,'1234.jpg','completed','2026-01-19 17:50:57','approved','2026-02-14 15:07:50','Abdu','Class Teacher','8138981994','1HwijEmAyAo8IzykmaJ0KJjWaTDC5Hk-e',NULL,0,NULL,NULL,NULL,NULL),(2,1,7,15,'1222.jpg','completed','2026-01-20 02:03:03','approved','2026-01-24 14:55:23','Abdu','Admin','8138981994','1zPaq4tcia3ljHTWFDff4cFZGdbbo3Sz7',NULL,0,NULL,NULL,NULL,NULL),(3,1,7,15,NULL,'completed','2026-01-25 08:07:07','pending',NULL,NULL,NULL,NULL,'10IdTxw5QwYuKYwCggaceVeRK_1r-IOOD',NULL,1,'2026-02-25 00:29:28','av','123','tc'),(4,1,7,15,NULL,'pending','2026-02-24 19:08:13','pending',NULL,NULL,NULL,NULL,NULL,NULL,1,'2026-02-25 00:38:44','abdu','23423','asdf'),(5,1,7,15,NULL,'completed','2026-02-24 19:23:06','pending',NULL,NULL,NULL,NULL,'18Oe9E0IjNDkz8eVqjHwju6SV__yFW9E8',NULL,0,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students_backup`
--

DROP TABLE IF EXISTS `students_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students_backup` (
  `id` int NOT NULL DEFAULT '0',
  `student_id` varchar(50) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `division` varchar(5) DEFAULT NULL,
  `house` varchar(50) DEFAULT NULL,
  `place` varchar(100) DEFAULT NULL,
  `post` varchar(50) DEFAULT NULL,
  `pin` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `photo_name` varchar(100) DEFAULT NULL,
  `photo_status` varchar(20) DEFAULT 'pending',
  `school_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students_backup`
--

LOCK TABLES `students_backup` WRITE;
/*!40000 ALTER TABLE `students_backup` DISABLE KEYS */;
INSERT INTO `students_backup` VALUES (1,'1946','SEHRISH NP','LKG','A','Narippatta House ','Kilinakode Pallikkal Bazar ','Kilinakode Pallikkal Bazar ','392936','7559869952',NULL,'pending',1),(2,'5175','ZAIBA SHERIN K','LKG','A','Koonthala','Achanampalam','Valiyad','583309','9744050507',NULL,'pending',1),(3,'6879','MUHAMMED RAYAN','LKG','A','Alukkal','Cherur','Mannaramkunnu','553182','9556672478',NULL,'pending',1),(4,'4678','AYISHA MIYA K K ','LKG','B','Kollarakandi ','Cherur ','Cherur , Padapparamb ','935860','9556339564',NULL,'pending',1),(5,'5546','IMARAN ALI P A','LKG','B','Palamadathil Ayinikkat ','Achanambalam ','Machingal ','215985','9495300888',NULL,'pending',1),(6,'8120','ANAM LAHZAH IK','LKG','B','Iyythum Kadan ','Memattupara ','Memattupara ','647678','9526449406',NULL,'pending',1),(7,'4060','AYDIN IZYAN ','LKG','C','Kottadan ','Kilinakkode ','Pallikkal Bazar.Kilinakkode ','766984','8943119457',NULL,'pending',1),(8,'4587','AYDIN MUHAMMAD PP ','LKG','C','Puthan Veettil ','Kuttoor South ','Madamchina Ar Nagar','548125','9020821578',NULL,'pending',1),(9,'9152','AYNI ANEES ','LKG','C','Kozhinhikkodan ','Mini','Mini Kapp Road ','850020','9847920580',NULL,'pending',1),(10,'1594','EWAAN MUHAMMED M T','UKG','A','Manayanthodi ','Minikappil ','Minikappil ','391331','9947002745',NULL,'pending',1),(11,'7563','HADI AMAN.K','UKG','A','Kanneth ','Cherur ','Muthuvilkund Aalinchuvad ','676550','8714442715',NULL,'pending',1),(12,'6237','HENZA AYRIN ','UKG','A','Nadammal Puthiyakath ','Cherur ','V.K Madu ','765600','9747672126',NULL,'pending',1),(13,'9461','MUHAMMED HYZIN.T','UKG','B','Thattayil ','Gandhikunnu ','Gandhikunnu ','962293','9895740944',NULL,'pending',1),(14,'5446','IZIN HAADI.K','UKG','B','Kambran ','Memattupara ','Memattupara ','408522','8129059403',NULL,'pending',1),(15,'9172','JAZA FATHIMA.C','UKG','B','Cholakkan ','Kuttoor Madamchina ','Kuttoor ','312115','9567222823',NULL,'pending',1),(16,'6517','MOHAMMED MEHZAN.K','UKG','C','Kavungal ','Kilinakode ','Kilinakode Central Bazar ','166035','8606487793',NULL,'pending',1),(17,'4560','MOHAMMED ZAIN.AP ','UKG','C','Ambilipparamban ','Parappanghana Chena Gandhikunnu','Parappanghana Chena Gandhikunnu ','421635','7975049794',NULL,'pending',1),(18,'4583','MUHAMMED RAZMIN.P','UKG','C','Pakkiyan ','Kilinakkode Kashmir ','Kilinakkode Kashmir ','861776','9656898297',NULL,'pending',1),(19,'8785','SANAD ','1','A','Thommagadan ','Kilinakkode ','Kilinakkode ','655059','7561888370',NULL,'pending',1),(20,'5985','MUHAMMED CT','1','A','Chakkarathodi ','Chulliparambu ','Chulliparambu ','626711','8129536887',NULL,'pending',1),(21,'4329','NEHA MARIYAM.K','1','B','Kunhot ','Kilinakkode ','Thadathipara','679276','7560954847',NULL,'pending',1),(22,'2002','AYISHA NAIRAH.K','1','B','Kanneth ','Cherur ','V K Madu Kundu ','942846','9539612549',NULL,'pending',1),(23,'6472','NEZA FATHIMA ','1','C','Chemmalakundan ','Vengara ','Vengara Vyabhara Bhavan ','334793','9526823423',NULL,'pending',1),(24,'7288','RAYAN MUHAMMED TV','1','C','Asharipadi ','Vengara ','Vengara Asharippadi ','379105','8590900348',NULL,'pending',1),(25,'1914','SAMA FATHIMA.P','2','A','Peedikathara ','Kilinakkode ','Kilinakkode Mudhu Paramb ','952028','9048988755',NULL,'pending',1),(26,'9408','SHAHADAD .UK','2','A','Uthen Karyapurath','Kilinakkode ','Pallikkal Bazar ','761463','6238234802',NULL,'pending',1),(27,'6866','THANHA FATHIMA.K','2','B','Kottadan ','V K Mad','Vk Mad','476890','8848923644',NULL,'pending',1),(28,'7230','EWAAN ADAM .V','2','B','Vilasseri','A R Nagar Koduvayoor ','Ar Nagar Nearest Sifon ','101524','9567046652',NULL,'pending',1),(29,'5254','HENZA ZAIN.KV','2','C','Chundiyil ','Manatti ','Manatti Asharippadi','656927','9744388289',NULL,'pending',1),(30,'3031','SHEZA FATHIMA.K','2','C','Kanneh ','Muduvilkundu ','Mudivilkundu ','424851','9656366699',NULL,'pending',1),(31,'6543','MUHAMMED HADI.K','3','A','Kolakkatti','Vengara ','Vengara Ss Road ','187480','9567408842',NULL,'pending',1),(32,'8366','MOHAMMED RIDHWAN.VP','3','A','Valiya Parambil ','Cherur ','Adivaram ','631792','9444656381',NULL,'pending',1),(33,'2815','ABID SHAH PP','3','B','Puthan Peediyekkal ','Yarampadi ','Yarampadi ','510156','8589990992',NULL,'pending',1),(34,'2290','ADAM VT','3','B','Vettuthottungal ','Poocholamad ','Poocholamad ','187465','9495132997',NULL,'pending',1),(35,'6798','ANAM SALIH  L','3','C','Leva ','Vengara, Mattil Bazar ','Mattil Palli ','962613','8056226661',NULL,'pending',1),(36,'3172','ASMA PANGAT ','3','C','Pangat ','Oorakam ','Oorakam Padinjaril ','233109','9048100701',NULL,'pending',1),(37,'8376','AYISHA DUAA K','4','A','Areekkadan ','Karumbil, Kakkad ','Adivaram ','135011','8891237400',NULL,'pending',1),(38,'9767','AYSHA MEHAR K','4','A','Koonari ','Kilinakkod, Thadathil Paara ','Thadathil Paara ','446843','9645401474',NULL,'pending',1),(39,'8202','AYISHA MIZLA P','4','B','Parisseri ','Adivaram ','Adivaram ','212323','9656684707',NULL,'pending',1),(40,'3284','AYMA AMRIN C','4','B','Cheerangan ','Pathumoochi ','Pathumoochi ','949430','9447301320',NULL,'pending',1),(41,'3861','EWA AIZIN KV ','4','C','Kaithavalappil ','Badariyya Nagar ','Badariyya Nagar ','240318','9895403904',NULL,'pending',1),(42,'9062','FATHIMA ZOHA M','4','C','Mookkammal ','Poocholamad ','Poocholamad ','249783','8793292918',NULL,'pending',1),(43,'5866','HEZA MEHAR M','5','A','Mookkummal ','Poocholamad ','Poocholamad ','163810','7510844680',NULL,'pending',1),(44,'7815','HYZA FATHIMA KV','5','A','Karivattath ','Cherur ','Pandikkallu ','971806','8137916864',NULL,'pending',1),(45,'1882','HYZIN MUHAMMAD UP','5','B','Ullattu Parambil ','Achanambalam ','Achanambalam School Ground, Vengulam','424814','8606555062',NULL,'pending',1),(46,'3576','MEHNA AZRIN PP','5','B','Poovathum Parambil ','Adivaram ','Kottamad ','297147','9605164003',NULL,'pending',1),(47,'3706','MUHAMMED ARSH CK ','5','C','Cherukottayil ','Cherur ','Kottamad ','901697','9995574916',NULL,'pending',1),(48,'1741','MUHAMMAD BISHRULHAFI P','5','C','Parangodath ','Iringallur ','Puthanparamb ','411842','9744067122',NULL,'pending',1),(49,'3427','MUHAMMED HAZIM C','6','A','Chinakkal ','Yarampadi Nattukkall','Nattukall','784881','9961330148',NULL,'pending',1),(50,'2847','MUHAMMED HYZIN P','6','A','Pookuth ','Cherur ','Kazhukanchina ','724169','9656756999',NULL,'pending',1),(51,'3938','MUHAMMED NADIR M','6','B','Mala ','Pakkadapuraya ','Pakkadapuraya ','144541','9048759019',NULL,'pending',1),(52,'4728','MUHAMMED RAZEEN P','6','B','Pulakkal ','Parakkanni ','Sree Subramannya Kshethram Road Parakkanni ','772028','9061101534',NULL,'pending',1),(53,'3270','MUHAMMED SHAZIL KK','6','C','Kangadakkadavan ','Kacheripadi ','Kacherippadi ','193558','8123102520',NULL,'pending',1),(54,'9185','MUHAMMED SHIFIN PK','6','C','Palamadathil Kottiyat ','Achanambalam ','Thottungal ','284917','9048959111',NULL,'pending',1),(55,'2480','MOHAMMED WAFIR KV','7','A','Kalamvalappil ','Chinakkal, Valiyora ','Areeka  Palliyaal ','808988','9847476619',NULL,'pending',1),(56,'3788','MYSHA MEHBIN P','7','A','Pulakkal','Parakkanni ','Malaparamb ','324529','6238593023',NULL,'pending',1),(57,'6912','NAZIL EV','7','B','Ettuveettil ','Vengara, Vettuthode','Kazhukanchina, Vettuthode','449332','9562683032',NULL,'pending',1),(58,'8600','NOOR ANAAM O','7','B','Ovungal ','Vengara, Vettuthod ','Vettuthod ','863546','9947087881',NULL,'pending',1),(59,'5894','RAZDAN FAHAD C','7','C','Chempatty ','Malaparamb,Parakkanni ','Malaparamb Junction ','677014','9847386551',NULL,'pending',1),(60,'6450','RIYAD MAHREZ PK','7','C','Palayakkodan ','Oorakam , Panjayath Padi ','Oorakam Kodalikkund ','262618','9544718779',NULL,'pending',1),(61,'5587','SABA AZMIN ','8','A','Kottiyadan ','Achanambalam ','Machingal Bus Stop ','281650','8907223174',NULL,'pending',1),(62,'6690','SHAIZ MUHAMMED MK','8','A','Moorikunnan ','Mini Kappil ','Cherur Mini Kappil Road ','695358','9746833441',NULL,'pending',1),(63,'5281','SHAMMAS MUHAMMAD AK','8','B','Alukkal ','Mannaramkunn,Cherur ','Cherur ','985667','8606880176',NULL,'pending',1),(64,'4566','ZIYA KENZA M','8','B','Mukkammal ','Poocholamad ','Poocholamad, Kunnupuram ','781871','9567073238',NULL,'pending',1),(65,'4745','AYISHA ARWA. K','8','C','Kottiyadan�','Achanambalam�','Machingal ','278541','9605590503',NULL,'pending',1),(66,'4727','AYISHA JAZA.M','8','C','Moozhiyan','Channayil','Kappil','733838','9847514385',NULL,'pending',1),(67,'2582','AYISHA NYZA P�','9','A','Poovil','Poocholamadu Vengara','Nottappuram','952833','9656176917',NULL,'pending',1),(68,'2321','AYISHA RAZWA. K','9','A','Kottiyadan�','Achanambalam�','Machingal','760404','9605590503',NULL,'pending',1),(69,'4042','AYSHA MARWA K','9','B','Kalathingal','Achanambalam','','202332','7025722175',NULL,'pending',1),(70,'2794','AZAAN MUHAMMED CK','9','B','Cherukottiayil�','Cherur Adivarm�','Crusher Road','144477','9947341479',NULL,'pending',1),(71,'2322','FATHIMA HELANA KT','9','C','Kunnathodhi�','Anjuparamb�','Private�','271470','9747606660',NULL,'pending',1),(72,'2828','FATHIMA ISHA.K','9','C','Kottiyadan','Achanabalam','Achanabalam, Kadkunnil','481424','7994303073',NULL,'pending',1),(73,'5486','FATHIMA JASHIYA.K','10','A','Kunjot House','Kilinakkode,Pallikkal Bazar','Kilinakkode Pallikkal Bazar','922597','8606333038',NULL,'pending',1),(74,'4644','FATHIMA NOORA. M','10','A','Mookummal�','Muttumppuram','Muttumpuram Tower Opposite','511573','9744575895',NULL,'pending',1),(75,'2154','FIDYAN ALI .CK','10','B','Cherukottayil]','Adivaram , Cherur','Adivaram Crusher Road','589250','9037537398',NULL,'pending',1),(76,'4071','IFRA ZAINAB','10','B','Kottukaran','Muthuvilkund','Kongamparamb','741661','7510259382',NULL,'pending',1),(77,'9141','INAM ARMAAN O','10','C','Ovungal','Vengara Vettuthodu','Vettuthodu','399033','9847411881',NULL,'pending',1),(78,'1282','ISMAIL MARVAN.C','10','C','Chemban','Pakkadapuraya','Pakkadapuraya','960186','9747214959',NULL,'pending',1);
/*!40000 ALTER TABLE `students_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students_v2`
--

DROP TABLE IF EXISTS `students_v2`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students_v2` (
  `id` int NOT NULL AUTO_INCREMENT,
  `school_id` int NOT NULL,
  `class_id` varchar(20) NOT NULL,
  `division_id` varchar(20) NOT NULL,
  `approved_status` enum('pending','approved') DEFAULT 'pending',
  `approved_by` int DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `old_student_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=517 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students_v2`
--

LOCK TABLES `students_v2` WRITE;
/*!40000 ALTER TABLE `students_v2` DISABLE KEYS */;
INSERT INTO `students_v2` VALUES (256,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,1),(257,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,2),(258,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,3),(259,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,4),(260,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,5),(261,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,6),(262,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,7),(263,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,8),(264,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,9),(265,2,'1','1','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,10),(266,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,11),(267,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,12),(268,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,13),(269,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,14),(270,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,15),(271,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,16),(272,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,17),(273,2,'1','2','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,18),(274,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,19),(275,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,20),(276,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,21),(277,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,22),(278,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,23),(279,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,24),(280,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,25),(281,2,'2','3','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,26),(282,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,27),(283,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,28),(284,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,29),(285,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,30),(286,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,31),(287,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,32),(288,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,33),(289,2,'2','4','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,34),(290,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,35),(291,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,36),(292,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,37),(293,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,38),(294,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,39),(295,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,40),(296,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,41),(297,2,'3','5','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,42),(298,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,43),(299,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,44),(300,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,45),(301,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,46),(302,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,47),(303,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,48),(304,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,49),(305,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,50),(306,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,51),(307,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,52),(308,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,53),(309,2,'3','6','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,54),(310,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,55),(311,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,56),(312,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,57),(313,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,58),(314,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,59),(315,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,60),(316,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,61),(317,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,62),(318,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,63),(319,2,'4','7','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,64),(320,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,65),(321,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,66),(322,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,67),(323,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,68),(324,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,69),(325,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,70),(326,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,71),(327,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,72),(328,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,73),(329,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,74),(330,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,75),(331,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,76),(332,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,77),(333,2,'4','8','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,78),(334,1,'5','9','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,79),(335,1,'5','9','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,80),(336,1,'5','9','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,81),(337,1,'5','10','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,82),(338,1,'5','10','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,83),(339,1,'5','10','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,84),(340,1,'5','11','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,85),(341,1,'5','11','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,86),(342,1,'5','11','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,87),(343,1,'6','12','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,88),(344,1,'6','12','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,89),(345,1,'6','12','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,90),(346,1,'6','13','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,91),(347,1,'6','13','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,92),(348,1,'6','13','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,93),(349,1,'6','14','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,94),(350,1,'6','14','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,95),(351,1,'6','14','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,96),(352,1,'7','15','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,97),(353,1,'7','15','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,98),(354,1,'7','16','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,99),(355,1,'7','16','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,100),(356,1,'7','17','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,101),(357,1,'7','17','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,102),(358,1,'8','18','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,103),(359,1,'8','18','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,104),(360,1,'8','19','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,105),(361,1,'8','19','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,106),(362,1,'8','20','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,107),(363,1,'8','20','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,108),(364,1,'9','21','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,109),(365,1,'9','21','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,110),(366,1,'9','22','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,111),(367,1,'9','22','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,112),(368,1,'9','23','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,113),(369,1,'9','23','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,114),(370,1,'10','24','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,115),(371,1,'10','24','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,116),(372,1,'10','25','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,117),(373,1,'10','25','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,118),(374,1,'10','26','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,119),(375,1,'10','26','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,120),(376,1,'11','27','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,121),(377,1,'11','27','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,122),(378,1,'11','28','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,123),(379,1,'11','28','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,124),(380,1,'11','29','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,125),(381,1,'11','29','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,126),(382,1,'12','30','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,127),(383,1,'12','30','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,128),(384,1,'12','31','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,129),(385,1,'12','31','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,130),(386,1,'12','32','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,131),(387,1,'12','32','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,132),(388,1,'13','33','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,133),(389,1,'13','33','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,134),(390,1,'13','34','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,135),(391,1,'13','34','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,136),(392,1,'13','35','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,137),(393,1,'13','35','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,138),(394,1,'14','36','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,139),(395,1,'14','36','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,140),(396,1,'14','37','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,141),(397,1,'14','37','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,142),(398,1,'14','38','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,143),(399,1,'14','38','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,144),(400,1,'15','39','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,145),(401,1,'15','39','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,146),(402,1,'15','40','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,147),(403,1,'15','40','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,148),(404,1,'15','41','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,149),(405,1,'15','41','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,150),(406,1,'16','42','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,151),(407,1,'16','42','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,152),(408,1,'16','43','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,153),(409,1,'16','43','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,154),(410,1,'16','44','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,155),(411,1,'16','44','pending',NULL,NULL,'2026-01-14 05:52:44',NULL,156),(511,1,'3','7','pending',NULL,NULL,'2026-01-14 06:11:30',NULL,NULL),(512,1,'3','7','pending',NULL,NULL,'2026-01-14 06:11:33',NULL,NULL),(513,1,'3','7','pending',NULL,NULL,'2026-01-14 12:31:49',NULL,NULL),(514,1,'3','7','pending',NULL,NULL,'2026-01-14 13:01:45',NULL,NULL),(515,1,'2','B','pending',NULL,NULL,'2026-01-15 17:58:21',NULL,NULL),(516,1,'4','A','pending',NULL,NULL,'2026-01-15 17:59:34',NULL,NULL);
/*!40000 ALTER TABLE `students_v2` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `class` varchar(10) NOT NULL,
  `division` varchar(5) NOT NULL,
  `role` varchar(20) DEFAULT 'class_user',
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'lkg_a','$2b$10$s4PdeGRJgPdyrfw6xS0JH.gK97FJvzuMDCnFRFYe7yOWJXPcEOq6a','LKG','A','class_user',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-25  6:40:35
