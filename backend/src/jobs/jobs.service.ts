import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(createJobDto: CreateJobDto): Promise<JobResponseDto> {
    const job = await this.prisma.job.create({
      data: {
        title: createJobDto.title,
        description: createJobDto.description,
        requirements: createJobDto.requirements || '',
      },
    });

    return this.mapToDto(job);
  }

  async findAll(): Promise<JobResponseDto[]> {
    const jobs = await this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => this.mapToDto(job));
  }

  async findOne(id: string): Promise<JobResponseDto> {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return this.mapToDto(job);
  }

  async delete(id: string): Promise<{ message: string }> {
    const job = await this.prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    await this.prisma.job.delete({
      where: { id },
    });

    return { message: `Job ${id} deleted successfully` };
  }

  private mapToDto(job: any): JobResponseDto {
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }
}
