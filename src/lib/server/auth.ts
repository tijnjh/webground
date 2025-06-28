import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";
import { db } from "./db";
import { type User, users } from "./schema";

export async function createUser(
  username: string,
  password: string,
): Promise<Result<User, string>> {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (existingUser) {
      return err("Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        username,
        passwordHash,
      })
      .returning()
      .get();

    return ok(newUser);
  } catch (error) {
    return err("Failed to create user");
  }
}

export async function verifyUser(
  username: string,
  password: string,
): Promise<Result<User, string>> {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (!user) {
      return err("Invalid username or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return err("Invalid username or password");
    }

    return ok(user);
  } catch (error) {
    return err("Failed to verify user");
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return (
      (await db.select().from(users).where(eq(users.id, id)).get()) || null
    );
  } catch (error) {
    return null;
  }
}
