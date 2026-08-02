// js/supabase/storage.js
import { supabase } from '../../lib/supabase.js'

export async function uploadProductImage(file) {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `product-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
