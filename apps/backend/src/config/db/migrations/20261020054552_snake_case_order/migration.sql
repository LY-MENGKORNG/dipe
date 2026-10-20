/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Order";

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);
