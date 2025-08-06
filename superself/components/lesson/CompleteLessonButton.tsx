'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CompleteLessonButton({ lessonId }: { lessonId: string }) {
  const [loading, setLoading] = useState(false)

  const handleCompleteLesson = async () => {
    setLoading(true)

    const { data: { session }, error: userError } = await supabase.auth.getSession()
    if (userError) {
      console.error("Error fetching user:", userError)
      setLoading(false)
      return
    }

    if (!session?.user) {
      alert("Du musst eingeloggt sein.")
      setLoading(false)
      return
    }
    const user = session.user
    const { error } = await supabase.from('progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      status: 'completed',
    })

    if (error) {
      alert('Fehler beim Speichern des Fortschritts')
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