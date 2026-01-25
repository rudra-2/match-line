import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { FileParserService } from './file-parser.service';
import { PrismaService } from '@common/prisma/prisma.service';

@Module({
  controllers: [ResumesController],
  providers: [ResumesService, FileParserService, PrismaService],
  exports: [ResumesService],
})
export class ResumesModule {}
