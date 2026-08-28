import path from 'node:path'
import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ path: path.join(import.meta.dirname, '../../.env'), quiet: true })
config({ quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations'
  },
  datasource: {
    url: process.env.PG_DATABASE_URL || 'postgresql://localhost:5432/postgres'
  }
})
