import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { JwtPayload } from '@/common/interfaces';
import { PaginationDto } from '@/common/dto';
import { ChatsService } from './chats.service';
import { SyncChatsDto } from './dto';

@ApiTags('Chats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync chat messages from Upwork extension' })
  syncChats(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: SyncChatsDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.chatsService.syncChats(projectId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List chat messages for a project' })
  findByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.chatsService.findByProject(projectId, pagination);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get latest sync timestamp (for incremental sync)' })
  getLatestSync(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.chatsService.getLatestSync(projectId);
  }
}
