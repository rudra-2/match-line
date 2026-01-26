import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto, MatchScoreResponseDto } from './dto/create-match.dto';

export class BatchScoreDto {
  resumeIds: string[];
  jobIds: string[];
}

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * Score a resume against a job
   * Calls AI service for intelligent matching
   * @param force - If true, re-score even if match exists
   */
  @Post('score')
  @HttpCode(HttpStatus.CREATED)
  async score(
    @Body() createMatchDto: CreateMatchDto,
    @Query('force') force?: string,
  ): Promise<MatchScoreResponseDto> {
    const forceRescore = force === 'true';
    return this.matchService.score(createMatchDto, forceRescore);
  }

  /**
   * Batch score multiple resumes against multiple jobs
   * Optimized for bulk operations
   */
  @Post('batch-score')
  @HttpCode(HttpStatus.CREATED)
  async batchScore(@Body() batchScoreDto: BatchScoreDto) {
    return this.matchService.batchScore(batchScoreDto.resumeIds, batchScoreDto.jobIds);
  }

  /**
   * Get all matches with optional filtering
   */
  @Get()
  async findAll(
    @Query('resumeId') resumeId?: string,
    @Query('jobId') jobId?: string,
  ): Promise<MatchScoreResponseDto[]> {
    return this.matchService.findAll(resumeId, jobId);
  }

  /**
   * Get all matches for a job with resume details, sorted by score desc
   */
  @Get('job/:jobId/scores')
  async getJobScoreHistory(@Param('jobId') jobId: string) {
    return this.matchService.findByJobWithResumes(jobId);
  }

  /**
   * Get a specific match result
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<MatchScoreResponseDto> {
    return this.matchService.findOne(id);
  }

  /**
   * Delete a match
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.matchService.delete(id);
  }
}
