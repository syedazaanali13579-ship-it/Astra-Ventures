import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { ContentModule } from './content/content.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AdminAuthModule, ContentModule, SubmissionsModule],
})
export class AppModule {}
