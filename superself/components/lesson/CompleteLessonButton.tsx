'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

interface CompleteLessonButtonProps {
  lessonId: string;
  isCompleted?: boolean;
  onComplete?: () => void;
}

export default function CompleteLessonButton({ 
  lessonId, 
  isCompleted = false, 
  onComplete 
}: CompleteLessonButtonProps) {
  const [loading, setLoading] = useState(false)
  const handleCompleteLesson = async () => {
    // Strong prevention - check multiple conditions
    if (isCompleted || loading) {
      console.log("Action prevented: lesson already completed or loading");
      return;
    }

    setLoading(true)

    try {
      const user = await getCurrentUser();
      if (!user) {
        alert("Du musst eingeloggt sein.")
        setLoading(false)
        return
      }

      // Double-check if lesson is already completed before saving
      const { data: existingProgress } = await supabase
        .from('progress')
        .select('status')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .single();

      if (existingProgress?.status === 'completed') {
        console.log("Lesson already completed, skipping update");
        alert('Diese Lektion ist bereits abgeschlossen!');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('progress').upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status: 'completed',
      })
      
      console.log("Saving progress for lesson:", lessonId, "by user:", user.id)
      
      if (error) {
        console.error("Error saving progress:", error);
        alert('Fehler beim Speichern des Fortschritts: ' + error.message)
      } else {
        alert('Lektion abgeschlossen ✅')
        // Call the onComplete callback to refresh data
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    // Prevent any action if completed or loading
    if (isCompleted || loading) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    handleCompleteLesson();
  };

  return (
    <button
      onClick={handleButtonClick}
      className={`px-4 py-2 rounded transition-colors ${
        isCompleted 
          ? 'bg-green-600 text-white cursor-not-allowed opacity-75' 
          : 'bg-primary text-white hover:bg-primary/90'
      }`}
      disabled={loading || isCompleted}
      aria-disabled={loading || isCompleted}
    >
      {loading ? 'Speichern...' : 
       isCompleted ? 'Bereits abgeschlossen ✅' : 
       'Als abgeschlossen markieren'}
    </button>
  )
}