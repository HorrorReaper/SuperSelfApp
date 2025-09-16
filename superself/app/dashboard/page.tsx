'use client';
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { fetchModulesWithProgress, Module } from "@/lib/dashboard";
import ModuleCard from "@/components/dashboard/ModuleCard";
import JourneyCard from "@/components/dashboard/JourneyCard";
import { Button } from "@/components/ui/button";
import { AchievementUnlockToaster } from "@/components/achievements/unlock-toaster";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [enrichedModules, setEnrichedModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const user = await getCurrentUser();
                setUser(user);

                if (!user) {
                    window.location.href = "/auth/sign-in";
                    return;
                }

                console.log("User:", user);

                const modulesWithProgress = await fetchModulesWithProgress(user.id);
                setEnrichedModules(modulesWithProgress);
            } catch (err) {
                console.error("Error loading dashboard data:", err);
                setError(err instanceof Error ? err.message : "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <div className="max-w-2xl mx-auto mt-10">
            <AchievementUnlockToaster />
            <h1 className="text-2xl font-bold">Welcome back 💪</h1>
            <h2 className="text-lg mt-4 font-bold">Your Learning Journey</h2>

            {loading && (
                <div className="mt-4 text-center text-gray-500">
                    Loading your modules...
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    Error: {error}
                </div>
            )}

            {!loading && !error && enrichedModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
            ))}
            {/* Beautiful Journey Card */}
            <JourneyCard />
        </div>
    );
}
