/*
  Warnings:

  - You are about to drop the column `plan` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" DROP COLUMN "plan",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionStatus";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'Free',
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT NOT NULL DEFAULT 'active';
