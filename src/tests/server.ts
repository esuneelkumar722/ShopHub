import { setupServer } from 'msw/node'


// Placeholder handlers - expand per feature tests (Supabase endpoints etc.)
export const handlers = [
  // Example: rest.get('/api/health', (req, res, ctx) => res(ctx.status(200)))
]

export const server = setupServer(...handlers)
