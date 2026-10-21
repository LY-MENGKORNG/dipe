/*
  Warnings:

  - You are about to drop the column `postId` on the `post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_postId_fkey";

-- DropIndex
DROP INDEX "post_postId_idx";

-- AlterTable
ALTER TABLE "post" DROP COLUMN "postId";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
