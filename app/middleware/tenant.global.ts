import { useTenantStore } from '~/stores/tenant'

const RESERVED_SUBDOMAINS = new Set([
  'admin', 'api', 'app', 'assets', 'cdn', 'dashboard',
  'mail', 'static', 'staging', 'status', 'support', 'www'
])

export default defineNuxtRouteMiddleware(async (to) => {
  const tenantStore = useTenantStore()
  const config = useRuntimeConfig()
  
  // Skip resolution if already resolved
  if (tenantStore.currentTenant) return

  let host = ''
  if (import.meta.server) {
    const headers = useRequestHeaders(['host', 'x-forwarded-host', 'x-tenant-id'])
    host = headers['x-forwarded-host'] || headers['host'] || ''
    const explicitTenantId = headers['x-tenant-id']
    if (explicitTenantId) {
      tenantStore.setTenant({
        id: explicitTenantId,
        name: 'Demo School',
        slug: 'demo',
        currency: 'NGN'
      })
      return
    }
  } else {
    host = window.location.host
  }

  const normalizedHost = host.split(':')[0].trim().toLowerCase()
  const appDomain = (config.public.appDomain || '').toLowerCase()
  let slug: string | null = null

  // Handle localhost (e.g. school1.localhost:3000)
  if (normalizedHost.includes('.localhost')) {
    const parts = normalizedHost.split('.')
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      const candidate = parts[0]
      if (!RESERVED_SUBDOMAINS.has(candidate)) slug = candidate
    }
  } else if (appDomain && normalizedHost.endsWith(`.${appDomain}`)) {
    const candidate = normalizedHost.slice(0, -(appDomain.length + 1))
    if (!RESERVED_SUBDOMAINS.has(candidate)) slug = candidate
  }

  if (slug) {
    tenantStore.isResolving = true
    try {
      // In production calls: `${config.public.accountsApiV1Url}/schools/${encodeURIComponent(slug)}/info`
      // For standalone replica:
      tenantStore.setTenant({
        id: `tenant-${slug}`,
        name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Academy`,
        slug: slug,
        currency: 'NGN'
      })
    } catch (err: any) {
      tenantStore.setError(err.message || 'Tenant not found')
    } finally {
      tenantStore.isResolving = false
    }
  }
})
