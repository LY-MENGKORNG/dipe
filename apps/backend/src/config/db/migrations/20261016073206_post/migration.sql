-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_postId_idx" ON "post"("postId");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_postId_fkey" FOREIGN KEY ("postId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
