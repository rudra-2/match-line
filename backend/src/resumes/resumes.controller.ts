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
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumesService } from './resumes.service';
import { FileParserService } from './file-parser.service';
import { CreateResumeDto, ResumeResponseDto } from './dto/create-resume.dto';

// Multer memory storage config
const multerOptions = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/x-tex',
      'text/x-tex',
      'application/octet-stream', // Some browsers send this for .tex files
    ];
    const allowedExtensions = ['pdf', 'docx', 'txt', 'tex'];
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    console.log(`[FileUpload] Received file: ${file.originalname}, mime: ${file.mimetype}, ext: ${ext}`);

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      console.log(`[FileUpload] Rejected file type: ${file.mimetype}`);
      cb(new BadRequestException(`File type not allowed: ${file.mimetype}. Allowed: PDF, DOCX, TXT, TEX`), false);
    }
  },
};

@Controller('resumes')
export class ResumesController {
  private readonly logger = new Logger('ResumesController');

  constructor(
    private readonly resumesService: ResumesService,
    private readonly fileParserService: FileParserService,
  ) {}

  /**
   * Upload a resume file (PDF, DOCX, TXT, TEX)
   * Extracts text and stores only the text, not the file
   */
  @Post('upload-file')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ResumeResponseDto> {
    if (!file) {
      this.logger.warn('No file received in upload request');
      throw new BadRequestException('No file uploaded. Please select a file to upload.');
    }

    this.logger.log(`Processing file: ${file.originalname} (${file.size} bytes)`);

    // Extract text from file
    const { text, metadata } = await this.fileParserService.extractText(
      file.buffer,
      file.mimetype,
      file.originalname,
    );

    this.logger.log(`Extracted ${text.length} characters from ${file.originalname}`);

    // Create resume with extracted text (file is NOT stored)
    return this.resumesService.create({
      fileName: file.originalname,
      rawText: text,
      processedText: text,
    });
  }

  /**
   * Upload a new resume (text only)
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
