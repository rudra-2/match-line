import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { PrismaService } from '@common/prisma/prisma.service';
import { AiClientService } from '@common/ai-client/ai-client.service';

@Module({
  controllers: [MatchController],
  providers: [MatchService, PrismaService, AiClientService],
})
export class MatchModule {}
