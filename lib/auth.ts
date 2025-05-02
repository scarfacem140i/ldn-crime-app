import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous } from "better-auth/plugins";
import { db } from "./db";
import * as schema from "@/lib/db/auth-schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  trustedOrigins: [process.env.BETTER_AUTH_URL!],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    anonymous(),
    admin({ adminUserIds: ["YVYxMDyciJ0ECGM2SmW3Swh7Hi0U08Wj"] }),
  ],
});
