'use client';
// app/(app)/founder/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { useEffect, useState } from "react";

type ModuleWithLessons = {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: {
    id: string;
    title: string;
    description: string | null;
    order_index: number;
  }[];
};

export default function FounderDashboardPage() {
  const [modules, setModules] = useState<ModuleWithLessons[]>([]);
  const [skill, setSkill] = useState<{ id: string; name: string } | null>(null);
  const [progressByLessonId, setProgressByLessonId] = useState<Map<string, { status: string; completed_at: string | null }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Get current user
        const user = await getCurrentUser();
        if (!user) {
            console.error("No user found, redirecting to sign-in.");
          redirect("/auth/sign-in");
          return;
        }

        // 2) Get the "startup-validation" skill
        const { data: skillData, error: skillError } = await supabase
          .from("skills")
          .select("id, name, description")
          .eq("slug", "startup-validation")
          .single();

        if (skillError || !skillData) {
          console.error(skillError);
          setError("Skill not found.");
          setLoading(false);
          return;
        }

        setSkill(skillData);

        // 3) Fetch modules + lessons for that skill
        const { data: modulesRaw, error: modulesError } = await supabase
          .from("modules")
          .select(
            `
            id,
            title,
            description,
            order_index,
            lessons (
              id,
              title,
              description,
              order_index
            )
          `
          )
          .eq("skill_id", skillData.id)
          .order("order_index", { ascending: true });

        if (modulesError || !modulesRaw) {
          console.error(modulesError);
          setError("No modules found.");
          setLoading(false);
          return;
        }

        const sortedModules = (modulesRaw as any[]).map((m) => ({
          ...m,
          lessons: (m.lessons || []).sort(
            (a: any, b: any) => a.order_index - b.order_index
          ),
        })) as ModuleWithLessons[];

        setModules(sortedModules);

        // 4) Fetch user progress for these lessons
        const lessonIds = sortedModules.flatMap((m) => m.lessons.map((l) => l.id));

        if (lessonIds.length > 0) {
          const { data: progressRows, error: progressError } = await supabase
            .from("user_progress")
            .select("lesson_id, status, completed_at")
            .eq("user_id", user.id)
            .in("lesson_id", lessonIds);

          if (progressError) {
            console.error(progressError);
          }

          const progressMap = new Map<string, { status: string; completed_at: string | null }>();
          (progressRows || []).forEach((row) => {
            progressMap.set(row.lesson_id, {
              status: row.status,
              completed_at: row.completed_at,
            });
          });

          setProgressByLessonId(progressMap);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("An error occurred while loading data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6">{error}</div>;
  }

  if (!skill) {
    return <div className="p-6">Skill not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {skill.name} – Your Validation Journey
        </h1>
        <p className="text-sm text-muted-foreground">
          See all modules and lessons, and track your progress.
        </p>
      </header>

      <div className="space-y-6">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            progressByLessonId={progressByLessonId}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({
  module,
  progressByLessonId,
}: {
  module: ModuleWithLessons;
  progressByLessonId: Map<string, { status: string; completed_at: string | null }>;
}) {
  return (
    <section className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-lg">{module.title}</h2>
          {module.description && (
            <p className="text-xs text-muted-foreground">
              {module.description}
            </p>
          )}
        </div>
        {/* You can compute module progress later if you want */}
      </div>

      <div className="space-y-1">
        {module.lessons.map((lesson) => {
          const progress = progressByLessonId.get(lesson.id);
          const status = progress?.status ?? "not_started";

          return (
            <LessonRow key={lesson.id} lesson={lesson} status={status} />
          );
        })}
      </div>
    </section>
  );
}

function LessonRow({
  lesson,
  status,
}: {
  lesson: { id: string; title: string; description: string | null };
  status: string;
}) {
  const statusLabel =
    status === "completed"
      ? "Completed"
      : status === "in_progress"
      ? "In progress"
      : "Not started";

  const statusColor =
    status === "completed"
      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
      : status === "in_progress"
      ? "bg-blue-100 text-blue-700 border-blue-300"
      : "bg-slate-100 text-slate-600 border-slate-300";

  return (
    <Link
      href={`/academy/founder/${lesson.id}`}
      className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted transition-colors"
    >
      <div className="flex flex-col">
        <span className="text-sm font-medium">{lesson.title}</span>
        {lesson.description && (
          <span className="text-xs text-muted-foreground">
            {lesson.description}
          </span>
        )}
      </div>
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColor}`}
      >
        {statusLabel}
      </span>
    </Link>
  );
}
