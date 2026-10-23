-- RenameColumn
ALTER TABLE "post" RENAME COLUMN "authorId" TO "author_id";

-- RenameIndex
ALTER INDEX "post_authorId_idx" RENAME TO "post_author_id_idx";

-- RenameForeignKey
ALTER TABLE "post" RENAME CONSTRAINT "post_authorId_fkey" TO "post_author_id_fkey";
