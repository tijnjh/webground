// Database types for Supabase
export interface User {
  id: string;
  username: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  short_id: string;
  title: string;
  description?: string;
  html_code: string;
  css_code: string;
  js_code: string;
  user_id?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type NewUser = Omit<User, "id" | "created_at" | "updated_at">;
export type NewProject = Omit<Project, "id" | "created_at" | "updated_at">;
