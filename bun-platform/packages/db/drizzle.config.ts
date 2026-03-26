import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenv.config({
  path: '../../apps/api/.env',
})

export default defineConfig({
  dbCredentials: {
    authToken: process.env.DATABASE_AUTH_TOKEN,
    url: process.env.DATABASE_URL || '',
  },
  dialect: 'turso',
  out: './src/migrations',
  schema: './src/schema',
})
