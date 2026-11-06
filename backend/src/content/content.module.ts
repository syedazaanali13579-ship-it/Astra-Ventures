import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminTokenGuard } from '../admin-token.guard';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

@Module({
  controllers: [ContentController],
  imports: [AdminAuthModule],
  providers: [ContentService, AdminTokenGuard],
})
export class ContentModule {}
