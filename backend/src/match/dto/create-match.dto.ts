import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @IsString()
  @IsNotEmpty()
  resumeId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;
}

export class MatchScoreResponseDto {
  id: string;
  resumeId: string;
  jobId: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceGap: string;
  summary: string;
  scoredAt: Date;
}
