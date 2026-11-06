import { IsEmail, IsIn, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateSubmissionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  company!: string;

  @IsString()
  @MaxLength(500)
  @IsUrl({ require_protocol: true }, { message: 'companyUrl must be a valid URL including https://' })
  companyUrl!: string;

  @IsIn(['Pre-seed', 'Seed', 'Other'])
  stage!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;
}
