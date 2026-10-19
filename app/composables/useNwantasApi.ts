import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

export function useNwantasApi() {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  async function fetchApi<T = any>(endpoint: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantStore.currentTenant?.id || 'apex-academy',
      'Authorization': `Bearer ${authStore.token}`,
      ...(options.headers || {})
    }

    return (await $fetch(endpoint, {
      ...options,
      headers
    })) as T
  }

  return {
    fetchApi
  }
}
