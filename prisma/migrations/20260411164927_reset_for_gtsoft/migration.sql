/*
  Warnings:

  - A unique constraint covering the columns `[providerId,systemKey]` on the table `TicketPriority` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerId,systemKey]` on the table `TicketStatus` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TicketPriority_providerId_systemKey_key" ON "TicketPriority"("providerId", "systemKey");

-- CreateIndex
CREATE UNIQUE INDEX "TicketStatus_providerId_systemKey_key" ON "TicketStatus"("providerId", "systemKey");
