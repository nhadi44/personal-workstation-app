import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2faDto {
  @IsString()
  @IsNotEmpty()
  challengeToken: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
