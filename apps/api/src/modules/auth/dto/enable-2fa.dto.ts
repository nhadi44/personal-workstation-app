import { IsNotEmpty, IsString } from 'class-validator';

export class Enable2faDto {
  @IsString()
  @IsNotEmpty()
  setupToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
