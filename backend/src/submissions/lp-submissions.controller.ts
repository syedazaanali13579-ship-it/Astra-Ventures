import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AdminTokenGuard } from '../admin-token.guard';
import { CreateLpSubmissionDto, StoredLpSubmission } from './create-lp-submission.dto';
import { SubmissionsService } from './submissions.service';

@Controller('lp-submissions')
export class LpSubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  create(@Body() submission: CreateLpSubmissionDto): Promise<{ id: string; createdAt: string }> {
    return this.submissionsService.createLpInquiry(submission);
  }

  @Get()
  @UseGuards(AdminTokenGuard)
  getAll(): Promise<StoredLpSubmission[]> {
    return this.submissionsService.getLpInquiries();
  }
}
