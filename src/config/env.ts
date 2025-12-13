import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    // Make non-essential values optional in development so the app
    // won't throw during module evaluation when env vars are missing.
    // In production you should provide the real values and tighten the schema.
    DATABASE_URL: z.string().refine(val => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('postgresql://'), {
      message: 'DATABASE_URL must start with postgresql://, prisma+postgres://, http://, or https://',
    }).optional(),
      val.startsWith('prisma+postgres://') ||
    NEXT_RUNTIME: z.enum(["nodejs", "edge"]).default("nodejs"),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional(),
    BETTER_AUTH_URL: z.string().refine(val => val.startsWith('http://') || val.startsWith('https://'), {
      message: 'BETTER_AUTH_URL must start with http:// or https://',
    }).default("http://localhost:3000"),
    UMAMI_API_KEY: z.string().optional(),
    GITHUB_TOKEN: z.string().optional()
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_APP_URL: z.string().refine(val => val.startsWith('http://') || val.startsWith('https://'), {
      message: 'NEXT_PUBLIC_APP_URL must start with http:// or https://',
    }).default("http://localhost:3000"),
    NEXT_PUBLIC_GITHUB_USERNAME: z.string().optional(),
    // default availability to false to avoid validation errors when missing
    NEXT_PUBLIC_AVAILABLE_STATUS: z.coerce.boolean().default(false),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional()
  },

  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_RUNTIME: process.env.NEXT_RUNTIME,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_GITHUB_USERNAME: process.env.NEXT_PUBLIC_GITHUB_USERNAME,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    UMAMI_API_KEY: process.env.UMAMI_API_KEY,
    NEXT_PUBLIC_AVAILABLE_STATUS: process.env.NEXT_PUBLIC_AVAILABLE_STATUS,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN


  },

  emptyStringAsUndefined: true,

});

export default env;