import { err, ok, type Result } from "neverthrow";
import { supabase } from "./db";
import type { User } from "./schema";

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function getUserByUsername(
  username: string
): Promise<User | null> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function signOut(): Promise<Result<void, string>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return err(error.message);
    }

    return ok(undefined);
  } catch (error) {
    return err("Failed to sign out");
  }
}
