import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;

  // Upsert progress as completed
  const { data, error } = await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
        xp_earned: 10, // or whatever you want
      },
      {
        onConflict: "user_id,lesson_id",
      }
    )
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
