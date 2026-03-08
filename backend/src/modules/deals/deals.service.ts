import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginationDto, PaginatedResult } from '@/common/dto';
import { CreateDealDto, UpdateDealDto } from './dto';
import { Deal, DealStatus } from '@prisma/client';

@Injectable()
export class DealsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDealDto): Promise<Deal> {
    return this.prisma.deal.create({
      data: dto,
      include: { proposal: { include: { client: true } } },
    });
  }

  async findAll(
    pagination: PaginationDto,
    filters?: { status?: DealStatus },
  ): Promise<PaginatedResult<Deal>> {
    const where = filters?.status ? { status: filters.status } : {};

    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: { proposal: { include: { client: true } } },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return new PaginatedResult(data, total, pagination.page ?? 1, pagination.limit ?? 20);
  }

  async findById(id: string): Promise<Deal> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: { proposal: { include: { client: true } }, project: true },
    });

    if (!deal) {
      throw new NotFoundException(`Deal with id "${id}" not found`);
    }

    return deal;
  }

  async update(id: string, dto: UpdateDealDto): Promise<Deal> {
    await this.findById(id);

    return this.prisma.deal.update({
      where: { id },
      data: dto,
      include: { proposal: { include: { client: true } } },
    });
  }

  async close(id: string, status: 'WON' | 'LOST' | 'CANCELLED'): Promise<Deal> {
    await this.findById(id);

    return this.prisma.deal.update({
      where: { id },
      data: {
        status,
        closedAt: new Date(),
      },
      include: { proposal: { include: { client: true } }, project: true },
    });
  }

  async getStats(): Promise<{
    totalDeals: number;
    totalValue: number;
    negotiating: number;
    won: number;
    lost: number;
    cancelled: number;
  }> {
    const [totalDeals, valueAgg, statusCounts] = await Promise.all([
      this.prisma.deal.count(),
      this.prisma.deal.aggregate({
        _sum: { value: true },
      }),
      this.prisma.deal.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const countByStatus = Object.values(DealStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<DealStatus, number>,
    );

    for (const entry of statusCounts) {
      countByStatus[entry.status] = entry._count.status;
    }

    return {
      totalDeals,
      totalValue: Number(valueAgg._sum.value ?? 0),
      negotiating: countByStatus.NEGOTIATING ?? 0,
      won: countByStatus.WON ?? 0,
      lost: countByStatus.LOST ?? 0,
      cancelled: countByStatus.CANCELLED ?? 0,
    };
  }
}
