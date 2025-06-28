import { db } from "$lib/server/db";
import { projects } from "$lib/server/schema";
import { json } from "@sveltejs/kit";
import { nanoid } from "nanoid";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { title, description, htmlCode, cssCode, jsCode } = await request
      .json();

    if (!title || (!htmlCode && !cssCode && !jsCode)) {
      return json(
        { error: "Title and at least one code field are required" },
        { status: 400 },
      );
    }

    const shortId = nanoid(8); // Generate short ID for URL

    const newProject = await db
      .insert(projects)
      .values({
        shortId,
        title,
        description: description || null,
        htmlCode: htmlCode || "",
        cssCode: cssCode || "",
        jsCode: jsCode || "",
        userId: locals.user.id,
      })
      .returning()
      .get();

    return json({
      id: newProject.id,
      shortId: newProject.shortId,
      url: `/s/${newProject.shortId}`,
    });
  } catch (error) {
    console.error("Error saving project:", error);
    return json({ error: "Failed to save project" }, { status: 500 });
  }
};
