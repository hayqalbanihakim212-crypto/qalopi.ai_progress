// Read lazily so tests and serverless cold starts always see current env.
export const env = () => ({
  prod: process.env.NODE_ENV === 'production',
  authSecret: process.env.AUTH_SECRET || '',
  adminEmail: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
  adminHash: process.env.ADMIN_PASSWORD_HASH || '',
  databaseUrl: process.env.DATABASE_URL || '',
  dataDir: process.env.DATA_DIR || '',
  ghOwner: process.env.GITHUB_OWNER || '',
  ghRepo: process.env.GITHUB_REPOSITORY || '',
  ghToken: process.env.GITHUB_TOKEN || '',
  resendKey: process.env.EMAIL_API_KEY || '',
  notifyEmail: process.env.NOTIFY_EMAIL || '',
  fromEmail: process.env.FROM_EMAIL || '',
})
