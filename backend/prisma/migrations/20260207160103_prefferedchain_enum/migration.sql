/*
  Warnings:

  - Changed the type of `preferredChain` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PreferredChain" AS ENUM ('ETH-SEPOLIA', 'BASE-SEPOLIA', 'AVAX-FUJI', 'ARC-TESTNET');

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "preferredChain",
ADD COLUMN     "preferredChain" "PreferredChain" NOT NULL;
