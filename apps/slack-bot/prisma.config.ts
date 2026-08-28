import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

config({ quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.PG_DATABASE_URL || 'postgresql://localhost:5432/postgres'
  }
})
