import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AiClientService } from '@common/ai-client/ai-client.service';
import { CreateMatchDto, MatchScoreResponseDto } from './dto/create-match.dto';

@Injectable()
export class MatchService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}

  /**
   * Score a resume against a job using AI service
   * Flow: Fetch resume & job → Send to AI service → Store result
   */
  async score(createMatchDto: CreateMatchDto): Promise<MatchScoreResponseDto> {
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

    // Check if match already exists
    let existingMatch = await this.prisma.match.findUnique({
      where: { resumeId_jobId: { resumeId, jobId } },
    });

    if (existingMatch) {
      return this.mapToDto(existingMatch);
    }

    // Call AI service for scoring
    const aiScore = await this.aiClient.scoreMatch({
      resume_text: resume.processedText || resume.rawText,
      job_description: job.description,
      job_requirements: job.requirements,
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

    return this.mapToDto(match);
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
