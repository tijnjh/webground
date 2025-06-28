import { createUser } from "$lib/server/auth";
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
    const email = data.get("email")?.toString();
    const password = data.get("password")?.toString();
    const confirmPassword = data.get("confirmPassword")?.toString();

    if (!username || !email || !password || !confirmPassword) {
      return fail(400, { error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return fail(400, { error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return fail(400, { error: "Password must be at least 6 characters" });
    }

    // Basic email validation
    if (!email.includes("@") || !email.includes(".")) {
      return fail(400, { error: "Please enter a valid email address" });
    }

    const result = await createUser(username, email, password);

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

    throw redirect(302, `/@${user.username}`);
  },
};
