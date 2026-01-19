import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
  let service: JobsService;
  let prismaService: PrismaService;

  const mockJob = {
    id: 'job-1',
    title: 'Senior Backend Engineer',
    description: 'Looking for experienced backend engineer with Node.js expertise',
    requirements: 'Node.js, PostgreSQL, Docker, AWS',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: PrismaService,
          useValue: {
            job: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job successfully', async () => {
      jest.spyOn(prismaService.job, 'create').mockResolvedValue(mockJob);

      const result = await service.create({
        title: 'Senior Backend Engineer',
        description: 'Looking for experienced backend engineer with Node.js expertise',
        requirements: 'Node.js, PostgreSQL, Docker, AWS',
      });

      expect(result).toEqual(mockJob);
      expect(prismaService.job.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of jobs', async () => {
      jest.spyOn(prismaService.job, 'findMany').mockResolvedValue([mockJob]);

      const result = await service.findAll();

      expect(result).toEqual([mockJob]);
      expect(prismaService.job.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      jest.spyOn(prismaService.job, 'findUnique').mockResolvedValue(mockJob);

      const result = await service.findOne('job-1');

      expect(result).toEqual(mockJob);
      expect(prismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: 'job-1' },
      });
    });

    it('should throw NotFoundException if job not found', async () => {
      jest.spyOn(prismaService.job, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a job successfully', async () => {
      jest.spyOn(prismaService.job, 'findUnique').mockResolvedValue(mockJob);
      jest.spyOn(prismaService.job, 'delete').mockResolvedValue(mockJob);

      const result = await service.delete('job-1');

      expect(result.message).toContain('deleted successfully');
      expect(prismaService.job.delete).toHaveBeenCalledWith({
        where: { id: 'job-1' },
      });
    });
  });
});
