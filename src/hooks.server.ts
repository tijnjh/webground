import { SUPABASE_KEY } from "$env/static/private";
import { getUserById } from "$lib/server/auth";
import { createServerClient } from "@supabase/ssr";
import type { Handle } from "@sveltejs/kit";

const supabaseUrl = "https://satstldgrbsrpfktfmlt.supabase.co";

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(supabaseUrl, SUPABASE_KEY, {
    cookies: {
      get: (key: string) => event.cookies.get(key),
      set: (key: string, value: string, options: any) => {
        event.cookies.set(key, value, { ...options, path: "/" });
      },
      remove: (key: string, options: any) => {
        event.cookies.delete(key, { ...options, path: "/" });
      },
    },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const user = await getUserById(session.user.id);
    if (user) {
      event.locals.user = user;
    }
  }

  return resolve(event);
};
