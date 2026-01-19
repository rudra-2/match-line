import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  rawText: string;

  @IsOptional()
  @IsString()
  processedText?: string;
}

export class ResumeResponseDto {
  id: string;
  fileName: string;
  rawText: string;
  processedText?: string;
  uploadedAt: Date;
  updatedAt: Date;
}
