import { db } from "$lib/server/db";
import { projects, users } from "$lib/server/schema";
import { error } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const result = await db
    .select({
      project: projects,
      user: users,
    })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.id))
    .where(eq(projects.shortId, params.id))
    .get();

  if (!result) {
    throw error(404, "Project not found");
  }

  return {
    project: result.project,
    creator: result.user,
  };
};
