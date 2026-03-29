-- CreateEnum
CREATE TYPE "ChatSenderType" AS ENUM ('CLIENT', 'AGENCY');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "imported_from_extension" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "upwork_skills" TEXT[];

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_type" "ChatSenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "upwork_room_id" TEXT,
    "synced_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_chat_messages_project" ON "chat_messages"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_chat_messages_dedup" ON "chat_messages"("project_id", "sent_at", "sender_name");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_synced_by_id_fkey" FOREIGN KEY ("synced_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
