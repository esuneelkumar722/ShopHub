import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'

// Mock data for products
const mockProducts = [
  // Electronics
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation.',
    price: 99.99,
    category: 'electronics',
    image_url: '/images/headphones.jpg',
    stock: 50,
    rating: 4.5,
    reviews_count: 120,
    created_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Feature-rich smart watch with health tracking.',
    price: 199.99,
    category: 'electronics',
    image_url: '/images/smartwatch.jpg',
    stock: 30,
    rating: 4.2,
    reviews_count: 85,
    created_at: '2023-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'iPad Air',
    description: 'Powerful tablet with M1 chip and 10.9-inch display',
    price: 599.00,
    category: 'electronics',
    image_url: '/images/ipad.jpg',
    stock: 25,
    rating: 4.7,
    reviews_count: 150,
    created_at: '2023-01-03T00:00:00Z'
  },

  // Clothing
  {
    id: '4',
    name: 'Patagonia Fleece',
    description: 'Warm and sustainable outdoor fleece jacket',
    price: 169.00,
    category: 'clothing',
    image_url: '/images/fleece.jpg',
    stock: 40,
    rating: 4.8,
    reviews_count: 95,
    created_at: '2023-01-04T00:00:00Z'
  },
  {
    id: '5',
    name: 'Ray-Ban Sunglasses',
    description: 'Classic aviator sunglasses with UV protection',
    price: 154.00,
    category: 'clothing',
    image_url: '/images/sunglasses.jpg',
    stock: 60,
    rating: 4.5,
    reviews_count: 200,
    created_at: '2023-01-05T00:00:00Z'
  },

  // Home
  {
    id: '6',
    name: 'Roomba Robot Vacuum',
    description: 'Smart robot vacuum with app control and mapping',
    price: 449.00,
    category: 'home',
    image_url: '/images/roomba.jpg',
    stock: 15,
    rating: 4.7,
    reviews_count: 300,
    created_at: '2023-01-06T00:00:00Z'
  },
  {
    id: '7',
    name: 'Instant Pot Duo',
    description: '7-in-1 programmable pressure cooker',
    price: 89.00,
    category: 'home',
    image_url: '/images/instantpot.jpg',
    stock: 35,
    rating: 4.8,
    reviews_count: 450,
    created_at: '2023-01-07T00:00:00Z'
  },

  // Books
  {
    id: '8',
    name: 'Atomic Habits',
    description: 'Tiny changes, remarkable results by James Clear',
    price: 16.99,
    category: 'books',
    image_url: '/images/atomichabits.jpg',
    stock: 100,
    rating: 4.9,
    reviews_count: 1000,
    created_at: '2023-01-08T00:00:00Z'
  },
  {
    id: '9',
    name: 'The Psychology of Money',
    description: 'Timeless lessons on wealth by Morgan Housel',
    price: 14.99,
    category: 'books',
    image_url: '/images/psychologymoney.jpg',
    stock: 80,
    rating: 4.8,
    reviews_count: 800,
    created_at: '2023-01-09T00:00:00Z'
  },

  // Sports
  {
    id: '10',
    name: 'Yoga Mat Premium',
    description: 'Non-slip exercise mat with carrying strap',
    price: 34.99,
    category: 'sports',
    image_url: '/images/yogamat.jpg',
    stock: 70,
    rating: 4.7,
    reviews_count: 180,
    created_at: '2023-01-10T00:00:00Z'
  },
  {
    id: '11',
    name: 'Adjustable Dumbbells',
    description: 'Space-saving 5-52.5 lbs adjustable weights',
    price: 299.00,
    category: 'sports',
    image_url: '/images/dumbbells.jpg',
    stock: 20,
    rating: 4.8,
    reviews_count: 120,
    created_at: '2023-01-11T00:00:00Z'
  }
]

// Mock API handlers
export const handlers = [
  // GET /api/products - Fetch products with filters and pagination
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const category = url.searchParams.get('category') || ''
    const sortBy = url.searchParams.get('sortBy') || 'newest'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filteredProducts = mockProducts

    // Apply search filter
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply category filter
    if (category) {
      filteredProducts = filteredProducts.filter(product =>
        product.category === category
      )
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filteredProducts.sort((a, b) => b.price - a.price)
    } else {
      // Default: newest
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    // Pagination
    const totalCount = filteredProducts.length
    const startIndex = (page - 1) * limit
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      products: paginatedProducts,
      totalCount
    })
  }),

  // GET /api/categories - Fetch unique categories
  http.get('/api/categories', () => {
    const uniqueCategories = [...new Set(mockProducts.map(product => product.category))]
    return HttpResponse.json(uniqueCategories)
  })
]

// Setup MSW worker
export const worker = setupWorker(...handlers)