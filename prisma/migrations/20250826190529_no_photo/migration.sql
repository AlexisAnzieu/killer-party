/*
  Warnings:

  - Made the column `photoUrl` on table `Player` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Player` MODIFY `photoUrl` VARCHAR(191) NOT NULL;
