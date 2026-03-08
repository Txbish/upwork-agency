import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaginatedResult } from '@/common/dto';
import { CreateProposalDto, UpdateProposalDto, FindProposalsDto } from './dto';
import { Proposal, ProposalStatus, Prisma } from '@prisma/client';

const PROPOSAL_INCLUDE = {
  agent: { include: { user: true } },
  client: true,
  scriptVersion: { include: { script: true } },
  niche: true,
  closer: true,
  videoProposal: true,
  meeting: true,
  deal: true,
};

@Injectable()
export class ProposalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProposalDto): Promise<Proposal> {
    return this.prisma.proposal.create({
      data: dto,
      include: PROPOSAL_INCLUDE,
    });
  }

  async findAll(query: FindProposalsDto): Promise<PaginatedResult<Proposal>> {
    const where: Prisma.ProposalWhereInput = {};

    if (query.agentId) where.agentId = query.agentId;
    if (query.clientId) where.clientId = query.clientId;
    if (query.nicheId) where.nicheId = query.nicheId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.proposal.findMany({
        where,
        skip: query.skip,
        take: query.take,
        include: PROPOSAL_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.proposal.count({ where }),
    ]);

    return new PaginatedResult(data, total, query.page ?? 1, query.limit ?? 20);
  }

  async findById(id: string): Promise<Proposal> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: PROPOSAL_INCLUDE,
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with id "${id}" not found`);
    }

    return proposal;
  }

  async update(id: string, dto: UpdateProposalDto): Promise<Proposal> {
    await this.findById(id);
    return this.prisma.proposal.update({
      where: { id },
      data: dto,
      include: PROPOSAL_INCLUDE,
    });
  }

  async updateStatus(id: string, status: ProposalStatus): Promise<Proposal> {
    await this.findById(id);

    const data: Prisma.ProposalUpdateInput = { status };

    if (status === ProposalStatus.SENT) {
      data.sentAt = new Date();
    }
    if (status === ProposalStatus.REPLIED) {
      data.replyAt = new Date();
    }

    return this.prisma.proposal.update({
      where: { id },
      data,
      include: PROPOSAL_INCLUDE,
    });
  }

  async getQueue(nicheId: string): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      where: {
        nicheId,
        closerId: null,
        status: ProposalStatus.SENT,
      },
      include: PROPOSAL_INCLUDE,
      orderBy: { sentAt: 'asc' },
    });
  }

  async claim(proposalId: string, closerId: string): Promise<Proposal> {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    if (proposal.closerId) {
      throw new ConflictException('Proposal has already been claimed');
    }

    if (proposal.nicheId) {
      const assignment = await this.prisma.closerNiche.findUnique({
        where: { userId_nicheId: { userId: closerId, nicheId: proposal.nicheId } },
      });
      if (!assignment) {
        throw new ConflictException('You are not assigned to this niche');
      }
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { closerId, claimedAt: new Date() },
      include: PROPOSAL_INCLUDE,
    });
  }

  async getStats(agentId?: string): Promise<Record<ProposalStatus, number>> {
    const where: Prisma.ProposalWhereInput = {};
    if (agentId) where.agentId = agentId;

    const counts = await this.prisma.proposal.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    const stats = Object.values(ProposalStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<ProposalStatus, number>,
    );

    for (const entry of counts) {
      stats[entry.status] = entry._count.status;
    }

    return stats;
  }
}
