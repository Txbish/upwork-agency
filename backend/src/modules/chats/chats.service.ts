import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { SyncChatsDto } from './dto';
import { ChatMessage } from '@prisma/client';

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bulk upsert chat messages for a project.
   * Deduplicates by (projectId, sentAt, senderName) unique constraint.
   * Returns count of newly created messages.
   */
  async syncChats(
    projectId: string,
    dto: SyncChatsDto,
    syncedById?: string,
  ): Promise<{ synced: number; total: number }> {
    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }

    let synced = 0;

    for (const msg of dto.messages) {
      try {
        await this.prisma.chatMessage.upsert({
          where: {
            projectId_sentAt_senderName: {
              projectId,
              sentAt: new Date(msg.sentAt),
              senderName: msg.senderName,
            },
          },
          update: {}, // no-op on duplicate
          create: {
            projectId,
            senderName: msg.senderName,
            senderType: msg.senderType,
            content: msg.content,
            sentAt: new Date(msg.sentAt),
            upworkRoomId: dto.upworkRoomId,
            syncedById,
          },
        });
        synced++;
      } catch {
        // Skip duplicates that slip through race conditions
      }
    }

    return { synced, total: dto.messages.length };
  }

  /**
   * List chat messages for a project, ordered by sentAt ascending.
   */
  async findByProject(
    projectId: string,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<ChatMessage>> {
    const where = { projectId };

    const [data, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { sentAt: 'asc' },
        include: {
          syncedBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.chatMessage.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  /**
   * Get the latest synced message timestamp for a project.
   * The extension uses this for incremental sync.
   */
  async getLatestSync(projectId: string): Promise<{ latestSentAt: string | null; count: number }> {
    const [latest, count] = await Promise.all([
      this.prisma.chatMessage.findFirst({
        where: { projectId },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true },
      }),
      this.prisma.chatMessage.count({ where: { projectId } }),
    ]);

    return {
      latestSentAt: latest?.sentAt?.toISOString() ?? null,
      count,
    };
  }
}
