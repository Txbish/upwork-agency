import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PricingType } from '@prisma/client';

export class ImportFromUpworkDto {
  @ApiProperty({ example: 'Claude Desktop MCP Shopify integrations Windows' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://www.upwork.com/jobs/~01abc123' })
  @IsString()
  @IsNotEmpty()
  jobUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiProperty({ enum: PricingType })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedPrice?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMin?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRateMax?: number;

  @ApiPropertyOptional({ example: ['API', 'Shopify', 'JavaScript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ example: 'org-uuid-here' })
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  nicheId?: string;
}
