 'use client';
import { useEffect, useState } from "react";
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, getCurrentUsername } from "@/lib/auth";
import { fetchModulesWithProgress, Module } from "@/lib/dashboard";
import ModuleCard from "@/components/dashboard/ModuleCard";
import JourneyCard from "@/components/dashboard/JourneyCard";
import { AchievementUnlockToaster } from "@/components/achievements/unlock-toaster";
import { Button } from "@/components/ui/button";
import StartNewJourneyModal from '@/components/dashboard/StartNewJourneyModal';
import { HubsDashboard } from "@/components/dashboard/HubsDashboard";

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [enrichedModules, setEnrichedModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);

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
                setUsername(await getCurrentUsername(user.id))
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

        // Debug helper: detect elements that overflow the viewport width and outline them.
        // This runs only in the browser and helps find the element causing horizontal scroll.
        useEffect(() => {
            function findOverflows() {
                try {
                    const vw = window.innerWidth || document.documentElement.clientWidth;
                    const els = Array.from(document.querySelectorAll('body *')) as HTMLElement[];
                    const offenders: HTMLElement[] = [];
                    els.forEach((el) => {
                        // skip script/style/meta elements
                        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return;
                        const rect = el.getBoundingClientRect();
                        // consider elements that are wider than viewport by more than 1px
                        if (rect.width > vw + 1) {
                            offenders.push(el);
                            el.style.outline = '3px solid rgba(220,38,38,0.9)';
                            el.style.transition = 'outline 200ms ease-in-out';
                        }
                    });
                    if (offenders.length) {
                        console.warn('Found DOM elements wider than viewport:', offenders);
                        offenders.slice(0,10).forEach((el) => console.warn(el, el.className, el.getBoundingClientRect()));
                    } else {
                        console.info('No overflowing elements detected by diagnostics');
                    }
                } catch (e) {
                    // ignore diagnostics errors
                    console.error('Overflow diagnostic failed', e);
                }
            }

            // run on mount and on resize
            findOverflows();
            window.addEventListener('resize', findOverflows);
            return () => window.removeEventListener('resize', findOverflows);
        }, []);

    return (
        <div className="max-w-4xl mx-auto mt-6 px-4 sm:px-6 overflow-x-hidden">
            <AchievementUnlockToaster />
            <header className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold">Welcome back {username || "User"}</h1>
                <h2 className="text-sm sm:text-lg mt-2 font-semibold text-muted-foreground">Your Learning Journey</h2>
            </header>

            {loading && (
                <div className="mt-4 text-center text-gray-500">
                    Loading your modules...
                </div>
            )}

            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    Error: {error}
                </div>
            )}

            {!loading && !error && (
                <div className="mt-4 space-y-6 w-full">
                    <div className="space-y-4">
                        {enrichedModules.map((module) => (
                            <ModuleCard key={module.id} module={module} />
                        ))}
                    </div>

                    <div className="mt-10 space-y-4 flex flex-col items-center mb-10">
                        <HubsDashboard />
                        <JourneyCard userid={user?.id} />
                        <StartNewJourneyModal userid={user?.id}>
                            <Button className="text-center hover:cursor-pointer">Start New Journey</Button>
                        </StartNewJourneyModal>
                    </div>
                </div>
            )}
        </div>
    );
}
