import { defineStore } from 'pinia'

export interface SchoolTenant {
  id: string
  name: string
  slug: string
  logoUrl?: string
  currency: string
  planId?: string
}

export const useTenantStore = defineStore('tenant', () => {
  const currentTenant = ref<SchoolTenant | null>(null)
  const isResolving = ref(false)
  const tenantError = ref<string | null>(null)

  function setTenant(tenant: SchoolTenant | null) {
    currentTenant.value = tenant
    tenantError.value = null
  }

  function setError(error: string) {
    tenantError.value = error
    currentTenant.value = null
  }

  return {
    currentTenant,
    isResolving,
    tenantError,
    setTenant,
    setError
  }
})
