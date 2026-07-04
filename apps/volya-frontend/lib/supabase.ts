import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://aaiyysyrvjzrmxloxhui.supabase.co";
const supabaseAnonKey = "sb_publishable__oxtY-XjABqSZQSoYhNG2A_H1CF8NWZ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
