/*
  Warnings:

  - Added the required column `systemKey` to the `TicketPriority` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemKey` to the `TicketStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TicketPriority" ADD COLUMN     "systemKey" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TicketStatus" ADD COLUMN     "systemKey" TEXT NOT NULL;
