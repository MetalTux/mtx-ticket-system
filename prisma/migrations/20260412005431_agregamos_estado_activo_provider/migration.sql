-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "ProviderCompany" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
