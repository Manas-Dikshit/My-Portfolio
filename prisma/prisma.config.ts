import { defineConfig } from '@prisma/integration';

export default defineConfig({
  datasource: {
    adapter: process.env.DATABASE_URL!,
  },
});
