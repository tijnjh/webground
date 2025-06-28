import { verifyUser } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, "/");
  }
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const username = data.get("username")?.toString();
    const password = data.get("password")?.toString();

    if (!username || !password) {
      return fail(400, { error: "Username and password are required" });
    }

    const result = await verifyUser(username, password);

    if (result.isErr()) {
      return fail(400, { error: result.error });
    }

    const user = result.value;
    cookies.set("session", user.id, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    throw redirect(302, `/@${username}`);
  },
};
