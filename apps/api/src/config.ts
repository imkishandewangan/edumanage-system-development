import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default('file:../data/edumanage.db'),
  JWT_ACCESS_SECRET: z.string().min(16).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me'),
  PORT: z.coerce.number().int().positive().default(3000),
  UPLOAD_DIR: z.string().min(1).default('./uploads'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export const env = envSchema.parse(process.env)

export function validateEnvironment() {
  return env
}

export type ApiEnv = z.infer<typeof envSchema>

export { envSchema }

