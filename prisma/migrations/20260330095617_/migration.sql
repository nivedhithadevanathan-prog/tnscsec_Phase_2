-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(75) NULL,
    `department_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `zone_id` VARCHAR(100) NULL,
    `fullname` VARCHAR(100) NULL,
    `mobile` VARCHAR(75) NULL,
    `email` VARCHAR(100) NULL,
    `role_id` MEDIUMINT NULL DEFAULT 3,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(100) NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `fullname`(`fullname`),
    INDEX `jail_id`(`district_id`),
    INDEX `role_id`(`role_id`),
    INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `is_active` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `seo_id` INTEGER NULL,
    `jrcs` INTEGER NULL,
    `name` VARCHAR(255) NULL,
    `image` BLOB NULL,
    `is_active` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `district` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `is_active` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_dist` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deptid` INTEGER NOT NULL,
    `distid` INTEGER NOT NULL,
    `is_active` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `master_zone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `association_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `association_name` VARCHAR(150) NULL,
    `is_active` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rurel_id` INTEGER NULL DEFAULT 0,
    `tot_voters` INTEGER NOT NULL DEFAULT 0,
    `sc_st` INTEGER NULL DEFAULT 0,
    `women` INTEGER NULL DEFAULT 0,
    `general` INTEGER NULL DEFAULT 0,
    `is_active` INTEGER NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(75) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form1` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `seo_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `remark` VARCHAR(150) NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `selected_count` INTEGER NULL DEFAULT 0,
    `non_selected_count` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form1_non_selected_soc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form1_id` INTEGER NULL,
    `society_id` INTEGER NULL,
    `society_name` VARCHAR(255) NULL,
    `sc_st` INTEGER NULL DEFAULT 0,
    `women` INTEGER NULL DEFAULT 0,
    `general` INTEGER NULL DEFAULT 0,
    `tot_voters` INTEGER NULL DEFAULT 0,

    INDEX `form1_id`(`form1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form1_selected_soc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form1_id` INTEGER NULL,
    `society_id` INTEGER NULL,
    `society_name` VARCHAR(255) NULL,
    `sc_st` INTEGER NULL DEFAULT 0,
    `women` INTEGER NULL DEFAULT 0,
    `general` INTEGER NULL DEFAULT 0,
    `tot_voters` INTEGER NULL DEFAULT 0,

    INDEX `form1_id`(`form1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form2` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NULL,
    `department_id` INTEGER NULL,
    `form1_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `masterzone_count` INTEGER NULL,
    `remark` VARCHAR(255) NULL,
    `selected_soc_count` INTEGER NULL,

    INDEX `fk_form2_form1`(`form1_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form2_non_selected_soc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form2_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NULL,

    INDEX `form2_id`(`form2_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form2_selected_soc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form2_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NULL,

    INDEX `form2_id`(`form2_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form3` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `form2_id` INTEGER NULL,
    `is_active` INTEGER NULL DEFAULT 1,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `selected_soc_count` INTEGER NULL,
    `remarks` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `district_name` VARCHAR(255) NULL,
    `zone_name` VARCHAR(255) NULL,

    INDEX `fk_form3_form2`(`form2_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form3_societies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form3_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NULL,
    `ass_memlist` INTEGER NULL,
    `ero_claim` INTEGER NULL,
    `jcount` INTEGER NULL,
    `rcount` INTEGER NULL,
    `total` INTEGER NULL,
    `rural_id` INTEGER NULL,
    `tot_voters` INTEGER NULL,

    INDEX `form3_id`(`form3_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form4` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `district_name` VARCHAR(255) NULL,
    `zone_id` INTEGER NULL,
    `zone_name` VARCHAR(255) NULL,
    `selected_soc_count` INTEGER NULL DEFAULT 0,
    `filed_count` INTEGER NULL DEFAULT 0,
    `unfiled_count` INTEGER NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form4_filed_soc_mem_count` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form4_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NULL,
    `rural_id` INTEGER NOT NULL,
    `rural_sc_st` INTEGER NULL DEFAULT 0,
    `rural_women` INTEGER NULL DEFAULT 0,
    `rural_general` INTEGER NULL DEFAULT 0,
    `rural_sc_st_dlg` INTEGER NULL DEFAULT 0,
    `rural_women_dlg` INTEGER NULL DEFAULT 0,
    `rural_general_dlg` INTEGER NULL DEFAULT 0,
    `rural_tot_voters` INTEGER NULL DEFAULT 0,
    `declared_sc_st` INTEGER NULL DEFAULT 0,
    `declared_women` INTEGER NULL DEFAULT 0,
    `declared_general` INTEGER NULL DEFAULT 0,
    `declared_sc_st_dlg` INTEGER NULL DEFAULT 0,
    `declared_women_dlg` INTEGER NULL DEFAULT 0,
    `declared_general_dlg` INTEGER NULL DEFAULT 0,
    `declared_tot_voters` INTEGER NULL DEFAULT 0,
    `tot_voters` INTEGER NULL DEFAULT 0,
    `election_status` ENUM('QUALIFIED', 'UNOPPOSED', 'UNQUALIFIED') NULL,
    `remarks` VARCHAR(255) NULL,
    `decision_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_stopped` BOOLEAN NULL DEFAULT false,
    `stopped_at` DATETIME(0) NULL,
    `stopped_by` INTEGER NULL,
    `stop_remark` VARCHAR(500) NULL,
    `stop_locked` BOOLEAN NULL DEFAULT false,

    INDEX `form4_id`(`form4_id`),
    INDEX `idx_form4_election_status`(`election_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form4_unfiled_soc_mem_count` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form4_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NULL,
    `rural_id` INTEGER NOT NULL,
    `sc_st` INTEGER NULL DEFAULT 0,
    `sc_st_dlg` INTEGER NULL DEFAULT 0,
    `women` INTEGER NULL DEFAULT 0,
    `women_dlg` INTEGER NULL DEFAULT 0,
    `general` INTEGER NULL DEFAULT 0,
    `general_dlg` INTEGER NULL DEFAULT 0,
    `tot_voters` INTEGER NULL DEFAULT 0,
    `remarks` VARCHAR(255) NULL,

    INDEX `form4_id`(`form4_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form5` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form4_filed_soc_id` INTEGER NOT NULL,
    `category_type` ENUM('sc_st', 'women', 'general', 'sc_st_dlg', 'women_dlg', 'general_dlg') NULL,
    `member_name` VARCHAR(255) NOT NULL,
    `aadhar_no` VARCHAR(20) NOT NULL,
    `is_active` BOOLEAN NULL DEFAULT true,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_form5_to_form4filed`(`form4_filed_soc_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form6` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `status` ENUM('DRAFT', 'SUBMITTED') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `submitted_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form6_candidate_event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form6_id` INTEGER NOT NULL,
    `form5_member_id` INTEGER NOT NULL,
    `event_type` ENUM('WITHDRAW', 'REINSTATE') NULL,
    `event_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `event_by` INTEGER NOT NULL,

    INDEX `fk_form6_event`(`form6_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form6_society_decision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form6_id` INTEGER NOT NULL,
    `form4_filed_soc_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NULL,
    `election_action` ENUM('SHOW', 'STOP') NULL,
    `election_status` ENUM('QUALIFIED', 'UNQUALIFIED', 'UNOPPOSED') NULL,
    `final_sc_st_count` INTEGER NULL DEFAULT 0,
    `final_sc_st_dlg_count` INTEGER NULL DEFAULT 0,
    `final_women_count` INTEGER NULL DEFAULT 0,
    `final_women_dlg_count` INTEGER NULL DEFAULT 0,
    `final_general_count` INTEGER NULL DEFAULT 0,
    `final_general_dlg_count` INTEGER NULL DEFAULT 0,
    `final_total_count` INTEGER NULL DEFAULT 0,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_form6_soc`(`form6_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form7` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `district_id` INTEGER NOT NULL,
    `district_name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form7_societies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form7_id` INTEGER NOT NULL,
    `society_id` INTEGER NOT NULL,
    `society_name` VARCHAR(255) NOT NULL,
    `final_sc_st_count` INTEGER NULL DEFAULT 0,
    `final_women_count` INTEGER NULL DEFAULT 0,
    `final_general_count` INTEGER NULL DEFAULT 0,
    `final_sc_st_dlg_count` INTEGER NULL DEFAULT 0,
    `final_women_dlg_count` INTEGER NULL DEFAULT 0,
    `final_general_dlg_count` INTEGER NULL DEFAULT 0,
    `form3_total` INTEGER NULL DEFAULT 0,
    `casted_votes_count` INTEGER NULL DEFAULT 0,
    `voting_percentage` DECIMAL(5, 2) NULL DEFAULT 0.00,
    `ballot_box_count` INTEGER NULL DEFAULT 0,
    `stamp_count` INTEGER NULL DEFAULT 0,
    `polling_stations_count` INTEGER NULL DEFAULT 0,
    `election_officers_count` INTEGER NULL DEFAULT 0,
    `polling_suspension_count` ENUM('RULE_52_18', 'RULE_52A_6', 'NO_ISSUES') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_form7_society`(`form7_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form8` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `district_id` INTEGER NOT NULL,
    `district_name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form8_final_result` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form8_id` INTEGER NOT NULL,
    `form7_society_id` INTEGER NOT NULL,
    `form5_member_id` INTEGER NOT NULL,
    `category_type` ENUM('SC_ST', 'WOMEN', 'GENERAL', 'SC_ST_DLG', 'WOMEN_DLG', 'GENERAL_DLG') NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_form8_result_form8_id`(`form8_id`),
    INDEX `idx_form8_result_member_id`(`form5_member_id`),
    INDEX `idx_form8_result_society_id`(`form7_society_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form8_polling_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form8_id` INTEGER NOT NULL,
    `form7_society_id` INTEGER NOT NULL,
    `ballot_votes_at_counting` INTEGER NOT NULL,
    `valid_votes` INTEGER NOT NULL,
    `invalid_votes` INTEGER NOT NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_form8_polling_form8_id`(`form8_id`),
    INDEX `idx_form8_polling_society_id`(`form7_society_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form9` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `status` ENUM('DRAFT', 'SUBMITTED') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form9_candidate_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form9_id` INTEGER NOT NULL,
    `form9_society_id` INTEGER NOT NULL,
    `form5_member_id` INTEGER NOT NULL,
    `status` ENUM('ELIGIBLE', 'REJECTED', 'WITHDRAWN', 'CONTESTING', 'ELECTED', 'LOST', 'NOT_SELECTED') NULL,
    `remarks` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_f9cs_form5`(`form5_member_id`),
    INDEX `fk_f9cs_form9`(`form9_id`),
    UNIQUE INDEX `uq_f9_candidate`(`form9_society_id`, `form5_member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form9_society` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form9_id` INTEGER NOT NULL,
    `form4_filed_soc_id` INTEGER NOT NULL,
    `election_type` ENUM('UNOPPOSED', 'POLL') NULL,
    `president_form5_candidate_id` INTEGER NULL,
    `status` ENUM('DRAFT', 'FINALIZED') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_f9soc_form4_filed`(`form4_filed_soc_id`),
    INDEX `fk_f9soc_form9`(`form9_id`),
    INDEX `fk_f9soc_president`(`president_form5_candidate_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form10` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uid` INTEGER NOT NULL,
    `department_id` INTEGER NULL,
    `district_id` INTEGER NULL,
    `zone_id` INTEGER NULL,
    `status` ENUM('DRAFT', 'SUBMITTED') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form10_candidate_status` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form10_id` INTEGER NOT NULL,
    `form10_society_id` INTEGER NOT NULL,
    `form5_member_id` INTEGER NOT NULL,
    `status` ENUM('ELIGIBLE', 'REJECTED', 'WITHDRAWN', 'CONTESTING', 'ELECTED', 'LOST', 'NOT_SELECTED') NULL,
    `remarks` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_f10cs_form10`(`form10_id`),
    INDEX `fk_f10cs_form5`(`form5_member_id`),
    UNIQUE INDEX `uq_f10_candidate`(`form10_society_id`, `form5_member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form10_society` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `form10_id` INTEGER NOT NULL,
    `form4_filed_soc_id` INTEGER NOT NULL,
    `election_type` ENUM('UNOPPOSED', 'POLL') NULL,
    `vice_president_form5_candidate_id` INTEGER NULL,
    `status` ENUM('DRAFT', 'FINALIZED') NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_f10soc_form10`(`form10_id`),
    INDEX `fk_f10soc_form4_filed`(`form4_filed_soc_id`),
    INDEX `fk_f10soc_vice_president`(`vice_president_form5_candidate_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `form1_non_selected_soc` ADD CONSTRAINT `form1_non_selected_soc_ibfk_1` FOREIGN KEY (`form1_id`) REFERENCES `form1`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form1_selected_soc` ADD CONSTRAINT `form1_selected_soc_ibfk_1` FOREIGN KEY (`form1_id`) REFERENCES `form1`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form2` ADD CONSTRAINT `fk_form2_form1` FOREIGN KEY (`form1_id`) REFERENCES `form1`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form2_non_selected_soc` ADD CONSTRAINT `form2_non_selected_soc_ibfk_1` FOREIGN KEY (`form2_id`) REFERENCES `form2`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form2_selected_soc` ADD CONSTRAINT `form2_selected_soc_ibfk_1` FOREIGN KEY (`form2_id`) REFERENCES `form2`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form3` ADD CONSTRAINT `fk_form3_form2` FOREIGN KEY (`form2_id`) REFERENCES `form2`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form3_societies` ADD CONSTRAINT `form3_societies_ibfk_1` FOREIGN KEY (`form3_id`) REFERENCES `form3`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form4_filed_soc_mem_count` ADD CONSTRAINT `fk_form4_filed_soc` FOREIGN KEY (`form4_id`) REFERENCES `form4`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form4_unfiled_soc_mem_count` ADD CONSTRAINT `fk_form4_unfiled_soc` FOREIGN KEY (`form4_id`) REFERENCES `form4`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form5` ADD CONSTRAINT `fk_form5_to_form4filed` FOREIGN KEY (`form4_filed_soc_id`) REFERENCES `form4_filed_soc_mem_count`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form6_candidate_event` ADD CONSTRAINT `fk_form6_event` FOREIGN KEY (`form6_id`) REFERENCES `form6`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form6_society_decision` ADD CONSTRAINT `fk_form6_soc` FOREIGN KEY (`form6_id`) REFERENCES `form6`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form7_societies` ADD CONSTRAINT `fk_form7_society` FOREIGN KEY (`form7_id`) REFERENCES `form7`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form8_final_result` ADD CONSTRAINT `fk_form8_result_form8` FOREIGN KEY (`form8_id`) REFERENCES `form8`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form8_polling_details` ADD CONSTRAINT `fk_form8_polling_form7_society` FOREIGN KEY (`form7_society_id`) REFERENCES `form7_societies`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form8_polling_details` ADD CONSTRAINT `fk_form8_polling_form8` FOREIGN KEY (`form8_id`) REFERENCES `form8`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form9_candidate_status` ADD CONSTRAINT `fk_f9cs_form5` FOREIGN KEY (`form5_member_id`) REFERENCES `form5`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form9_candidate_status` ADD CONSTRAINT `fk_f9cs_form9` FOREIGN KEY (`form9_id`) REFERENCES `form9`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form9_candidate_status` ADD CONSTRAINT `fk_f9cs_society` FOREIGN KEY (`form9_society_id`) REFERENCES `form9_society`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form9_society` ADD CONSTRAINT `fk_f9soc_form4_filed` FOREIGN KEY (`form4_filed_soc_id`) REFERENCES `form4_filed_soc_mem_count`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form9_society` ADD CONSTRAINT `fk_f9soc_form9` FOREIGN KEY (`form9_id`) REFERENCES `form9`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form9_society` ADD CONSTRAINT `fk_f9soc_president` FOREIGN KEY (`president_form5_candidate_id`) REFERENCES `form5`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form10_candidate_status` ADD CONSTRAINT `fk_f10cs_form10` FOREIGN KEY (`form10_id`) REFERENCES `form10`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form10_candidate_status` ADD CONSTRAINT `fk_f10cs_form5` FOREIGN KEY (`form5_member_id`) REFERENCES `form5`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form10_candidate_status` ADD CONSTRAINT `fk_f10cs_society` FOREIGN KEY (`form10_society_id`) REFERENCES `form10_society`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form10_society` ADD CONSTRAINT `fk_f10soc_form10` FOREIGN KEY (`form10_id`) REFERENCES `form10`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form10_society` ADD CONSTRAINT `fk_f10soc_form4_filed` FOREIGN KEY (`form4_filed_soc_id`) REFERENCES `form4_filed_soc_mem_count`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `form10_society` ADD CONSTRAINT `fk_f10soc_vice_president` FOREIGN KEY (`vice_president_form5_candidate_id`) REFERENCES `form5`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
