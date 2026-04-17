-- Data migration for deprecated project stages
UPDATE "projects" SET "stage" = 'SCRIPT_REVIEW' WHERE "stage" = 'SCRIPTED';
UPDATE "projects" SET "stage" = 'UNDER_REVIEW' WHERE "stage" = 'VIDEO_DRAFT';

-- AlterEnum
ALTER TYPE "ProjectStage" RENAME TO "ProjectStage_old";
CREATE TYPE "ProjectStage" AS ENUM ('DISCOVERED', 'SCRIPT_REVIEW', 'UNDER_REVIEW', 'ASSIGNED', 'BID_SUBMITTED', 'VIEWED', 'MESSAGED', 'INTERVIEW', 'WON', 'IN_PROGRESS', 'COMPLETED', 'LOST', 'CANCELLED');
ALTER TABLE "projects" ALTER COLUMN "stage" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "stage" TYPE "ProjectStage" USING ("stage"::text::"ProjectStage");
ALTER TABLE "projects" ALTER COLUMN "stage" SET DEFAULT 'DISCOVERED';
DROP TYPE "ProjectStage_old";
