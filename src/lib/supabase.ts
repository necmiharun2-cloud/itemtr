import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gukikaazooxafrycfymx.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1aWthaF6b294YWZyeWNmeW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI3MDU0MDAsImV4cCI6MjAzODI4MTQwMH0.Y4pFqLhC6nJdQ2R2n2W7k8l9s8g8J9Z1k1w2J3d4E5'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers with error handling
export const signUp = async (email: string, password: string, metadata?: object) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    })
    return { data, error }
  } catch (e) {
    return { data: null, error: e }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  } catch (e) {
    return { data: null, error: e }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (e) {
    return { error: e }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (e) {
    return null
  }
}

export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (e) {
    return null
  }
}

