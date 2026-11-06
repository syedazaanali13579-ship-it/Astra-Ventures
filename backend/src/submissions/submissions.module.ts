import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminTokenGuard } from '../admin-token.guard';
import { LpSubmissionsController } from './lp-submissions.controller';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';

@Module({
  controllers: [SubmissionsController, LpSubmissionsController],
  imports: [AdminAuthModule],
  providers: [SubmissionsService, AdminTokenGuard],
})
export class SubmissionsModule {}
