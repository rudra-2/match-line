import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Request Logging Middleware
 * Logs incoming requests and response times for observability
 */
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const status = statusCode < 400 ? '✓' : statusCode < 500 ? '⚠' : '✗';

      this.logger.log(
        `${status} ${method} ${originalUrl} ${statusCode} - ${duration}ms (${ip})`,
      );
    });

    next();
  }
}
