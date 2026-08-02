// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// المتغيرات من .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bxbmeqkfbmgefsjlhbgc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_1aShkVTdFAfYux75YD5EAw_ma1SKtN8'

// إنشاء العميل
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// التحقق من الاتصال
export async function checkConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) throw error
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}
