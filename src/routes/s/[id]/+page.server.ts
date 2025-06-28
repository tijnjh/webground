import { supabase } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      `
      *,
      users (*)
    `
    )
    .eq("short_id", params.id)
    .single();

  if (projectError || !project) {
    throw error(404, "Project not found");
  }

  return {
    project,
    creator: project.users,
  };
};
