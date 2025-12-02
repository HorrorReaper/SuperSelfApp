import LessonPlayer from "@/components/academy/LessonPlayer";
import { supabase } from "@/lib/supabase";
import { LessonContent } from "@/lib/types";

export default async function LessonPage({ params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
     const { data: lesson, error } = await supabase
    .from("lessons")
    .select("id, title, description, content_json")
    .eq("id", params.lessonId)
    .single();

  if (error || !lesson) {
    console.error(error);
    return <div className="p-6">Lesson not found.</div>;
  }

  const content = lesson.content_json as LessonContent;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground text-sm">
            {lesson.description}
          </p>
        )}
      </div>

      <LessonPlayer lessonId={lesson.id} content={content} />
    </div>
  );
}