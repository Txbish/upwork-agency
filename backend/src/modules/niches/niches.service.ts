import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateNicheDto, UpdateNicheDto } from './dto';

@Injectable()
export class NichesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNicheDto) {
    return this.prisma.niche.create({ data: dto });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.niche.findMany({
      where,
      include: { _count: { select: { closers: true, proposals: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const niche = await this.prisma.niche.findUnique({
      where: { id },
      include: {
        closers: { include: { user: { include: { role: true } } } },
        _count: { select: { proposals: true } },
      },
    });
    if (!niche) throw new NotFoundException('Niche not found');
    return niche;
  }

  async update(id: string, dto: UpdateNicheDto) {
    await this.findOne(id);
    return this.prisma.niche.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.niche.update({ where: { id }, data: { isActive: false } });
  }

  async getClosers(nicheId: string) {
    await this.findOne(nicheId);
    const assignments = await this.prisma.closerNiche.findMany({
      where: { nicheId },
      include: { user: { include: { role: true, team: true } } },
    });
    return assignments.map((a) => a.user);
  }

  async assignCloser(nicheId: string, userId: string) {
    await this.findOne(nicheId);
    const existing = await this.prisma.closerNiche.findUnique({
      where: { userId_nicheId: { userId, nicheId } },
    });
    if (existing) throw new ConflictException('Closer is already assigned to this niche');
    return this.prisma.closerNiche.create({ data: { userId, nicheId } });
  }

  async removeCloser(nicheId: string, userId: string) {
    const existing = await this.prisma.closerNiche.findUnique({
      where: { userId_nicheId: { userId, nicheId } },
    });
    if (!existing) throw new NotFoundException('Closer is not assigned to this niche');
    return this.prisma.closerNiche.delete({
      where: { userId_nicheId: { userId, nicheId } },
    });
  }
}
