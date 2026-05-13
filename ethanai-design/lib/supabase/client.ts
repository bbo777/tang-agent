import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  
  console.log('Supabase 配置:', { 
    url: !!supabaseUrl, 
    key: !!supabaseKey 
  })
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL或密钥缺失')
    return null
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey)
}
