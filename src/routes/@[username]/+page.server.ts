import { supabase } from "$lib/server/db";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const username = params.username;

  // Get user by username
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (userError || !user) {
    throw error(404, "User not found");
  }

  // Get user's projects
  const { data: userProjects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
    throw error(500, "Failed to load projects");
  }

  // Check if viewing own profile
  const isOwnProfile = locals.user?.id === user.id;

  return {
    user,
    projects: userProjects || [],
    isOwnProfile,
    currentUser: locals.user || null,
  };
};
