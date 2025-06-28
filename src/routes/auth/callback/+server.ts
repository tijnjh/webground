import { SUPABASE_KEY } from "$env/static/private";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const supabaseUrl = "https://satstldgrbsrpfktfmlt.supabase.co";

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    throw redirect(303, "/auth?error=auth_failed");
  }

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error);
    throw redirect(303, "/auth?error=auth_failed");
  }

  if (data.user) {
    // Check if user profile exists, create if not
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!existingProfile) {
      // Create user profile for OAuth user
      const username =
        data.user.user_metadata?.user_name ||
        data.user.user_metadata?.preferred_username ||
        data.user.email?.split("@")[0] ||
        `user_${data.user.id.slice(0, 8)}`;

      const { error: profileError } = await supabase.rpc("create_user_simple", {
        user_id: data.user.id,
        user_username: username,
        user_email: data.user.email,
      });

      if (profileError) {
        console.error("Error creating OAuth user profile:", profileError);
        // Continue anyway - user can update profile later
      }
    }

    // Redirect to user's profile or next URL
    const { data: userProfile } = await supabase
      .from("users")
      .select("username")
      .eq("id", data.user.id)
      .single();

    if (userProfile?.username) {
      throw redirect(303, `/@${userProfile.username}`);
    } else {
      throw redirect(303, next);
    }
  }

  throw redirect(303, "/auth?error=auth_failed");
};
