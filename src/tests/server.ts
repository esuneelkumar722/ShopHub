import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Placeholder handlers - expand per feature tests (Supabase endpoints etc.)
export const handlers = [
  // Default handler for discount_codes to return empty array
  http.get('https://ghqwelumltjyphkebalf.supabase.co/rest/v1/discount_codes', () => {
    return HttpResponse.json([])
  }),
  // Example: rest.get('/api/health', (req, res, ctx) => res(ctx.status(200)))
]

export const server = setupServer(...handlers)
