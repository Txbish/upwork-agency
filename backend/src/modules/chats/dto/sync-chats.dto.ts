import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatSenderType } from '@prisma/client';

export class ChatMessageDto {
  @ApiProperty({ example: 'Maria Galindez' })
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @ApiProperty({ enum: ChatSenderType })
  @IsEnum(ChatSenderType)
  senderType: ChatSenderType;

  @ApiProperty({ example: 'Hi, I saw your proposal and I am interested.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '2026-03-29T14:07:00.000Z' })
  @IsDateString()
  sentAt: string;
}

export class SyncChatsDto {
  @ApiPropertyOptional({ example: '1989816863903214163' })
  @IsOptional()
  @IsString()
  upworkRoomId?: string;

  @ApiProperty({ type: [ChatMessageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
