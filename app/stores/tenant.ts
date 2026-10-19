import { defineStore } from 'pinia'

export interface SchoolTenant {
  id: string
  name: string
  slug: string
  motto?: string
  logoUrl?: string
  currency: 'NGN' | 'GBP' | 'USD'
  symbol: string
  country: string
  timezone: string
  planId: 'standard' | 'pro' | 'school_plus' | 'enterprise'
  academicYear: string
  currentTerm: string
}

export const PRECONFIGURED_TENANTS: SchoolTenant[] = [
  {
    id: 'apex-academy',
    name: 'Apex International Academy',
    slug: 'apex-academy',
    motto: 'Excellence, Character & Global Leadership',
    currency: 'NGN',
    symbol: '₦',
    country: 'Nigeria',
    timezone: 'Africa/Lagos',
    planId: 'school_plus',
    academicYear: '2025/2026',
    currentTerm: 'Second Term (Lent Term)'
  },
  {
    id: 'kingsway-college',
    name: 'Kingsway British College',
    slug: 'kingsway',
    motto: 'Knowledge is Power & Distinction',
    currency: 'GBP',
    symbol: '£',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    planId: 'enterprise',
    academicYear: '2025/2026',
    currentTerm: 'Spring Term'
  },
  {
    id: 'gsm-college',
    name: 'Government Science Model College',
    slug: 'gsm-college',
    motto: 'Science & Technology for National Development',
    currency: 'NGN',
    symbol: '₦',
    country: 'Nigeria',
    timezone: 'Africa/Lagos',
    planId: 'pro',
    academicYear: '2025/2026',
    currentTerm: 'Second Term'
  }
]

export const useTenantStore = defineStore('tenant', () => {
  const currentTenant = ref<SchoolTenant>(PRECONFIGURED_TENANTS[0])
  const isResolving = ref(false)
  const tenantError = ref<string | null>(null)
  const availableTenants = ref<SchoolTenant[]>(PRECONFIGURED_TENANTS)

  function setTenant(tenant: SchoolTenant | null) {
    if (tenant) {
      currentTenant.value = tenant
      tenantError.value = null
    }
  }

  function switchTenantBySlug(slug: string) {
    const found = availableTenants.value.find(t => t.slug === slug || t.id === slug)
    if (found) {
      currentTenant.value = found
      tenantError.value = null
      return true
    }
    return false
  }

  function addSchoolTenant(newTenant: SchoolTenant) {
    availableTenants.value.push(newTenant)
    currentTenant.value = newTenant
  }

  function setError(error: string) {
    tenantError.value = error
  }

  return {
    currentTenant,
    availableTenants,
    isResolving,
    tenantError,
    setTenant,
    switchTenantBySlug,
    addSchoolTenant,
    setError
  }
})
