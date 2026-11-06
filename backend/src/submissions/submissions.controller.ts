import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminTokenGuard } from '../admin-token.guard';
import { CreateSubmissionDto } from './create-submission.dto';
import { SubmissionsService } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body() submission: CreateSubmissionDto): Promise<{ id: string; createdAt: string }> {
    return this.submissionsService.create(submission);
  }

  @Get()
  @UseGuards(AdminTokenGuard)
  getAll(): Promise<StoredSubmission[]> {
    return this.submissionsService.getAll();
  }

}

export interface StoredSubmission extends CreateSubmissionDto {
  id: string;
  createdAt: string;
}
