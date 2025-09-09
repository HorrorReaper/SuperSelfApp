'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CompleteLessonButton from '@/components/lesson/CompleteLessonButton';
import { getCurrentUser } from '@/lib/auth';
export default function LessonPage(){
    const {id} = useParams(); // Get the lesson ID from the URL parameters
    const [lesson, setLesson] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [lessonProgress, setLessonProgress] = useState<any>(null);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Get user first
      const user = await getCurrentUser();
      if (!user) {
        console.error('Error fetching user:')
        setLoading(false);
        return;
      } else {
        setUser(user);
      }

      // Fetch lesson data
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (lessonError) {
        console.error("Error fetching lesson:", lessonError);
      } else {
        setLesson(lessonData);
      }

      // Debug: Check all progress records for this user
      const { data: allProgress } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id);
      
      console.log("All progress records for user:", allProgress);

      // Fetch user progress for this lesson
      console.log("Fetching progress for user:", user.id, "lesson:", id);
      console.log("Lesson ID type:", typeof id, "User ID type:", typeof user.id);
      
      // Try without .single() first to see if any records exist
      const { data: progressArray, error: progressArrayError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', id);

      console.log("Progress array query result:", { progressArray, progressArrayError });

      // Now try with .single() 
      const { data: progressData, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', id)
        .single();

      console.log("Progress single query result:", { progressData, progressError });

      console.log("Progress query result:", { progressData, progressError });

      if (progressError && progressError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine (no progress yet)
        console.error("Error fetching progress:", progressError);
        setLessonProgress(null);
      } else {
        // Use the array result if single fails, take the first record
        const finalProgressData = progressData || (progressArray && progressArray.length > 0 ? progressArray[0] : null);
        console.log("Setting progress data:", finalProgressData);
        setLessonProgress(finalProgressData);
      }

      setLoading(false);
    };

    if (id) {
      fetchData();
    }
  }, [id])
    if(loading || !lesson) {
        return <div>Loading...</div>; // Show loading state while fetching lesson
    }
    
    const isCompleted = lessonProgress?.status === 'completed';
    console.log("=== DEBUGGING LESSON COMPLETION ===");
    console.log("Lesson ID:", id);
    console.log("User ID:", user?.id);
    console.log("Raw lesson progress data:", lessonProgress);
    console.log("Progress status:", lessonProgress?.status);
    console.log("Status type:", typeof lessonProgress?.status);
    console.log("Is completed check:", lessonProgress?.status === 'completed');
    console.log("Is completed result:", isCompleted);
    console.log("=== END DEBUGGING ===");

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
           <div>
            {user ? (
              <p>Willkommen, {user.email}</p>
            ) : (
              <p>Kein Benutzer eingeloggt</p>
            )}
          </div>
            <h1 className='text-3xl font-bold'>{lesson.title}</h1>
            <p>{lesson.description}</p>
            {!isCompleted ?<CompleteLessonButton 
              lessonId={lesson.id} 
              isCompleted={isCompleted}
              onComplete={() => {
                // Refresh progress data after completion
                if (user) {
                  supabase
                    .from('progress')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('lesson_id', id)
                    .single()
                    .then(({ data }) => setLessonProgress(data));
                }
              }}
            />: <p>Bereits abgeschlossen ✅</p>}
        </div>
    )
}