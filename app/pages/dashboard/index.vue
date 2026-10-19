<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Institutional Dashboard'
})

const authStore = useAuthStore()
const tenantStore = useTenantStore()

const currentRole = computed(() => authStore.currentUser.role)
const roleTitle = computed(() => authStore.currentUser.roleTitle)

const recentMovements = [
  { student: 'Chidi Okonkwo (SS 2 Science)', type: 'Exeat Gate Pass', time: '10:42 AM', status: 'Approved', badge: 'bg-emerald-100 text-emerald-800' },
  { student: 'Amina Bello (SS 2 Science)', type: 'Authorized Guardian Pickup', time: '10:35 AM', status: 'Verified', badge: 'bg-blue-100 text-blue-800' },
  { student: 'David Adeleke Jr. (JSS 2)', type: 'Clinic Exeat', time: '10:15 AM', status: 'Active', badge: 'bg-amber-100 text-amber-800' },
  { student: 'Fatima Sanusi (JSS 1)', type: 'Daily Gate Entry', time: '07:48 AM', status: 'Checked In', badge: 'bg-gray-100 text-gray-800' }
]

const recentAIPlans = [
  { topic: 'Quantum Duality & Photoelectric Effect', subject: 'Physics', author: 'Mr. David Adeleke', status: 'Principal Approved' },
  { topic: 'Stoichiometry & Titration Analysis', subject: 'Chemistry', author: 'Mrs. Folake Adeyemi', status: 'HOD Approved' },
  { topic: 'Calculus: Integration by Parts', subject: 'Further Mathematics', author: 'Dr. Chukwuemeka Eze', status: 'Ready for Review' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Banner with Dynamic Persona Context -->
    <div class="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-mono mb-4 border border-white/10">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Persona: {{ roleTitle }}</span>
        </div>
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
          Welcome back, {{ authStore.currentUser.name }}
        </h1>
        <p class="text-sm sm:text-base text-emerald-100 leading-relaxed">
          {{ tenantStore.currentTenant.name }} is operating synchronously across 20 institutional domains. All campus gates, academic broadsheets, and multi-wallet transactions are in live state.
        </p>

        <!-- Quick Action Launchpads -->
        <div class="flex flex-wrap items-center gap-3 mt-6">
          <NuxtLink
            to="/dashboard/academics/lesson-notes"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-emerald-900 font-semibold text-xs shadow-md hover:bg-emerald-50 transition-all"
          >
            <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-emerald-600" />
            <span>AI Lesson Planner</span>
          </NuxtLink>
          <NuxtLink
            to="/dashboard/academics/assessments"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/60 text-white font-semibold text-xs border border-white/20 hover:bg-emerald-900 transition-all"
          >
            <UIcon name="i-heroicons-computer-desktop" class="w-4 h-4 text-emerald-300" />
            <span>CBT Exams & Anti-Cheat</span>
          </NuxtLink>
          <NuxtLink
            to="/dashboard/finances"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/60 text-white font-semibold text-xs border border-white/20 hover:bg-emerald-900 transition-all"
          >
            <UIcon name="i-heroicons-wallet" class="w-4 h-4 text-emerald-300" />
            <span>Bursary & Wallet</span>
          </NuxtLink>
          <NuxtLink
            to="/dashboard/security"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900/60 text-white font-semibold text-xs border border-white/20 hover:bg-emerald-900 transition-all"
          >
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-emerald-300" />
            <span>Gate Exeat Passes</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Institutional KPI Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono uppercase text-gray-500">TOTAL ENROLLED</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-extrabold text-gray-900">1,420</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-trending-up" class="w-3.5 h-3.5" />
          <span>+12% vs last academic year</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono uppercase text-gray-500">FEES RECONCILED</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-extrabold text-gray-900">₦48.6M</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
          <span>94.2% collection rate</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono uppercase text-gray-500">TODAY'S ATTENDANCE</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UIcon name="i-heroicons-clipboard-document-check" class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-extrabold text-gray-900">99.1%</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
          <span>1,407 students present</span>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-mono uppercase text-gray-500">GOVERNMENT AUDIT</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UIcon name="i-heroicons-building-library" class="w-4 h-4" />
          </div>
        </div>
        <div class="text-2xl font-extrabold text-gray-900">Grade A1</div>
        <div class="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
          <UIcon name="i-heroicons-star" class="w-3.5 h-3.5" />
          <span>Exemplary compliance status</span>
        </div>
      </div>
    </div>

    <!-- Two-Column Operational Views -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Campus Gate Movements & Security -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-base font-bold text-gray-900">Real-Time Campus Gate Movements</h3>
            <p class="text-xs text-gray-500">Live student exeat passes and verified guardian pickups</p>
          </div>
          <NuxtLink to="/dashboard/security" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            View All Security &rarr;
          </NuxtLink>
        </div>

        <div class="space-y-3">
          <div
            v-for="movement in recentMovements"
            :key="movement.student"
            class="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
                <UIcon name="i-heroicons-user" class="w-4 h-4" />
              </div>
              <div>
                <div class="text-xs font-bold text-gray-900">{{ movement.student }}</div>
                <div class="text-[11px] text-gray-500">{{ movement.type }} • {{ movement.time }}</div>
              </div>
            </div>
            <span :class="['text-[10px] font-semibold px-2 py-1 rounded-full font-mono', movement.badge]">
              {{ movement.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right Column: AI Lesson Planning & Pedagogy -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-base font-bold text-gray-900">AI Lesson Notes & Collaborative Approvals</h3>
            <p class="text-xs text-gray-500">Recent pedagogical notes generated and endorsed by faculty</p>
          </div>
          <NuxtLink to="/dashboard/academics/lesson-notes" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
            Lesson Studio &rarr;
          </NuxtLink>
        </div>

        <div class="space-y-3">
          <div
            v-for="plan in recentAIPlans"
            :key="plan.topic"
            class="p-3.5 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wide">{{ plan.subject }}</span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                {{ plan.status }}
              </span>
            </div>
            <div class="text-sm font-bold text-gray-900 mb-1">{{ plan.topic }}</div>
            <div class="text-xs text-gray-500 flex items-center gap-1.5">
              <UIcon name="i-heroicons-user-circle" class="w-3.5 h-3.5" />
              <span>Authored by {{ plan.author }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
