<script setup lang="ts">
import { useAuthStore, PERSONA_PROFILES, type PersonaRole } from '~/stores/auth'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Sign In to Your Institutional Portal | Nwantas'
})

const authStore = useAuthStore()

const selectedRole = ref<PersonaRole>('admin')
const email = ref('admin@apexacademy.edu.ng')
const password = ref('••••••••••••')
const isLoading = ref(false)

const primaryRoles: { id: PersonaRole; label: string; icon: string }[] = [
  { id: 'admin', label: 'Admin / Principal', icon: 'i-heroicons-building-office-2' },
  { id: 'school_owner', label: 'Proprietor', icon: 'i-heroicons-banknotes' },
  { id: 'Teacher', label: 'Teacher', icon: 'i-heroicons-academic-cap' },
  { id: 'Student', label: 'Student', icon: 'i-heroicons-identification' },
  { id: 'Parent', label: 'Parent', icon: 'i-heroicons-user-group' },
  { id: 'SecurityOfficer', label: 'Security Guard', icon: 'i-heroicons-shield-check' },
  { id: 'HostelWarden', label: 'Hostel Warden', icon: 'i-heroicons-home-modern' },
  { id: 'federal_staff', label: 'Gov Inspector', icon: 'i-heroicons-building-library' }
]

function selectQuickRole(role: PersonaRole) {
  selectedRole.value = role
  const profile = PERSONA_PROFILES[role]
  email.value = profile.email
}

function handleLogin() {
  isLoading.value = true
  setTimeout(() => {
    authStore.switchPersona(selectedRole.value)
    isLoading.value = false
    if (selectedRole.value === 'Parent') {
      navigateTo('/parents/dashboard')
    } else {
      navigateTo('/dashboard')
    }
  }, 400)
}
</script>

<template>
  <div class="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
        <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-emerald-600" />
        <span>Enterprise Subdomain & Multi-Tenant Authentication</span>
      </div>
      <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">
        Sign in to your portal
      </h1>
      <p class="mt-2 text-xs text-gray-500">
        Click any institutional persona below to test its role-based permissions immediately.
      </p>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-lg">
      <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-100 space-y-6">
        <!-- Quick 1-Click Role Switcher Grid -->
        <div>
          <label class="block text-[10px] font-mono font-bold uppercase text-gray-400 mb-2">Select Persona for Instant Access:</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="r in primaryRoles"
              :key="r.id"
              type="button"
              :class="[
                'p-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center',
                selectedRole === r.id
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              ]"
              @click="selectQuickRole(r.id)"
            >
              <UIcon :name="r.icon" class="w-4 h-4" />
              <span class="text-[11px] leading-tight">{{ r.label }}</span>
            </button>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">Institutional Email</label>
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-gray-700 uppercase font-mono">Password</label>
              <span class="text-xs text-emerald-600 hover:underline cursor-pointer">Self-service reset</span>
            </div>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <UIcon v-if="isLoading" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ isLoading ? 'Authenticating Persona...' : `Authenticate as ${PERSONA_PROFILES[selectedRole].roleTitle}` }}</span>
          </button>
        </form>

        <div class="pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
          Want to register a brand new school?
          <NuxtLink to="/register-school" class="text-emerald-600 font-bold hover:underline ml-1">
            Register institution &rarr;
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
