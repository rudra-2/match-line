import { Test, TestingModule } from '@nestjs/testing';
import { MatchService } from './match.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { AiClientService } from '@common/ai-client/ai-client.service';
import { NotFoundException } from '@nestjs/common';

describe('MatchService', () => {
  let service: MatchService;
  let prismaService: PrismaService;
  let aiClientService: AiClientService;

  const mockResume = {
    id: 'resume-1',
    fileName: 'john-doe.pdf',
    rawText: 'Senior Backend Engineer with 5 years Node.js experience',
    processedText: 'Senior Backend Engineer with 5 years Node.js experience',
    uploadedAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJob = {
    id: 'job-1',
    title: 'Senior Backend Engineer',
    description: 'Looking for experienced backend engineer',
    requirements: 'Node.js, PostgreSQL, Docker',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAiScore = {
    match_score: 85,
    matched_skills: ['Node.js', 'PostgreSQL', 'Backend'],
    missing_skills: ['Docker', 'Kubernetes'],
    experience_gap: 'Minor',
    summary: 'Good alignment with requirements',
  };

  const mockMatch = {
    id: 'match-1',
    resumeId: 'resume-1',
    jobId: 'job-1',
    matchScore: 85,
    matchedSkills: ['Node.js', 'PostgreSQL', 'Backend'],
    missingSkills: ['Docker', 'Kubernetes'],
    experienceGap: 'Minor',
    summary: 'Good alignment with requirements',
    scoredAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        {
          provide: PrismaService,
          useValue: {
            resume: {
              findUnique: jest.fn(),
            },
            job: {
              findUnique: jest.fn(),
            },
            match: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: AiClientService,
          useValue: {
            scoreMatch: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    prismaService = module.get<PrismaService>(PrismaService);
    aiClientService = module.get<AiClientService>(AiClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('score', () => {
    it('should score a match successfully', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(mockResume);
      jest.spyOn(prismaService.job, 'findUnique').mockResolvedValue(mockJob);
      jest.spyOn(prismaService.match, 'findUnique').mockResolvedValue(null);
      jest.spyOn(aiClientService, 'scoreMatch').mockResolvedValue(mockAiScore);
      jest.spyOn(prismaService.match, 'create').mockResolvedValue(mockMatch);

      const result = await service.score({
        resumeId: 'resume-1',
        jobId: 'job-1',
      });

      expect(result.matchScore).toBe(85);
      expect(result.matchedSkills).toContain('Node.js');
      expect(aiClientService.scoreMatch).toHaveBeenCalled();
    });

    it('should throw NotFoundException if resume not found', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(null);

      await expect(
        service.score({
          resumeId: 'invalid-id',
          jobId: 'job-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if job not found', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(mockResume);
      jest.spyOn(prismaService.job, 'findUnique').mockResolvedValue(null);

      await expect(
        service.score({
          resumeId: 'resume-1',
          jobId: 'invalid-id',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return existing match if already scored', async () => {
      jest.spyOn(prismaService.resume, 'findUnique').mockResolvedValue(mockResume);
      jest.spyOn(prismaService.job, 'findUnique').mockResolvedValue(mockJob);
      jest.spyOn(prismaService.match, 'findUnique').mockResolvedValue(mockMatch);

      const result = await service.score({
        resumeId: 'resume-1',
        jobId: 'job-1',
      });

      expect(result).toEqual(mockMatch);
      expect(aiClientService.scoreMatch).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all matches', async () => {
      jest.spyOn(prismaService.match, 'findMany').mockResolvedValue([mockMatch]);

      const result = await service.findAll();

      expect(result).toEqual([mockMatch]);
      expect(prismaService.match.findMany).toHaveBeenCalled();
    });

    it('should filter by resumeId', async () => {
      jest.spyOn(prismaService.match, 'findMany').mockResolvedValue([mockMatch]);

      await service.findAll('resume-1');

      expect(prismaService.match.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            resumeId: 'resume-1',
          }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete a match successfully', async () => {
      jest.spyOn(prismaService.match, 'findUnique').mockResolvedValue(mockMatch);
      jest.spyOn(prismaService.match, 'delete').mockResolvedValue(mockMatch);

      const result = await service.delete('match-1');

      expect(result.message).toContain('deleted successfully');
      expect(prismaService.match.delete).toHaveBeenCalledWith({
        where: { id: 'match-1' },
      });
    });
  });
});
