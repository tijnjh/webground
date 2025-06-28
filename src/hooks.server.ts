import { getUserById } from "$lib/server/auth";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get("session");

  if (sessionId) {
    const user = await getUserById(sessionId);
    if (user) {
      event.locals.user = user;
    }
  }

  return resolve(event);
};
