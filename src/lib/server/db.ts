import { SUPABASE_KEY } from "$env/static/private";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://satstldgrbsrpfktfmlt.supabase.co";
const supabaseKey = SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
