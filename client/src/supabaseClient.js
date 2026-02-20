import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dazfcrxemmeromgifxhl.supabase.co";
const supabaseAnonKey = "sb_publishable_7qgiuoEb1Qq-BJbEPm52MA_-_eTUU-H";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
