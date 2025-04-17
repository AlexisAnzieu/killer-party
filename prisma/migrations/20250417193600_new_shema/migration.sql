/*
  Warnings:

  - Added the required column `updatedAt` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Player` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `photoUrl` VARCHAR(191) NULL;
