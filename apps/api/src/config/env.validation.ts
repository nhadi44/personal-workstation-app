import {
  IsBooleanString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';

class EnvironmentVariables {
  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_CHALLENGE_SECRET?: string;

  @IsOptional()
  @IsString()
  JWT_SETUP_SECRET?: string;

  @IsOptional()
  @IsNumberString()
  JWT_ACCESS_EXPIRES_IN?: string;

  @IsOptional()
  @IsNumberString()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsOptional()
  @IsNumberString()
  JWT_CHALLENGE_EXPIRES_IN?: string;

  @IsOptional()
  @IsNumberString()
  JWT_SETUP_EXPIRES_IN?: string;

  @IsOptional()
  @IsNumberString()
  BCRYPT_ROUNDS?: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  GOOGLE_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  MICROSOFT_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  MICROSOFT_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  MICROSOFT_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  FRONTEND_URL?: string;

  @IsOptional()
  @IsBooleanString()
  COOKIE_SECURE?: string;

  @IsOptional()
  @IsIn(['strict', 'lax', 'none'])
  COOKIE_SAME_SITE?: 'strict' | 'lax' | 'none';
}

export function validateEnvironment(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
