// js/supabase/cart.js
import { supabase } from '../../lib/supabase.js'

export async function getCart(userId) {
  try {
    const { data, error } = await supabase
      .from('cart')
      .select(`*, products(*)`)
      .eq('user_id', userId)
    if (error) throw error
    return { success: true, cart: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function addToCart(userId, productId, quantity = 1, size = null) {
  try {
    const { data, error } = await supabase
      .from('cart')
      .upsert({
        user_id: userId,
        product_id: productId,
        quantity: quantity,
        size_selected: size
      }, { onConflict: 'user_id, product_id, size_selected' })
      .select()
    if (error) throw error
    return { success: true, cart: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function removeFromCart(cartId) {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function clearCart(userId) {
  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
