import { err, ok, type Result } from "neverthrow";
import { supabase } from "./db";
import type { User } from "./schema";

export async function createUser(
  username: string,
  email: string,
  password: string
): Promise<Result<User, string>> {
  try {
    // Check if username already exists first
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing username:", checkError);
      return err(`Database error: ${checkError.message}`);
    }

    if (existingUser) {
      return err("Username already exists");
    }

    // Create auth user with username in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (authError) {
      console.error("Auth signup error:", authError);
      return err(authError.message);
    }

    if (!authData.user) {
      return err("Failed to create user");
    }

    // Use the simple database function (no foreign key issues)
    const { data: user, error: profileError } = await supabase.rpc(
      "create_user_simple",
      {
        user_id: authData.user.id,
        user_username: username,
        user_email: email,
      }
    );

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return err(`Failed to create user profile: ${profileError.message}`);
    }

    return ok(user);
  } catch (error) {
    console.error("Unexpected error in createUser:", error);
    return err("Failed to create user");
  }
}

// ... rest of the functions remain the same
export async function signInUser(
  email: string,
  password: string
): Promise<Result<User, string>> {
  try {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      console.error("Sign in error:", authError);
      return err(authError.message);
    }

    if (!authData.user) {
      return err("Invalid email or password");
    }

    // Get user profile
    const { data: user, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !user) {
      console.error("Profile fetch error:", profileError);
      return err("User profile not found");
    }

    return ok(user);
  } catch (error) {
    console.error("Unexpected error in signInUser:", error);
    return err("Failed to sign in");
  }
}

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
