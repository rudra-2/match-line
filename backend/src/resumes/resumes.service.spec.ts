import { Test, TestingModule } from '@nestjs/testing';
import { ResumesService } from './resumes.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ResumesService', () => {
  let service: ResumesService;
  let prismaService: PrismaService;

  const mockResume = {
    id: 'resume-1',
    fileName: 'john-doe.pdf',
    rawText: 'Senior Backend Engineer with Node.js experience',
    processedText: 'Senior Backend Engineer with Node.js experience',
    uploadedAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        {
          provide: PrismaService,
          useValue: {
            resume: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ResumesService>(ResumesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a resume successfully', async () => {
      jest.spyOn(prismaService.resume, 'create').mockResolvedValue(mockResume);

      const result = await service.create({
        fileName: 'john-doe.pdf',
        rawText: 'Senior Backend Engineer with Node.js experience',
        processedText: 'Senior Backend Engineer with Node.js experience',
      });

      expect(result).toEqual(mockResume);
      expect(prismaService.resume.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of resumes', async () => {
      jest.spyOn(prismaService.resume, 'findMany').mockResolvedValue([mockResume]);

      const result = await service.findAll();

      expect(result).toEqual([mockResume]);
      expect(prismaService.resume.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a resume by id', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(mockResume);

      const result = await service.findOne('resume-1');

      expect(result).toEqual(mockResume);
      expect(prismaService.resume.findUnique).toHaveBeenCalledWith({
        where: { id: 'resume-1' },
      });
    });

    it('should throw NotFoundException if resume not found', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a resume successfully', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(mockResume);
      jest.spyOn(prismaService.resume, 'delete').mockResolvedValue(mockResume);

      const result = await service.delete('resume-1');

      expect(result.message).toContain('deleted successfully');
      expect(prismaService.resume.delete).toHaveBeenCalledWith({
        where: { id: 'resume-1' },
      });
    });
  });
});
