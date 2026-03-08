-- AlterTable
ALTER TABLE "proposals" ADD COLUMN     "claimed_at" TIMESTAMP(3),
ADD COLUMN     "closer_id" TEXT,
ADD COLUMN     "niche_id" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "scripts" ADD COLUMN     "niche_id" TEXT;

-- CreateTable
CREATE TABLE "niches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "niches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "closer_niches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "niche_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "closer_niches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "niches_name_key" ON "niches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "niches_slug_key" ON "niches"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "closer_niches_user_id_niche_id_key" ON "closer_niches"("user_id", "niche_id");

-- CreateIndex
CREATE INDEX "idx_proposals_niche" ON "proposals"("niche_id");

-- CreateIndex
CREATE INDEX "idx_proposals_closer" ON "proposals"("closer_id");

-- AddForeignKey
ALTER TABLE "closer_niches" ADD CONSTRAINT "closer_niches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closer_niches" ADD CONSTRAINT "closer_niches_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_niche_id_fkey" FOREIGN KEY ("niche_id") REFERENCES "niches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_closer_id_fkey" FOREIGN KEY ("closer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
