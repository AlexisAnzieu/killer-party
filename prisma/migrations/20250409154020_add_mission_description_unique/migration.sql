/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `Mission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Mission_description_key" ON "Mission"("description");
