'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { get } from 'http';
import { getCurrentUser } from '@/lib/auth';
import CompleteLessonButton from '@/components/lesson/CompleteLessonButton';
export default function LessonPage(){
    const {id} = useParams(); // Get the lesson ID from the URL parameters
    const [lesson, setLesson] = useState<any>(null);
    const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        console.error('Error fetching user:', error.message)
      } else {
        setUser(user)
      }
    }

    getUser()
  }, [])
  
    useEffect(() => {
        async function fetchLesson() {
            const { data, error } = await supabase.from('lessons').select('*').eq('id', id).single();// Fetch the lesson by ID
            if (error) {
                console.error("Error fetching lesson:", error);
            } else {
                setLesson(data);
            }
        }
        fetchLesson();
    }, [id]);
    if(!lesson) {
        return <div>Loading...</div>; // Show loading state while fetching lesson
    }
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
            <CompleteLessonButton lessonId={lesson.id} />
        </div>
    )
}