import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  checkHealth() {
    return {
      status: 'healthy',
      version: '1.0.0',
      service: 'Match-Line Backend',
      timestamp: new Date().toISOString(),
    };
  }
}
