import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  requirements?: string;
}

export class JobResponseDto {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  createdAt: Date;
  updatedAt: Date;
}
