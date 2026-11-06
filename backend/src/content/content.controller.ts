import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UpdateContentDto } from './update-content.dto';
import { AdminTokenGuard } from '../admin-token.guard';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  getAll(): Promise<Record<string, unknown>> {
    return this.contentService.getAll();
  }

  @Put(':key')
  @UseGuards(AdminTokenGuard)
  update(@Param('key') key: string, @Body() body: UpdateContentDto): Promise<Record<string, unknown>> {
    return this.contentService.update(key, body.value);
  }
}
