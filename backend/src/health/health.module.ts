import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiClientService } from '../common/ai-client/ai-client.service';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, AiClientService],
})
export class HealthModule {}
