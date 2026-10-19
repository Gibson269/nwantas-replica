<script setup lang="ts">
const isOpen = ref(false)
const isScrolled = ref(false)

const productFeatures = [
  { name: 'Student Records', desc: 'Profiles, attendance, and progress', icon: 'i-heroicons-user-group', to: '/#features' },
  { name: 'Exam Management', desc: 'CBT, paper exams, and auto-grading', icon: 'i-heroicons-clipboard-document-check', to: '/#features' },
  { name: 'Fee & Payroll', desc: 'Collection, payroll, and ledger', icon: 'i-heroicons-banknotes', to: '/#features' },
  { name: 'AI Learning', desc: 'Personalised tutor for every student', icon: 'i-heroicons-sparkles', to: '/#features' },
  { name: 'Admissions', desc: 'Browse schools open for applications', icon: 'i-heroicons-user-plus', to: '/admissions' },
  { name: 'Past Questions', desc: 'Practice papers for exams students sit', icon: 'i-heroicons-document-text', to: '/past-questions' },
  { name: 'Competitions', desc: 'Inter-school contests and leaderboards', icon: 'i-heroicons-trophy', to: '/competitions' }
]

onMounted(() => {
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 20
  })
})
</script>

<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <span class="font-bold text-xl tracking-tight">N</span>
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-xl tracking-tight text-gray-900 leading-none">Nwantas</span>
            <span class="text-[10px] uppercase font-mono tracking-wider text-emerald-600 font-semibold mt-0.5">School Management</span>
          </div>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <!-- Features Dropdown -->
          <div class="relative group">
            <button class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-2">
              Features
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            <div class="absolute top-full left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0">
              <NuxtLink
                v-for="item in productFeatures"
                :key="item.name"
                :to="item.to"
                class="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors group/item"
              >
                <div class="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                  <UIcon :name="item.icon" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-sm font-semibold text-gray-900 group-hover/item:text-emerald-700">{{ item.name }}</div>
                  <div class="text-xs text-gray-500 leading-tight">{{ item.desc }}</div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <NuxtLink to="/#pricing" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </NuxtLink>
          <NuxtLink to="/past-questions" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Past Questions
          </NuxtLink>
          <NuxtLink to="/competitions" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Competitions
          </NuxtLink>
          <NuxtLink to="/#faq" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            FAQ
          </NuxtLink>
        </nav>

        <!-- Right Action CTAs -->
        <div class="hidden md:flex items-center gap-4">
          <NuxtLink
            to="/auth/login"
            class="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors"
          >
            Sign in
          </NuxtLink>
          <NuxtLink
            to="/register-school"
            class="inline-flex items-center justify-center text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            Register school
          </NuxtLink>
        </div>

        <!-- Mobile menu toggle -->
        <button
          class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          @click="isOpen = !isOpen"
        >
          <UIcon :name="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'" class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div v-if="isOpen" class="md:hidden bg-white border-b border-gray-100 px-6 py-6 space-y-4 shadow-xl">
      <div class="space-y-2">
        <NuxtLink
          v-for="item in productFeatures"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600"
          @click="isOpen = false"
        >
          <UIcon :name="item.icon" class="w-4 h-4 text-emerald-600" />
          {{ item.name }}
        </NuxtLink>
      </div>
      <div class="pt-4 border-t border-gray-100 flex flex-col gap-3">
        <NuxtLink
          to="/auth/login"
          class="w-full text-center py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl"
          @click="isOpen = false"
        >
          Sign in
        </NuxtLink>
        <NuxtLink
          to="/register-school"
          class="w-full text-center py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl shadow-md"
          @click="isOpen = false"
        >
          Register school
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
