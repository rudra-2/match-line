import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AiClientService } from '../common/ai-client/ai-client.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}

  @Get()
  async checkHealth() {
    // Check database
    let dbStatus = 'offline';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'online';
    } catch {
      dbStatus = 'offline';
    }

    // Check AI service
    let aiStatus = 'offline';
    try {
      const aiHealth = await this.aiClient.checkHealth();
      aiStatus = aiHealth?.status === 'healthy' ? 'online' : 'offline';
    } catch {
      aiStatus = 'offline';
    }

    const allOnline = dbStatus === 'online' && aiStatus === 'online';

    return {
      status: allOnline ? 'healthy' : 'degraded',
      version: '1.0.0',
      service: 'Match-Line Backend',
      timestamp: new Date().toISOString(),
      services: {
        backend: 'online',
        database: dbStatus,
        ai: aiStatus,
      },
    };
  }
}
