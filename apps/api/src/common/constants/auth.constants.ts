export const AUTH_CONSTANTS = {
  ACCESS_TOKEN_STRATEGY: 'jwt-access',
  REFRESH_TOKEN_STRATEGY: 'jwt-refresh',
  GOOGLE_STRATEGY: 'google',
  MICROSOFT_STRATEGY: 'microsoft',
  REFRESH_COOKIE_NAME: 'refresh_token',
  TWO_FACTOR_CHALLENGE_PURPOSE: 'two-factor-challenge',
  TWO_FACTOR_SETUP_PURPOSE: 'two-factor-setup',
  TOKEN_ISSUER: 'personal-workstation-api',
} as const;
