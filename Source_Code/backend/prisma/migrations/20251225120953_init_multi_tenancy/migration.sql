/*
  Warnings:

  - You are about to drop the column `aiLimitMax` on the `Team` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "resource" TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "aiLimitMax",
ADD COLUMN     "aiTokenLimit" INTEGER NOT NULL DEFAULT 1000;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "TeamMember_teamId_idx" ON "TeamMember"("teamId");
