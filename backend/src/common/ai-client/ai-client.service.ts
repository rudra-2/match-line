import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface AIScoreRequest {
  resume_text: string;
  job_description: string;
  job_requirements?: string;
}

export interface AIScoreResponse {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_gap: string;
  summary: string;
}

/**
 * AI Client Service
 * Communicates with Python FastAPI AI service for scoring logic
 * Handles all NLP, embeddings, and LLM operations
 */
@Injectable()
export class AiClientService {
  private readonly aiServiceUrl: string;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.aiServiceUrl = configService.get('AI_SERVICE_URL') || 'http://localhost:8000';
    this.timeout = configService.get('AI_SERVICE_TIMEOUT') || 30000;
  }

  /**
   * Call AI service to score a resume against a job
   * @param request - Resume text and job description
   * @returns Scoring result with skills, gaps, and summary
   */
  async scoreMatch(request: AIScoreRequest): Promise<AIScoreResponse> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/score`, request, {
        timeout: this.timeout,
      });

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('AI Service Error:', errorMessage);
      throw new Error(`Failed to score match: ${errorMessage}`);
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await axios.get(`${this.aiServiceUrl}/health`, {
        timeout: this.timeout,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI Service is unavailable: ${errorMessage}`);
    }
  }
}
