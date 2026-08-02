// js/supabase/orders.js
import { supabase } from '../../lib/supabase.js'

export async function createOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    if (error) throw error
    return { success: true, order: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getOrders(userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return { success: true, orders: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: status })
      .eq('id', orderId)
      .select()
      .single()
    if (error) throw error
    return { success: true, order: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
