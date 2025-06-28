import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./src/lib/server/schema.ts",
  dbCredentials: {
    url: "file:db.sqlite",
  },
  out: "./drizzle",
});
