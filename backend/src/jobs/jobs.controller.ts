import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { CreateJobDto, JobResponseDto } from './dto/create-job.dto';
import { FileParserService } from '../resumes/file-parser.service';

@Controller('jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly fileParser: FileParserService,
  ) {}

  /**
   * Create a new job description
   */
  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createJobDto: CreateJobDto): Promise<JobResponseDto> {
    return this.jobsService.create(createJobDto);
  }

  /**
   * Get all job descriptions
   */
  @Get()
  async findAll(): Promise<JobResponseDto[]> {
    return this.jobsService.findAll();
  }

  /**
   * Get a specific job by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<JobResponseDto> {
    return this.jobsService.findOne(id);
  }

  /**
   * Delete a job
   */
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.jobsService.delete(id);
  }

  /**
   * Create a job from uploaded file (PDF, DOCX, TXT, LaTeX)
   */
  @Post('upload-file')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
  ): Promise<JobResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    console.log(`Processing job file: ${file.originalname} (${file.size} bytes)`);

    // Extract text from file
    const { text, metadata } = await this.fileParser.extractText(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    if (!text || text.trim().length < 10) {
      throw new BadRequestException('Could not extract text from file or text too short');
    }

    // Use filename as title if not provided
    const jobTitle = title || file.originalname.replace(/\.[^/.]+$/, '');

    // Create job with extracted text as description
    return this.jobsService.create({
      title: jobTitle,
      description: text,
      requirements: metadata?.links?.length
        ? `Extracted from: ${file.originalname}\nLinks: ${metadata.links.map((l: any) => l.url).join(', ')}`
        : `Extracted from: ${file.originalname}`,
    });
  }
}
