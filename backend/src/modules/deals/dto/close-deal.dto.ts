import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DealStatus } from '@prisma/client';

const ClosableStatuses = {
  WON: DealStatus.WON,
  LOST: DealStatus.LOST,
  CANCELLED: DealStatus.CANCELLED,
} as const;

export class CloseDealDto {
  @ApiProperty({
    enum: [DealStatus.WON, DealStatus.LOST, DealStatus.CANCELLED],
    example: DealStatus.WON,
  })
  @IsEnum(ClosableStatuses)
  status: 'WON' | 'LOST' | 'CANCELLED';
}
