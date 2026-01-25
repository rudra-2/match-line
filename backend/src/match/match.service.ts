import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AiClientService } from '@common/ai-client/ai-client.service';
import { CreateMatchDto, MatchScoreResponseDto } from './dto/create-match.dto';

@Injectable()
export class MatchService {
  private readonly logger = new Logger('MatchService');

  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}

  /**
   * Score a resume against a job using AI service
   * Flow: Fetch resume & job → Send to AI service → Store result
   */
  async score(createMatchDto: CreateMatchDto, force: boolean = false): Promise<MatchScoreResponseDto> {
    const { resumeId, jobId } = createMatchDto;

    // Fetch resume and job data
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw new NotFoundException(`Resume with ID ${resumeId} not found`);
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    // Check if match already exists (skip if force=true)
    if (!force) {
      const existingMatch = await this.prisma.match.findUnique({
        where: { resumeId_jobId: { resumeId, jobId } },
      });

      if (existingMatch) {
        this.logger.debug(`Match cache hit: ${resumeId} vs ${jobId}`);
        return this.mapToDto(existingMatch);
      }
    } else {
      // Delete existing match if force re-scoring
      await this.prisma.match.deleteMany({
        where: { resumeId, jobId },
      });
      this.logger.log(`Force re-scoring: ${resumeId} vs ${jobId}`);
    }

    // Call AI service for scoring
    this.logger.log(`Scoring resume ${resumeId} against job ${jobId}`);
    const aiScore = await this.aiClient.scoreMatch({
      resume_text: resume.processedText || resume.rawText,
      job_description: job.description,
      job_requirements: job.requirements || undefined,
    });

    // Store match result in database
    const match = await this.prisma.match.create({
      data: {
        resumeId,
        jobId,
        matchScore: aiScore.match_score,
        matchedSkills: aiScore.matched_skills,
        missingSkills: aiScore.missing_skills,
        experienceGap: aiScore.experience_gap,
        summary: aiScore.summary,
      },
    });

    this.logger.log(`Match scored: ${match.id} (score: ${match.matchScore})`);
    return this.mapToDto(match);
  }

  /**
   * Batch score multiple resumes against multiple jobs
   * Optimized for bulk operations with caching
   */
  async batchScore(
    resumeIds: string[],
    jobIds: string[],
  ): Promise<MatchScoreResponseDto[]> {
    this.logger.log(
      `Batch scoring ${resumeIds.length} resumes × ${jobIds.length} jobs`,
    );

    const results: MatchScoreResponseDto[] = [];

    for (const resumeId of resumeIds) {
      for (const jobId of jobIds) {
        try {
          const result = await this.score({ resumeId, jobId });
          results.push(result);
        } catch (error) {
          this.logger.warn(
            `Failed to score ${resumeId} vs ${jobId}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log(`Batch scoring completed: ${results.length} matches`);
    return results;
  }

  /**
   * Get all matches with optional filtering
   */
  async findAll(resumeId?: string, jobId?: string): Promise<MatchScoreResponseDto[]> {
    const where: any = {};

    if (resumeId) where.resumeId = resumeId;
    if (jobId) where.jobId = jobId;

    const matches = await this.prisma.match.findMany({
      where,
      orderBy: { scoredAt: 'desc' },
    });

    return matches.map((match) => this.mapToDto(match));
  }

  /**
   * Get a specific match
   */
  async findOne(id: string): Promise<MatchScoreResponseDto> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    return this.mapToDto(match);
  }

  /**
   * Delete a match
   */
  async delete(id: string): Promise<{ message: string }> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      throw new NotFoundException(`Match with ID ${id} not found`);
    }

    await this.prisma.match.delete({
      where: { id },
    });

    this.logger.log(`Match deleted: ${id}`);
    return { message: `Match ${id} deleted successfully` };
  }

  private mapToDto(match: any): MatchScoreResponseDto {
    return {
      id: match.id,
      resumeId: match.resumeId,
      jobId: match.jobId,
      matchScore: match.matchScore,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      experienceGap: match.experienceGap,
      summary: match.summary,
      scoredAt: match.scoredAt,
    };
  }
}
