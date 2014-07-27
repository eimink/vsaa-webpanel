SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `VSAA` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `VSAA` ;

-- -----------------------------------------------------
-- Table `VSAA`.`Applications`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `VSAA`.`Applications` (
  `Id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `Name` VARCHAR(64) NOT NULL ,
  `ApiKey` VARCHAR(64) NOT NULL ,
  `ApiSecret` VARCHAR(128) NOT NULL ,
  `ApiSalt` VARCHAR(64) NOT NULL ,
  PRIMARY KEY (`Id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `VSAA`.`Events`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `VSAA`.`Events` (
  `Id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `DeviceIdentifier` VARCHAR(128) NOT NULL ,
  `Description` VARCHAR(255) NOT NULL ,
  `Logged` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() ,
  `Applications_Id` INT UNSIGNED NOT NULL ,
  PRIMARY KEY (`Id`) ,
  FULLTEXT INDEX `Description` (`Description` ASC) ,
  INDEX `Logtime` (`Logged` ASC) ,
  INDEX `fk_Events_Applications_idx` (`Applications_Id` ASC) ,
  CONSTRAINT `fk_Events_Applications`
    FOREIGN KEY (`Applications_Id` )
    REFERENCES `VSAA`.`Applications` (`Id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `VSAA`.`Users`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `VSAA`.`Users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
  `email` VARCHAR(128) NOT NULL ,
  `password` VARCHAR(128) NOT NULL ,
  `salt` VARCHAR(128) NOT NULL ,
  PRIMARY KEY (`id`) )
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `VSAA`.`Users_has_Applications`
-- -----------------------------------------------------
CREATE  TABLE IF NOT EXISTS `VSAA`.`Users_has_Applications` (
  `Users_id` INT UNSIGNED NOT NULL ,
  `Applications_Id` INT UNSIGNED NOT NULL ,
  `Access_Level` VARCHAR(45) NULL ,
  PRIMARY KEY (`Users_id`, `Applications_Id`) ,
  INDEX `fk_Users_has_Applications_Applications1_idx` (`Applications_Id` ASC) ,
  INDEX `fk_Users_has_Applications_Users1_idx` (`Users_id` ASC) ,
  CONSTRAINT `fk_Users_has_Applications_Users1`
    FOREIGN KEY (`Users_id` )
    REFERENCES `VSAA`.`Users` (`id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Users_has_Applications_Applications1`
    FOREIGN KEY (`Applications_Id` )
    REFERENCES `VSAA`.`Applications` (`Id` )
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
