// js/supabase/notifications.js
import { supabase } from '../../lib/supabase.js'

export async function getNotifications(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},target.eq.all`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, notifications: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function markAsRead(notifId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function createNotification(notification) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single()
    if (error) throw error
    return { success: true, notification: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
