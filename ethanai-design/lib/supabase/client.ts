import { createBrowserClient } from '@supabase/ssr'

function getRequiredEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function createClient() {
  const url = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL')
  const anonKey = getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  return createBrowserClient(url, anonKey)
}
