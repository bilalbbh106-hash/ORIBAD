// js/supabase/products.js
import { supabase } from '../../lib/supabase.js'

export async function getProducts(filters = {}) {
  try {
    let query = supabase
      .from('products')
      .select(`*, categories:category_id (id, name, slug, icon)`)
      .eq('is_active', true)

    if (filters.category) query = query.eq('category_id', filters.category)
    if (filters.size) query = query.eq('size', filters.size)
    if (filters.search) query = query.ilike('name', `%${filters.search}%`)
    
    if (filters.sortBy === 'price-low') {
      query = query.order('price', { ascending: true })
    } else if (filters.sortBy === 'price-high') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return { success: true, products: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function addProduct(productData, imageFile) {
  try {
    let imageUrl = ''
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `product-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)
      imageUrl = urlData.publicUrl
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: productData.name,
        category_id: productData.category_id,
        description: productData.description || '',
        price: productData.price,
        size: productData.size,
        stock: productData.stock || 0,
        image_url: imageUrl
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, product: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
