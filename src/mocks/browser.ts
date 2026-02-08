import { worker } from './handlers'
import { config } from '../lib/config'

// Start MSW worker only when mock API is enabled
if (config.useMockAPI) {
  worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  })
  console.log('[MSW] Mock API enabled')
} else {
  console.log('[MSW] Mock API disabled - using real APIs')
}