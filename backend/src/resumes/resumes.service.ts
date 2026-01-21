import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateResumeDto, ResumeResponseDto } from './dto/create-resume.dto';

@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}

  async create(createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
    const resume = await this.prisma.resume.create({
      data: {
        fileName: createResumeDto.fileName,
        rawText: createResumeDto.rawText,
        processedText: createResumeDto.processedText || createResumeDto.rawText,
      },
    });

    return this.mapToDto(resume);
  }

  async findAll(): Promise<ResumeResponseDto[]> {
    const resumes = await this.prisma.resume.findMany({
      orderBy: { uploadedAt: 'desc' },
    });

    return resumes.map((resume) => this.mapToDto(resume));
  }

  async findOne(id: string): Promise<ResumeResponseDto> {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    return this.mapToDto(resume);
  }

  async delete(id: string): Promise<{ message: string }> {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }

    await this.prisma.resume.delete({
      where: { id },
    });

    return { message: `Resume ${id} deleted successfully` };
  }

  private mapToDto(resume: any): ResumeResponseDto {
    return {
      id: resume.id,
      fileName: resume.fileName,
      rawText: resume.rawText,
      processedText: resume.processedText,
      uploadedAt: resume.uploadedAt,
      updatedAt: resume.updatedAt,
    };
  }
}
