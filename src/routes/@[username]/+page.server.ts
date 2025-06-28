import { db } from "$lib/server/db";
import { projects, users } from "$lib/server/schema";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const username = params.username;
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (!user) {
    throw error(404, "User not found");
  }

  const userProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(projects.createdAt);

  // Check if viewing own profile
  const isOwnProfile = locals.user?.id === user.id;

  return {
    user,
    projects: userProjects,
    isOwnProfile,
    currentUser: locals.user || null,
  };
};
