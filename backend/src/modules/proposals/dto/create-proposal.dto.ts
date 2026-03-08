import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProposalStatus } from '@prisma/client';

export class CreateProposalDto {
  @ApiProperty()
  @IsUUID()
  agentId: string;

  @ApiProperty()
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  scriptVersionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  nicheId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bidAmount?: number;

  @ApiPropertyOptional({ enum: ProposalStatus, default: ProposalStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;
}
