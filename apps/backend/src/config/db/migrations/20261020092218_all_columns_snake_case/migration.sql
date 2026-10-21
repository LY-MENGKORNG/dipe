-- AlterTable
ALTER TABLE "post" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "post" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "post" RENAME COLUMN "userId" TO "user_id";

-- RenameForeignKey
ALTER TABLE "post" RENAME CONSTRAINT "post_userId_fkey" TO "post_user_id_fkey";

-- AlterTable
ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "user" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at";
