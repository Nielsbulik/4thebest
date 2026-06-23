import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://joftafygislpmgilmsrq.supabase.co";
const SUPABASE_KEY = "sb_publishable_U3FoHecbFIKEAObcdlLaqg_q4smzWJe";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
