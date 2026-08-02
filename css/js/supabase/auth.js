// js/supabase/auth.js
import { supabase } from '../../lib/supabase.js'

export async function registerUser(email, password, username, fullName = '') {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { username: username, full_name: fullName || username }
      }
    })
    if (authError) throw authError
    return { success: true, user: authData.user }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
    if (error) throw error
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    return { success: true, user: data.user, profile: profile }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    if (!user) return { success: true, user: null }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    return { success: true, user: user, profile: profile }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
