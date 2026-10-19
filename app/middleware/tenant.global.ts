import { useTenantStore, type SchoolTenant } from '~/stores/tenant'

const RESERVED_SUBDOMAINS = new Set([
  'admin', 'api', 'app', 'assets', 'cdn', 'dashboard',
  'mail', 'static', 'staging', 'status', 'support', 'www'
])

export default defineNuxtRouteMiddleware(async () => {
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
      const tenant: SchoolTenant = {
        id: explicitTenantId,
        name: 'Demo School',
        slug: 'demo',
        currency: 'NGN',
        symbol: '₦',
        country: 'Nigeria',
        timezone: 'Africa/Lagos',
        planId: 'school_plus',
        academicYear: '2025/2026',
        currentTerm: 'Second Term'
      }
      tenantStore.setTenant(tenant)
      return
    }
  } else {
    host = window.location.host
  }

  const normalizedHost = (host.split(':')[0] || '').trim().toLowerCase()
  const appDomain = (config.public.appDomain || '').toLowerCase()
  let slug: string | null = null

  // Handle localhost (e.g. school1.localhost:3000)
  if (normalizedHost.includes('.localhost')) {
    const parts = normalizedHost.split('.')
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      const candidate = parts[0]
      if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
        slug = candidate
      }
    }
  } else if (appDomain && normalizedHost.endsWith(`.${appDomain}`)) {
    const candidate = normalizedHost.slice(0, -(appDomain.length + 1))
    if (candidate && !RESERVED_SUBDOMAINS.has(candidate)) {
      slug = candidate
    }
  }

  if (slug) {
    tenantStore.isResolving = true
    try {
      const resolvedTenant: SchoolTenant = {
        id: `tenant-${slug}`,
        name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Academy`,
        slug: slug,
        currency: 'NGN',
        symbol: '₦',
        country: 'Nigeria',
        timezone: 'Africa/Lagos',
        planId: 'school_plus',
        academicYear: '2025/2026',
        currentTerm: 'Second Term'
      }
      tenantStore.setTenant(resolvedTenant)
    } catch (err: any) {
      tenantStore.setError(err.message || 'Tenant not found')
    } finally {
      tenantStore.isResolving = false
    }
  }
})
