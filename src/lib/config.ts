// API Configuration
export const config = {
  // API settings
  useMockAPI: import.meta.env.VITE_USE_MOCK_API === 'true',
  // Supabase settings
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  }
}

// Development helpers
if (import.meta.env.DEV) {
  console.log('[Config] Current environment:', {
    useMockAPI: config.useMockAPI,
    apiMode: config.useMockAPI ? 'Mock APIs (MSW)' : 'Real APIs (Supabase)',
    hasSupabaseConfig: !!(config.supabase.url && config.supabase.anonKey),
    mode: import.meta.env.MODE
  })
}