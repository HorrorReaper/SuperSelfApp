'use client';
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
export default function DashboardPage() {
    const [modules, setModules] = useState<any[]>([]);
    useEffect(() => {
        // Redirect to sign-in page if not authenticated
        const checkAuth = async () => {
            const user = await getCurrentUser();
            console.log("Current user:", user);
            if (!user) {
                window.location.href = "/auth/sign-in";
            }
            const { data: { session } } = await supabase.auth.getSession()
            console.log('Session:', session)

            const { data: userData } = await supabase.auth.getUser()
            console.log('User:', userData?.user)
        };
        async function fetchModules() {
            // Fetch modules from the API or database
            const {data, error} = await supabase.from('modules').select(`id, title, description, order_index, module_lessons(lesson_id, lessons(id, title, description))`).order('order_index'); // Hier wird die Module abgerufen
            // Handle error or set modules state
            if (error) {
                console.error("Error fetching modules:", error);
            } else {
                setModules(data || []);
            }
        }
        checkAuth();
        fetchModules();
    }, []);
    return (
        <div className="max-w-2xl mx-auto mt-10">
            <h1 className="text-2xl font-bold">Welcome back 💪</h1>
            <h2 className="text-lg mt-4 font-bold">Your Learning journey</h2>
            {modules.map((mod) => (
                <div key={mod.id} className="border rounded-xl p-4 space-y-2">
                    <h2 className="text-xl font-semibold">{mod.title}</h2>
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mod.module_lessons.map((m1) => (
                            <a key={m1.lesson_id} href={`/lessons/${m1.lessons.id}`} className="p-3 rounded-lg bg-muted hover:bg-muted/70 transition">
                               <h3 className="text-lg font-bold"> {m1.lessons.title}</h3>
                               <p className="text-sm font-light">{m1.lessons.description}</p>
                            </a>
                        ))}
                        </div>
                    </div>))}
        </div>
    );
}