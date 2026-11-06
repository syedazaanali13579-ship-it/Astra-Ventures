import { Allow, IsDefined } from 'class-validator';

export class UpdateContentDto {
  @Allow()
  @IsDefined()
  value!: unknown;
}
