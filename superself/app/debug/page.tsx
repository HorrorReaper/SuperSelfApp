'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugAuth() {
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Session:', session)

      const { data: userData } = await supabase.auth.getUser()
      console.log('User:', userData?.user)
    }

    checkAuth()
  }, [])

  return <div>Debugging...</div>
}
