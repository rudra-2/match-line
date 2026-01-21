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

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  /**
   * Score a resume against a job
   * Calls AI service for intelligent matching
   */
  @Post('score')
  @HttpCode(HttpStatus.CREATED)
  async score(@Body() createMatchDto: CreateMatchDto): Promise<MatchScoreResponseDto> {
    return this.matchService.score(createMatchDto);
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
