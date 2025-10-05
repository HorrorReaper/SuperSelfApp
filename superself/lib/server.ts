import { supabase } from "./supabase";

// hier packe ich alle serverseitigen funktionen rein, die ich selbst implementiere
export async function loadIntakeFromServer(userId?: string) {
    if(!userId) {
        const { data: auth } = await supabase.auth.getUser(); 
        userId = auth?.user?.id;
    }
        const { error, data } = await supabase.from('user_intake').select('payload').eq('user_id', userId).single();
    if (error) {
        console.error('loadIntakeFromServer error', error);
        return null;
    }
    return data?.payload ?? null;
}