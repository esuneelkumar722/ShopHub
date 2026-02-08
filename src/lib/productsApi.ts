// API service for products
import type { Product } from '../types'
import { config } from './config'
import { supabase } from './supabase'

export interface ProductFilters {
  search?: string
  category?: string
  sortBy?: string
}

export interface ProductsResponse {
  products: Product[]
  totalCount: number
}

export const fetchProducts = async (
  filters: ProductFilters,
  page: number,
  limit: number
): Promise<ProductsResponse> => {
  // Use mock API in development, Supabase in production
  if (config.useMockAPI) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.sortBy && { sortBy: filters.sortBy })
    })

    const baseUrl = ''
    const endpoint = `${baseUrl}/api/products?${params}`

    console.log(`[API] Mock API call:`, endpoint)

    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
    }
    return response.json()
  } else {
    // Use Supabase for real data
    console.log(`[API] Real Supabase call: products, page ${page}, limit ${limit}`)

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    // Apply filters
    if (filters.category && filters.category !== '') {
      query = query.eq('category', filters.category)
    }

    if (filters.search && filters.search.trim() !== '') {
      query = query.ilike('name', `%${filters.search.trim()}%`)
    }

    // Apply sorting
    if (filters.sortBy === 'price-low') {
      query = query.order('price', { ascending: true })
    } else if (filters.sortBy === 'price-high') {
      query = query.order('price', { ascending: false })
    } else if (filters.sortBy === 'rating') {
      query = query.order('rating', { ascending: false })
    } else {
      // Default: newest
      query = query.order('id', { ascending: false })
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }

    return {
      products: data || [],
      totalCount: count || 0
    }
  }
}

// Separate function for categories
export const fetchCategories = async (): Promise<string[]> => {
  if (config.useMockAPI) {
    const baseUrl = ''
    const endpoint = `${baseUrl}/api/categories`

    console.log(`[API] Mock categories call:`, endpoint)

    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
    }
    return response.json()
  } else {
    // Use Supabase for real categories
    console.log(`[API] Real Supabase categories call`)

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('Supabase categories error:', error)
      throw new Error(`Failed to fetch categories: ${error.message}`)
    }

    // Get unique categories
    const categories = [...new Set((data as { category: string }[] || []).map(item => item.category))]
    return categories.sort()
  }
}