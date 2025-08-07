'use client';
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [modules, setModules] = useState<any[]>([]);
    const [user, setUser] = useState(null);
    const [enrichedModules, setEnrichedModules] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getCurrentUser();
            setUser(user);

            if (!user) {
                window.location.href = "/auth/sign-in";
                return;
            }

            console.log("User:", user);

            // Fetch modules
            const { data: modulesData, error: modulesError } = await supabase
                .from('modules')
                .select(`id, title, description, order_index, module_lessons(lesson_id, lessons(id, title, description))`)
                .order('order_index');

            if (modulesError) {
                console.error("Error fetching modules:", modulesError);
                return;
            }

            // Fetch progress
            const { data: progress, error: progressError } = await supabase
                .from('progress')
                .select('lesson_id, status')
                .eq('user_id', user.id);

            if (progressError) {
                console.error("Error fetching progress:", progressError);
                return;
            }

            const progressMap = new Map(progress.map(p => [p.lesson_id, p.status]));

            // Combine progress into modules
            const mergedModules = modulesData.map(module => ({
                ...module,
                module_lessons: module.module_lessons.map(ml => ({
                    ...ml,
                    lessons: {
                        ...ml.lessons,
                        status: progressMap.get(ml.lesson_id) || 'locked'
                    }
                }))
            }));

            setModules(modulesData);
            setEnrichedModules(mergedModules);
        };

        checkAuth();
    }, []);

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <h1 className="text-2xl font-bold">Welcome back 💪</h1>
            <h2 className="text-lg mt-4 font-bold">Your Learning Journey</h2>

            {enrichedModules.map((mod) => (
                <div key={mod.id} className="border rounded-xl p-4 space-y-2 mt-4">
                    <h2 className="text-xl font-semibold">{mod.title}</h2>
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {mod.module_lessons.map((m1) => (
                            <a
                                key={m1.lesson_id}
                                href={`/lessons/${m1.lessons.id}`}
                                className="p-3 rounded-lg bg-muted hover:bg-muted/70 transition"
                            >
                                <h3 className="text-lg font-bold">{m1.lessons.title}</h3>
                                <p className="text-sm font-light">{m1.lessons.description}</p>
                                <p className="text-xs mt-1 text-gray-500">
                                    Status: <span className="capitalize">{m1.lessons.status}</span>
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
