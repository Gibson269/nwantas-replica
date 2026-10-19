<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useTenantStore } from '~/stores/tenant'

const authStore = useAuthStore()
const tenantStore = useTenantStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-emerald-500 selection:text-white">
    <!-- Top Global Notification Banner -->
    <div class="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-mono font-bold tracking-wide">
        v4.2 Architecture
      </span>
      <span>Enterprise School Management OS with AI Lesson Notes, Anti-Cheat CBT & Multi-Wallet Financials</span>
      <NuxtLink to="/dashboard" class="underline font-bold hover:text-emerald-100 ml-2">
        Launch Live Dashboard &rarr;
      </NuxtLink>
    </div>

    <!-- Header Navigation -->
    <LandingHeader />

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Platform Footer -->
    <footer class="bg-gray-950 text-gray-400 pt-16 pb-12 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <!-- Col 1: Brand & Identity -->
          <div class="col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                N
              </div>
              <span class="text-xl font-bold text-white tracking-tight">Nwantas</span>
            </div>
            <p class="text-sm text-gray-400 max-w-sm leading-relaxed mb-6">
              Complete Educational Operating System architected for primary, secondary, and all-through institutions across Nigeria, the UK, and international regulatory boards.
            </p>
            <div class="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Gateway • 802 API Operations Verified</span>
            </div>
          </div>

          <!-- Col 2: Academics & Pedagogy -->
          <div>
            <h4 class="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">Academic OS</h4>
            <ul class="space-y-2.5 text-sm">
              <li><NuxtLink to="/dashboard" class="hover:text-emerald-400 transition-colors">Class Arms & SIS</NuxtLink></li>
              <li><NuxtLink to="/dashboard/academics/lesson-notes" class="hover:text-emerald-400 transition-colors">AI Lesson Notes</NuxtLink></li>
              <li><NuxtLink to="/dashboard/academics/assessments" class="hover:text-emerald-400 transition-colors">Anti-Cheat CBT Exams</NuxtLink></li>
              <li><NuxtLink to="/dashboard/academics/gradebook" class="hover:text-emerald-400 transition-colors">Broadsheet & Reports</NuxtLink></li>
              <li><NuxtLink to="/dashboard/ai-tutor" class="hover:text-emerald-400 transition-colors">Conversational AI Tutor</NuxtLink></li>
            </ul>
          </div>

          <!-- Col 3: Operations & Bursary -->
          <div>
            <h4 class="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">Operations & Finance</h4>
            <ul class="space-y-2.5 text-sm">
              <li><NuxtLink to="/dashboard/finances" class="hover:text-emerald-400 transition-colors">School Wallet & Ledger</NuxtLink></li>
              <li><NuxtLink to="/dashboard/finances" class="hover:text-emerald-400 transition-colors">Staff Payroll Engine</NuxtLink></li>
              <li><NuxtLink to="/dashboard/security" class="hover:text-emerald-400 transition-colors">Campus Gate Security</NuxtLink></li>
              <li><NuxtLink to="/dashboard/accommodations" class="hover:text-emerald-400 transition-colors">Hostel Bed Allocations</NuxtLink></li>
              <li><NuxtLink to="/dashboard/chat" class="hover:text-emerald-400 transition-colors">GoChats Real-Time</NuxtLink></li>
            </ul>
          </div>

          <!-- Col 4: Public Portals & Compliance -->
          <div>
            <h4 class="text-xs font-mono uppercase tracking-wider text-white font-bold mb-4">Portals & Oversight</h4>
            <ul class="space-y-2.5 text-sm">
              <li><NuxtLink to="/admissions" class="hover:text-emerald-400 transition-colors">Admissions Portal</NuxtLink></li>
              <li><NuxtLink to="/past-questions" class="hover:text-emerald-400 transition-colors">Past Questions Bank</NuxtLink></li>
              <li><NuxtLink to="/competitions" class="hover:text-emerald-400 transition-colors">Inter-School Olympiads</NuxtLink></li>
              <li><NuxtLink to="/parents/dashboard" class="hover:text-emerald-400 transition-colors">Dedicated Parent Portal</NuxtLink></li>
              <li><NuxtLink to="/dashboard/government" class="hover:text-emerald-400 transition-colors">Ministry Inspectorate</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {{ new Date().getFullYear() }} Nwantas Technologies Limited. All rights reserved.
          </div>
          <div class="flex items-center gap-6">
            <span class="hover:text-gray-400 cursor-pointer">NERDC Curriculum Compliant</span>
            <span class="hover:text-gray-400 cursor-pointer">Cambridge International Registered</span>
            <span class="hover:text-gray-400 cursor-pointer">NDPR / GDPR Certified</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
