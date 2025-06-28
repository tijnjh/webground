import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

const client = createClient({
  url: "file:data/db.sqlite",
});

const db = drizzle(client);

await migrate(db, { migrationsFolder: "./drizzle" });

client.close();
