/*
  Warnings:

  - A unique constraint covering the columns `[usertag]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `likes` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `saves` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usertag` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "likes" INTEGER NOT NULL,
ADD COLUMN     "saves" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "usertag" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_usertag_key" ON "User"("usertag");
