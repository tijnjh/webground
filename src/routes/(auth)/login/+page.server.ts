import { SUPABASE_KEY } from "$env/static/private";
import { getUserById, getUserByUsername } from "$lib/server/auth";
import { createServerClient } from "@supabase/ssr";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

const supabaseUrl = "https://satstldgrbsrpfktfmlt.supabase.co";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, "/");
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const usernameOrEmail = data.get("usernameOrEmail")?.toString();
    const password = data.get("password")?.toString();

    if (!usernameOrEmail || !password) {
      return fail(400, { error: "Username/email and password are required" });
    }

    // Create Supabase client for this request
    const supabase = createServerClient(supabaseUrl, SUPABASE_KEY, {
      cookies: {
        get: (key: string) => cookies.get(key),
        set: (key: string, value: string, options: any) => {
          cookies.set(key, value, { ...options, path: "/" });
        },
        remove: (key: string, options: any) => {
          cookies.delete(key, { ...options, path: "/" });
        },
      },
    });

    // Determine email to use for authentication
    let emailToUse: string;

    if (usernameOrEmail.includes("@")) {
      // It's an email
      emailToUse = usernameOrEmail;
    } else {
      // It's a username - look up the email
      const user = await getUserByUsername(usernameOrEmail);
      if (!user || !user.email) {
        return fail(400, { error: "Invalid username or password" });
      }
      emailToUse = user.email;
    }

    // Sign in with Supabase Auth (this manages sessions automatically)
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: emailToUse,
        password: password,
      });

    if (authError) {
      console.error("Login error:", authError);
      return fail(400, { error: "Invalid login credentials" });
    }

    if (!authData.user) {
      return fail(400, { error: "Invalid login credentials" });
    }

    // Get user profile by ID to redirect to their page
    const user = await getUserById(authData.user.id);

    if (user?.username) {
      throw redirect(302, `/@${user.username}`);
    } else {
      // Fallback - redirect to home if we can't find username
      throw redirect(302, "/");
    }
  },
};
