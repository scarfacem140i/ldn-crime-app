import * as authSchema from "@/lib/db/auth-schema";
import * as schema from "@/lib/db/schema";
import { drizzle } from "drizzle-orm/node-postgres";

const schemas = { ...authSchema, ...schema };

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: schemas,
});

// Add query builder
export * from "drizzle-orm";
