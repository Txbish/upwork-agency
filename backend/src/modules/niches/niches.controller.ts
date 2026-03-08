import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NichesService } from './niches.service';
import { CreateNicheDto, UpdateNicheDto, AssignCloserDto } from './dto';
import { Roles } from '@/common/decorators';

@ApiTags('Niches')
@ApiBearerAuth()
@Controller('niches')
export class NichesController {
  constructor(private readonly nichesService: NichesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new niche' })
  async create(@Body() dto: CreateNicheDto) {
    return this.nichesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all niches' })
  async findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.nichesService.findAll(includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get niche by ID with closers' })
  async findOne(@Param('id') id: string) {
    return this.nichesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a niche' })
  async update(@Param('id') id: string, @Body() dto: UpdateNicheDto) {
    return this.nichesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a niche (set inactive)' })
  async remove(@Param('id') id: string) {
    return this.nichesService.remove(id);
  }

  @Get(':id/closers')
  @ApiOperation({ summary: 'List closers assigned to a niche' })
  async getClosers(@Param('id') id: string) {
    return this.nichesService.getClosers(id);
  }

  @Post(':id/closers')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign a closer to a niche' })
  async assignCloser(@Param('id') id: string, @Body() dto: AssignCloserDto) {
    return this.nichesService.assignCloser(id, dto.userId);
  }

  @Delete(':id/closers/:userId')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a closer from a niche' })
  async removeCloser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.nichesService.removeCloser(id, userId);
  }
}
