import LessonPlayer from "@/components/academy/LessonPlayer";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { LessonContent } from "@/lib/types";

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("id, title, description, content_json, modules (title)")
    .eq("id", lessonId)
    .single();

  if (error || !lesson) {
    console.error(error);
    return <div className="p-6">Lesson not found.</div>;
  }

  const content = lesson.content_json as LessonContent;
  const stepsCount = content.steps.length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 text-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {lesson.modules?.title && (
                  <Badge variant="outline" className="border-slate-500 text-slate-200">
                    {lesson.modules.title}
                  </Badge>
                )}
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  Startup Validation
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold">
                {lesson.title}
              </h1>
            </div>
           
          </div>
          {lesson.description && (
            <p className="text-sm text-slate-300 max-w-2xl">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Card with content */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl shadow-lg shadow-black/40">
          <div className="px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span className="font-mono uppercase tracking-wide">
                  Lesson
                </span>{" "}
                <span className="text-slate-300">
                  {lesson.title}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 sm:px-6 sm:py-6">
            <LessonPlayer lessonId={lesson.id} content={content} />
          </div>
        </div>
      </div>
    </div>
  );
}