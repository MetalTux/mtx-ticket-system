-- AlterTable
ALTER TABLE "TicketCategory" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TicketPriority" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "TicketStatus" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
