<script setup lang="ts">
import { useAuthStore, PERSONA_PROFILES } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'parent'
})

useHead({
  title: 'Parent Portal | Nwantas'
})

const authStore = useAuthStore()
const tenantStore = useTenantStore()

const activeChild = computed(() => {
  if (authStore.currentUser.role === 'Parent' && authStore.currentUser.meta?.children) {
    return authStore.activeChild || authStore.currentUser.meta.children[0]
  }
  return PERSONA_PROFILES.Parent.meta?.children?.[authStore.activeChildIndex] || PERSONA_PROFILES.Parent.meta?.children?.[0]
})
const isCheckoutSuccess = ref(false)

function handlePayFees() {
  isCheckoutSuccess.value = true
  if (activeChild.value) {
    activeChild.value.feeStatus = 'Paid in Full'
  }
}
</script>

<template>
  <div v-if="activeChild" class="space-y-6">
    <!-- Active Child Hero Card -->
    <div class="bg-gradient-to-r from-emerald-800 to-green-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <img
          :src="activeChild.avatar"
          :alt="activeChild.name"
          class="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
        >
        <div>
          <div class="text-xs font-mono text-emerald-200">ACTIVE WARD PROFILE</div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white">{{ activeChild.name }}</h1>
          <div class="text-xs text-emerald-100 font-mono mt-0.5">
            {{ activeChild.classArm }} • Admission No: {{ activeChild.admissionNo }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 bg-emerald-900/60 p-4 rounded-2xl border border-white/10 text-center">
        <div>
          <div class="text-[10px] font-mono text-emerald-200 uppercase">TERM ATTENDANCE</div>
          <div class="text-2xl font-black text-emerald-300">{{ activeChild.attendanceRate }}</div>
        </div>
        <div class="w-px h-8 bg-emerald-700" />
        <div>
          <div class="text-[10px] font-mono text-emerald-200 uppercase">BURSARY STATUS</div>
          <div class="text-sm font-bold text-white mt-1">{{ activeChild.feeStatus }}</div>
        </div>
      </div>
    </div>

    <!-- Quick Action Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Official Term Report Card -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <UIcon name="i-heroicons-document-text" class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1">Terminal Report Card</h3>
          <p class="text-xs text-gray-500 leading-relaxed mb-4">
            View term aggregate scores, subject teacher remarks, class position, and principal signoff.
          </p>
        </div>

        <NuxtLink
          to="/dashboard/academics/gradebook"
          class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs transition-all"
        >
          <span>Open Academic Broadsheet &rarr;</span>
        </NuxtLink>
      </div>

      <!-- Card 2: Tuition Fee Checkout -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <UIcon name="i-heroicons-credit-card" class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1">Tuition & Levies</h3>
          <p class="text-xs text-gray-500 leading-relaxed mb-4">
            Status: <span class="font-bold text-gray-800">{{ activeChild.feeStatus }}</span>. Pay securely with debit card or instant bank transfer.
          </p>
        </div>

        <button
          v-if="activeChild.feeStatus !== 'Paid in Full'"
          class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all"
          @click="handlePayFees"
        >
          <span>Pay Pending Fees Online</span>
        </button>
        <div v-else class="py-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-center font-mono font-bold text-xs">
          ✓ Fees Cleared for Term
        </div>
      </div>

      <!-- Card 3: Direct Form Teacher Messenger -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-1">Teacher Office Hours & Chat</h3>
          <p class="text-xs text-gray-500 leading-relaxed mb-4">
            Directly communicate with {{ activeChild.name }}'s form tutor and subject teachers via GoChats.
          </p>
        </div>

        <NuxtLink
          to="/dashboard/chat"
          class="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all"
        >
          <span>Open GoChats Messenger &rarr;</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
