import { supabase } from "@/lib/supabase";

export const hello = async () => {
    let { data: test_table, error } = await supabase
  .from('test_table')
  .select('message')
    console.log(test_table);
}