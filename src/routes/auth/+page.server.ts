import { redirect } from "@sveltejs/kit";

// Since we only use GitHub OAuth, redirect to profile if user is already logged in
export async function load({ locals }) {
  if (locals.user) {
    throw redirect(303, `/@${locals.user.username}`);
  }
}
