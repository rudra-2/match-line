import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, ResumeResponseDto } from './dto/create-resume.dto';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  /**
   * Upload a new resume
   * @param createResumeDto - Resume data with extracted text
   * @returns Created resume
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  async upload(@Body() createResumeDto: CreateResumeDto): Promise<ResumeResponseDto> {
    return this.resumesService.create(createResumeDto);
  }

  /**
   * Get all resumes
   */
  @Get()
  async findAll(): Promise<ResumeResponseDto[]> {
    return this.resumesService.findAll();
  }

  /**
   * Get a specific resume by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResumeResponseDto> {
    return this.resumesService.findOne(id);
  }

  /**
   * Delete a resume
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.resumesService.delete(id);
  }
}
