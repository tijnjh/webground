import { SUPABASE_KEY } from "$env/static/private";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

const supabaseUrl = "https://satstldgrbsrpfktfmlt.supabase.co";

export const actions: Actions = {
  default: async ({ cookies }) => {
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

    // Sign out with Supabase (this clears the session automatically)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }

    // Clear any remaining cookies (legacy cleanup)
    cookies.delete("session", { path: "/" });

    throw redirect(302, "/");
  },
};
