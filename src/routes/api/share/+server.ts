import { supabase } from "$lib/server/db";
import { json } from "@sveltejs/kit";
import { nanoid } from "nanoid";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { title, description, htmlCode, cssCode, jsCode } =
      await request.json();

    if (!title || (!htmlCode && !cssCode && !jsCode)) {
      return json(
        { error: "Title and at least one code field are required" },
        { status: 400 }
      );
    }

    const shortId = nanoid(8); // Generate short ID for URL

    const { data: newProject, error } = await supabase
      .from("projects")
      .insert([
        {
          short_id: shortId,
          title,
          description: description || null,
          html_code: htmlCode || "",
          css_code: cssCode || "",
          js_code: jsCode || "",
          user_id: locals.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error saving project:", error);
      return json({ error: "Failed to save project" }, { status: 500 });
    }

    return json({
      id: newProject.id,
      shortId: newProject.short_id,
      url: `/s/${newProject.short_id}`,
    });
  } catch (error) {
    console.error("Error saving project:", error);
    return json({ error: "Failed to save project" }, { status: 500 });
  }
};
