'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export default function CompleteLessonButton({ lessonId}: { lessonId: string }) {
  const [loading, setLoading] = useState(false)
  const handleCompleteLesson = async () => {
    setLoading(true)

    const user = await getCurrentUser();
    if (!user) {
      alert("Du musst eingeloggt sein.")
      setLoading(false)
      return
    }

    const { error } = await supabase.from('progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      status: 'completed',
    })
    console.log("Saving progress for lesson:", lessonId, "by user:", user.id)
    if (error) {
      alert('Fehler beim Speichern des Fortschritts: ' + error.message)
    } else {
      alert('Lektion abgeschlossen ✅')
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleCompleteLesson}
      className="bg-primary text-white px-4 py-2 rounded"
      disabled={loading}
    >
      {loading ? 'Speichern...' : 'Als abgeschlossen markieren'}
    </button>
  )
}