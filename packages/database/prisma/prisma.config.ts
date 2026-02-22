import { existsSync } from 'node:fs'
import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

const localEnvPath = path.resolve(process.cwd(), '.env')
const rootEnvPath = path.resolve(process.cwd(), '../../.env')

if (existsSync(localEnvPath)) {
  loadEnv({ path: localEnvPath })
}

if (existsSync(rootEnvPath)) {
  loadEnv({ path: rootEnvPath, quiet: true })
}

const isMigrateCommand = process.argv.some((arg) => arg.includes('migrate'))
const datasourceUrl = isMigrateCommand
  ? (process.env.DIRECT_URL ?? process.env.DATABASE_URL)
  : (process.env.DATABASE_URL ?? process.env.DIRECT_URL)

if (!datasourceUrl) {
  throw new Error(
    'DATABASE_URL or DIRECT_URL is not set. Create a .env file at the workspace root from .env.example.',
  )
}

export default defineConfig({
  datasource: {
    url: datasourceUrl,
  },
})
