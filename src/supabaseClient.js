import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qurcfdkccsnldmdeflgm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_DvmtYGtxoiuU7G7H7mpN0w_fZeu85VP";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
