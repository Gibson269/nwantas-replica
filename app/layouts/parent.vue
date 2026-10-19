<script setup lang="ts">
import { useAuthStore, PERSONA_PROFILES } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

const authStore = useAuthStore()
const tenantStore = useTenantStore()

const parentUser = computed(() => {
  return authStore.currentUser.role === 'Parent' ? authStore.currentUser : PERSONA_PROFILES.Parent
})
const children = computed(() => {
  if (authStore.currentUser.role === 'Parent' && authStore.currentUser.meta?.children) {
    return authStore.currentUser.meta.children
  }
  return PERSONA_PROFILES.Parent.meta?.children || []
})
const activeIndex = computed(() => authStore.activeChildIndex)

function selectChild(idx: number) {
  authStore.selectChild(idx)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
    <!-- Parent Portal Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="h-16 flex items-center justify-between">
          <!-- Logo & Title -->
          <div class="flex items-center gap-3">
            <NuxtLink to="/parents/dashboard" class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                N
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-gray-900 text-sm leading-tight">Nwantas Parent Portal</span>
                <span class="text-[10px] text-gray-500 font-mono">{{ tenantStore.currentTenant.name }}</span>
              </div>
            </NuxtLink>
          </div>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-gray-600">
            <NuxtLink to="/parents/dashboard" class="text-emerald-700 font-bold" active-class="text-emerald-700">
              Overview
            </NuxtLink>
            <NuxtLink to="/dashboard/chat" class="hover:text-gray-900 transition-colors">
              Teacher Messages (GoChats)
            </NuxtLink>
            <NuxtLink to="/dashboard" class="hover:text-gray-900 transition-colors">
              School Main OS &rarr;
            </NuxtLink>
          </nav>

          <!-- Parent Profile -->
          <div class="flex items-center gap-3">
            <img
              :src="parentUser.avatar"
              :alt="parentUser.name"
              class="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
            >
            <div class="hidden sm:flex flex-col text-left">
              <span class="text-xs font-bold text-gray-900 leading-tight">{{ parentUser.name }}</span>
              <span class="text-[10px] text-emerald-600 font-mono">Parent Account</span>
            </div>
          </div>
        </div>

        <!-- Multi-Child Switcher Tabs (Module 14 reverse engineered feature) -->
        <div class="py-3 border-t border-gray-100 flex items-center gap-3 overflow-x-auto">
          <span class="text-xs font-mono font-bold uppercase text-gray-400 shrink-0">SELECT WARD:</span>
          <button
            v-for="(child, idx) in children"
            :key="child.id"
            :class="[
              'inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer',
              activeIndex === idx
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="selectChild(Number(idx))"
          >
            <img :src="child.avatar" :alt="child.name" class="w-5 h-5 rounded-full object-cover">
            <span>{{ child.name }}</span>
            <span
              :class="[
                'text-[10px] px-1.5 py-0.2 rounded font-mono',
                activeIndex === idx ? 'bg-emerald-700 text-emerald-100' : 'bg-gray-200 text-gray-600'
              ]"
            >
              {{ child.classArm }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Parent Footer -->
    <footer class="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {{ tenantStore.currentTenant.name }} Parent Gateway • Powered by Nwantas Educational Operating System
      </div>
    </footer>
  </div>
</template>
