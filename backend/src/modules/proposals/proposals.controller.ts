import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto, UpdateProposalDto, FindProposalsDto, UpdateStatusDto } from './dto';
import { CurrentUser } from '@/common/decorators';
import { JwtPayload } from '@/common/interfaces';

@ApiTags('Proposals')
@ApiBearerAuth()
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new proposal' })
  create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get proposal status counts' })
  getStats(@Query('agentId') agentId?: string) {
    return this.proposalsService.getStats(agentId);
  }

  @Get('queue/:nicheId')
  @ApiOperation({ summary: 'Get unclaimed proposals in a niche queue' })
  getQueue(@Param('nicheId') nicheId: string) {
    return this.proposalsService.getQueue(nicheId);
  }

  @Get()
  @ApiOperation({ summary: 'List proposals with filters' })
  findAll(@Query() query: FindProposalsDto) {
    return this.proposalsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get proposal by ID' })
  findById(@Param('id') id: string) {
    return this.proposalsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a proposal' })
  update(@Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.proposalsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update proposal status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.proposalsService.updateStatus(id, dto.status);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Closer claims a proposal from the queue' })
  claim(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.proposalsService.claim(id, user.sub);
  }
}
