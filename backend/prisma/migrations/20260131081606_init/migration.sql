-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "walletSetId" TEXT NOT NULL,
    "custodyType" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "blockchain" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "updateDate" TIMESTAMP(3) NOT NULL,
    "createDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_address_key" ON "Wallet"("address");

-- CreateIndex
CREATE INDEX "Wallet_walletSetId_idx" ON "Wallet"("walletSetId");
