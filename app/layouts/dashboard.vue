<script setup lang="ts">
import { useAuthStore, PERSONA_PROFILES, type PersonaRole } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

const authStore = useAuthStore()
const tenantStore = useTenantStore()
const isSidebarOpen = ref(true)
const isRoleModalOpen = ref(false)
const isTenantModalOpen = ref(false)
const isNotificationsOpen = ref(false)
const searchQuery = ref('')

const notifications = ref([
  { id: 1, title: 'Gate Exeat Clearance', desc: 'Chidi Okonkwo (SS2) departed via Gate 1 with Dr. Kenneth Okonkwo.', time: '5m ago', unread: true },
  { id: 2, title: 'Tuition Payment Confirmed', desc: '₦395,000 received for Adaeze Okonkwo via Paystack.', time: '22m ago', unread: true },
  { id: 3, title: 'CBT Anti-Cheat Flag', desc: 'Tab switch detected on exam session #asm-cbt-01.', time: '1h ago', unread: false }
])

const allRolesList = Object.keys(PERSONA_PROFILES) as PersonaRole[]

function handleSwitchPersona(role: PersonaRole) {
  authStore.switchPersona(role)
  isRoleModalOpen.value = false
  if (role === 'Parent') {
    navigateTo('/parents/dashboard')
  } else {
    navigateTo('/dashboard')
  }
}

function handleSwitchTenant(slug: string) {
  tenantStore.switchTenantBySlug(slug)
  isTenantModalOpen.value = false
}

const navSections = computed(() => [
  {
    title: 'Academics & Pedagogy',
    items: [
      { label: 'Institutional Overview', icon: 'i-heroicons-squares-2x2', to: '/dashboard', perm: 'all' },
      { label: 'Classes & Class Arms', icon: 'i-heroicons-rectangle-group', to: '/dashboard/academics/classes', perm: 'manage_classes' },
      { label: 'AI Lesson Notes', icon: 'i-heroicons-sparkles', to: '/dashboard/academics/lesson-notes', badge: 'AI', perm: 'create_lesson_notes' },
      { label: 'CBT & Assessments', icon: 'i-heroicons-computer-desktop', to: '/dashboard/academics/assessments', perm: 'manage_assessments' },
      { label: 'Gradebook & Broadsheet', icon: 'i-heroicons-chart-bar', to: '/dashboard/academics/gradebook', perm: 'collate_grades' },
      { label: 'Conversational AI Tutor', icon: 'i-heroicons-academic-cap', to: '/dashboard/ai-tutor', badge: 'AI', perm: 'use_ai_tutor' }
    ]
  },
  {
    title: 'Student Operations & SIS',
    items: [
      { label: 'Student Information (SIS)', icon: 'i-heroicons-identification', to: '/dashboard/students', perm: 'manage_students' },
      { label: 'Admissions Pipeline', icon: 'i-heroicons-user-plus', to: '/dashboard/admissions', perm: 'manage_admissions' },
      { label: 'Hostel Accommodations', icon: 'i-heroicons-home-modern', to: '/dashboard/accommodations', perm: 'manage_hostels' },
      { label: 'Campus Gate & Child Safety', icon: 'i-heroicons-shield-check', to: '/dashboard/security', badge: 'SECURE', perm: 'verify_exeat' }
    ]
  },
  {
    title: 'Bursary & Administration',
    items: [
      { label: 'School Wallet & Billing', icon: 'i-heroicons-wallet', to: '/dashboard/finances', perm: 'manage_wallet' },
      { label: 'GoChats Real-Time', icon: 'i-heroicons-chat-bubble-left-right', to: '/dashboard/chat', badge: 'LIVE', perm: 'all' },
      { label: 'Government Inspectorate', icon: 'i-heroicons-building-library', to: '/dashboard/government', perm: 'view_compliance' }
    ]
  },
  {
    title: 'External Portals',
    items: [
      { label: 'Parent Portal Switch', icon: 'i-heroicons-user-group', to: '/parents/dashboard', perm: 'all' },
      { label: 'Past Questions Bank', icon: 'i-heroicons-document-text', to: '/past-questions', perm: 'all' },
      { label: 'Inter-School Olympiads', icon: 'i-heroicons-trophy', to: '/competitions', perm: 'all' }
    ]
  }
])

const filteredNav = computed(() => {
  return navSections.value.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Superadmin / Master and Owner see everything
      if (authStore.currentUser.role === 'master' || authStore.currentUser.role === 'school_owner' || authStore.currentUser.role === 'admin') return true
      return authStore.hasPermission(item.perm) || item.perm === 'all'
    })
  })).filter(section => section.items.length > 0)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
    <!-- Top Enterprise Navigation Bar -->
    <header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6">
      <!-- Left: Logo & School Tenant Selector -->
      <div class="flex items-center gap-3">
        <button
          class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <UIcon name="i-heroicons-bars-3" class="w-5 h-5" />
        </button>

        <NuxtLink to="/dashboard" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            N
          </div>
          <span class="font-bold text-gray-900 text-lg hidden sm:inline tracking-tight">Nwantas</span>
        </NuxtLink>

        <!-- Divider -->
        <span class="text-gray-300 hidden sm:inline">/</span>

        <!-- Active School Tenant Switcher Trigger -->
        <button
          class="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-left"
          @click="isTenantModalOpen = true"
        >
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1.5">
              {{ tenantStore.currentTenant.name }}
              <UIcon name="i-heroicons-chevron-down" class="w-3.5 h-3.5 text-gray-400" />
            </span>
            <span class="text-[10px] text-emerald-600 font-mono">
              {{ tenantStore.currentTenant.slug }}.nwantas.com
            </span>
          </div>
        </button>
      </div>

      <!-- Center: Academic Session & Omni Search -->
      <div class="hidden md:flex items-center gap-4 flex-1 max-w-md mx-6">
        <div class="relative w-full">
          <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search students, lesson notes, classes, receipts... (Ctrl+K)"
            class="w-full pl-9 pr-4 py-1.5 bg-gray-100 hover:bg-gray-100/80 focus:bg-white rounded-lg text-xs border border-transparent focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          >
        </div>
      </div>

      <!-- Right: Role Switcher, Term Indicator, Notifications & User -->
      <div class="flex items-center gap-3">
        <!-- Academic Term Pill -->
        <div class="hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-medium font-mono">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{{ tenantStore.currentTenant.currentTerm }}</span>
        </div>

        <!-- Role / Persona Interactive Switcher Button (Key architecture feature) -->
        <button
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs transition-all cursor-pointer"
          @click="isRoleModalOpen = true"
        >
          <UIcon name="i-heroicons-user-circle" class="w-4 h-4 text-emerald-700" />
          <span class="hidden sm:inline">Role:</span>
          <span class="font-bold underline">{{ authStore.currentUser.roleTitle.split('/')[0] }}</span>
          <UIcon name="i-heroicons-arrows-right-left" class="w-3.5 h-3.5 text-emerald-600" />
        </button>

        <!-- Notifications Bell -->
        <div class="relative">
          <button
            class="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 relative"
            @click="isNotificationsOpen = !isNotificationsOpen"
          >
            <UIcon name="i-heroicons-bell" class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <!-- Notifications Dropdown -->
          <div
            v-if="isNotificationsOpen"
            class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 text-left"
          >
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
              <span class="text-xs font-bold text-gray-900 font-mono">CAMPUS TELEMETRY ALERTS</span>
              <span class="text-[10px] text-emerald-600 font-semibold cursor-pointer">Mark read</span>
            </div>
            <div class="space-y-2">
              <div
                v-for="n in notifications"
                :key="n.id"
                class="p-2 rounded-lg hover:bg-gray-50 text-xs transition-colors"
              >
                <div class="font-semibold text-gray-800 flex items-center justify-between">
                  <span>{{ n.title }}</span>
                  <span class="text-[10px] text-gray-400 font-mono">{{ n.time }}</span>
                </div>
                <div class="text-gray-600 mt-0.5 leading-snug">{{ n.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile Avatar & Menu -->
        <div class="flex items-center gap-2 pl-2 border-l border-gray-200">
          <img
            :src="authStore.currentUser.avatar"
            :alt="authStore.currentUser.name"
            class="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
          >
          <div class="hidden lg:flex flex-col text-left">
            <span class="text-xs font-bold text-gray-900 leading-tight">{{ authStore.currentUser.name }}</span>
            <span class="text-[10px] text-gray-500">{{ authStore.currentUser.role }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Workspace with Sidebar -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar Navigation -->
      <aside
        :class="[
          'w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-200 z-30',
          isSidebarOpen ? 'block' : 'hidden lg:block'
        ]"
      >
        <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          <div v-for="section in filteredNav" :key="section.title">
            <h4 class="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              {{ section.title }}
            </h4>
            <div class="space-y-1">
              <NuxtLink
                v-for="item in section.items"
                :key="item.label"
                :to="item.to"
                class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-emerald-50/70 hover:text-emerald-800 transition-colors group"
                active-class="bg-emerald-600 text-white shadow-sm hover:bg-emerald-600 hover:text-white"
              >
                <div class="flex items-center gap-2.5">
                  <UIcon :name="item.icon" class="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-[.router-link-active]:text-white" />
                  <span>{{ item.label }}</span>
                </div>
                <span
                  v-if="item.badge"
                  :class="[
                    'text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded',
                    item.badge === 'AI' ? 'bg-purple-100 text-purple-800' :
                    item.badge === 'LIVE' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  ]"
                >
                  {{ item.badge }}
                </span>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div class="flex flex-col">
            <span class="font-mono text-[10px] uppercase text-gray-400">PLAN TIER</span>
            <span class="font-bold text-gray-800 uppercase">{{ tenantStore.currentTenant.planId.replace('_', ' ') }}</span>
          </div>
          <NuxtLink to="/auth/login" class="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1">
            <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-4 h-4" />
            <span>Sign out</span>
          </NuxtLink>
        </div>
      </aside>

      <!-- Main Slot Area -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- Modal: Switch Role / Persona (Interactive Testing Modal) -->
    <div
      v-if="isRoleModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isRoleModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Switch User Persona & RBAC Context</h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Experience Nwantas from the lens of any of the 11 reverse-engineered institutional personas.
            </p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isRoleModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            v-for="roleKey in allRolesList"
            :key="roleKey"
            :class="[
              'p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer',
              authStore.currentUser.role === roleKey ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
            @click="handleSwitchPersona(roleKey)"
          >
            <img
              :src="PERSONA_PROFILES[roleKey].avatar"
              :alt="PERSONA_PROFILES[roleKey].name"
              class="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-gray-200"
            >
            <div>
              <div class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                {{ PERSONA_PROFILES[roleKey].name }}
                <span
                  v-if="authStore.currentUser.role === roleKey"
                  class="w-1.5 h-1.5 rounded-full bg-emerald-600"
                />
              </div>
              <div class="text-[11px] font-medium text-emerald-700 font-mono mt-0.5">
                {{ PERSONA_PROFILES[roleKey].roleTitle }}
              </div>
              <div class="text-[10px] text-gray-500 mt-1 line-clamp-1">
                Permissions: {{ PERSONA_PROFILES[roleKey].permissions.slice(0, 3).join(', ') }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Switch School Tenant -->
    <div
      v-if="isTenantModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isTenantModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Switch Institutional Tenant</h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Simulates visiting different school subdomains (*.nwantas.com or *.localhost).
            </p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isTenantModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3">
          <button
            v-for="tenant in tenantStore.availableTenants"
            :key="tenant.id"
            :class="[
              'w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer',
              tenantStore.currentTenant.id === tenant.id ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
            @click="handleSwitchTenant(tenant.slug)"
          >
            <div>
              <div class="text-sm font-bold text-gray-900">{{ tenant.name }}</div>
              <div class="text-xs text-emerald-700 font-mono mt-0.5">{{ tenant.slug }}.nwantas.com</div>
              <div class="text-[11px] text-gray-500 mt-1">{{ tenant.country }} • Currency: {{ tenant.currency }} ({{ tenant.symbol }})</div>
            </div>
            <UIcon
              v-if="tenantStore.currentTenant.id === tenant.id"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
