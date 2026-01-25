import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaService } from '@common/prisma/prisma.service';
import { FileParserService } from '../resumes/file-parser.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, PrismaService, FileParserService],
  exports: [JobsService],
})
export class JobsModule {}
