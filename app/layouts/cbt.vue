<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

const authStore = useAuthStore()
const tenantStore = useTenantStore()
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col antialiased select-none selection:bg-emerald-500">
    <!-- CBT Header Bar -->
    <header class="h-16 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          N
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-sm text-white">Nwantas CBT Secure Proctoring Mode</span>
          <span class="text-[10px] text-gray-400 font-mono">{{ tenantStore.currentTenant.name }}</span>
        </div>
      </div>

      <!-- Telemetry Status Indicator -->
      <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Anti-Cheat Telemetry: ACTIVE</span>
      </div>

      <!-- Candidate Badge -->
      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-xs font-bold text-white">{{ authStore.currentUser.name }}</div>
          <div class="text-[10px] font-mono text-gray-400">Candidate ID: APX-2023-084</div>
        </div>
        <img
          :src="authStore.currentUser.avatar"
          :alt="authStore.currentUser.name"
          class="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40"
        >
      </div>
    </header>

    <!-- Main CBT Arena -->
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
