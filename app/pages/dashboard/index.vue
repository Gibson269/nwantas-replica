<script setup lang="ts">
useHead({
  title: 'Institutional Dashboard | Nwantas'
})

const activeTab = ref('overview')

const navSections = [
  {
    title: 'Academics & Pedagogy',
    items: [
      { label: 'Classes & Arms', icon: 'i-heroicons-rectangle-group', to: '/dashboard' },
      { label: 'School Subjects', icon: 'i-heroicons-book-open', to: '/dashboard' },
      { label: 'Syllabi & Curriculum', icon: 'i-heroicons-queue-list', to: '/dashboard' },
      { label: 'AI Lesson Notes', icon: 'i-heroicons-document-text', to: '/dashboard', badge: 'AI' },
      { label: 'CBT & Assessments', icon: 'i-heroicons-computer-desktop', to: '/dashboard' },
      { label: 'Gradebook & Broadsheet', icon: 'i-heroicons-chart-bar', to: '/dashboard' }
    ]
  },
  {
    title: 'Student Operations',
    items: [
      { label: 'All Students (SIS)', icon: 'i-heroicons-identification', to: '/dashboard' },
      { label: 'Admissions Pipeline', icon: 'i-heroicons-user-plus', to: '/dashboard' },
      { label: 'Parents Directory', icon: 'i-heroicons-user-group', to: '/dashboard' },
      { label: 'Hostels & Accommodations', icon: 'i-heroicons-home', to: '/dashboard' },
      { label: 'Gate Security & Exeat', icon: 'i-heroicons-shield-check', to: '/dashboard' },
      { label: 'Student Council Polls', icon: 'i-heroicons-check-circle', to: '/dashboard' }
    ]
  },
  {
    title: 'Bursary & Administration',
    items: [
      { label: 'School Wallet & Ledger', icon: 'i-heroicons-wallet', to: '/dashboard' },
      { label: 'Tuition & Fee Schedules', icon: 'i-heroicons-banknotes', to: '/dashboard' },
      { label: 'Staff Payroll Runs', icon: 'i-heroicons-currency-dollar', to: '/dashboard' },
      { label: 'Teaching & Admin Staff', icon: 'i-heroicons-users', to: '/dashboard' },
      { label: 'GoChats Real-Time', icon: 'i-heroicons-chat-bubble-left-right', to: '/dashboard' },
      { label: 'Government Oversight', icon: 'i-heroicons-building-library', to: '/dashboard' }
    ]
  }
]

const recentMovements = [
  { student: 'Chidi Okonkwo (JSS2 A)', type: 'Exeat Gate Pass', time: '10:42 AM', status: 'Approved' },
  { student: 'Amina Bello (SS3 Science)', type: 'Authorized Guardian Pickup', time: '10:35 AM', status: 'Verified' },
  { student: 'David Adeleke (Grade 5)', type: 'Clinic Exeat', time: '10:15 AM', status: 'Active' },
  { student: 'Fatima Sanusi (JSS1 B)', type: 'Daily Gate Entry', time: '07:48 AM', status: 'Checked In' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Collapsible Modern Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col shrink-0">
      <!-- Sidebar Brand Header -->
      <div class="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
        <div class="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
          N
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-gray-900 text-sm leading-tight">Apex Academy</span>
          <span class="text-[10px] text-emerald-600 font-mono font-semibold">apex-academy.nwantas.com</span>
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        <div v-for="section in navSections" :key="section.title">
          <h4 class="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
            {{ section.title }}
          </h4>
          <div class="space-y-1">
            <NuxtLink
              v-for="item in section.items"
              :key="item.label"
              :to="item.to"
              class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <div class="flex items-center gap-2.5">
                <UIcon :name="item.icon" class="w-4 h-4 text-gray-500" />
                <span>{{ item.label }}</span>
              </div>
              <span
                v-if="item.badge"
                class="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- User footer profile -->
      <div class="p-4 border-t border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
            GE
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-gray-900 leading-tight">Gibson Effiong</span>
            <span class="text-[10px] text-gray-500">School Administrator</span>
          </div>
        </div>
        <NuxtLink to="/" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
        </NuxtLink>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
      <!-- Top App Bar -->
      <header class="h-16 bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 text-xs font-mono font-semibold text-gray-700 border border-gray-200">
            <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-emerald-600" />
            <span>2026/2027 Academic Session • 1st Term</span>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Notification Bell -->
          <button class="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
            <UIcon name="i-heroicons-bell" class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>
          <!-- Quick School Switcher -->
          <NuxtLink
            to="/register-school"
            class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
          >
            <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
            <span>New Institution</span>
          </NuxtLink>
        </div>
      </header>

      <!-- Dashboard Body -->
      <div class="p-6 sm:p-8 space-y-8 max-w-7xl">
        <!-- Welcome Banner -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back, Administrator
            </h1>
            <p class="text-sm text-gray-300 max-w-xl">
              All 1,420 students, 64 staff, and 28 class arms are synchronized. Term examinations CBT portal is active.
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <NuxtLink
              to="/"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <UIcon name="i-heroicons-globe-alt" class="w-4 h-4" />
              <span>Visit Public Site</span>
            </NuxtLink>
          </div>
        </div>

        <!-- 4 Key Institutional KPIs -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
            <div class="flex items-center justify-between text-gray-500 mb-3">
              <span class="text-xs font-mono font-semibold uppercase">Total Students</span>
              <UIcon name="i-heroicons-identification" class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="text-3xl font-extrabold text-gray-900 tracking-tight">1,420</div>
            <div class="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-3.5 h-3.5" />
              <span>100% active roster</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
            <div class="flex items-center justify-between text-gray-500 mb-3">
              <span class="text-xs font-mono font-semibold uppercase">Fee Collection</span>
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="text-3xl font-extrabold text-gray-900 tracking-tight">₦28.4M</div>
            <div class="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
              <span>94.2% collected</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
            <div class="flex items-center justify-between text-gray-500 mb-3">
              <span class="text-xs font-mono font-semibold uppercase">Daily Attendance</span>
              <UIcon name="i-heroicons-calendar-days" class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="text-3xl font-extrabold text-gray-900 tracking-tight">99.1%</div>
            <div class="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
              <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
              <span>1,407 present today</span>
            </div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
            <div class="flex items-center justify-between text-gray-500 mb-3">
              <span class="text-xs font-mono font-semibold uppercase">School Wallet</span>
              <UIcon name="i-heroicons-wallet" class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="text-3xl font-extrabold text-gray-900 tracking-tight">₦9.85M</div>
            <div class="text-xs text-gray-500 font-semibold mt-2 flex items-center gap-1">
              <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 text-gray-400" />
              <span>Disbursements ready</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Security Movements -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Quick Action Buttons -->
          <div class="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 class="text-base font-bold text-gray-900">Quick Administrative Actions</h3>
            <div class="space-y-2.5">
              <button class="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-900">Generate AI Lesson Plan</div>
                  <div class="text-[11px] text-gray-500">Draft syllabus unit with AI</div>
                </div>
              </button>
              <button class="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-900">Create Fee Payment Link</div>
                  <div class="text-[11px] text-gray-500">Send instant billing link to parents</div>
                </div>
              </button>
              <button class="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-computer-desktop" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-900">Launch Proctored CBT Exam</div>
                  <div class="text-[11px] text-gray-500">Timed computer-based test</div>
                </div>
              </button>
              <button class="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <UIcon name="i-heroicons-megaphone" class="w-4 h-4" />
                </div>
                <div>
                  <div class="text-xs font-bold text-gray-900">Broadcast Priority Alert</div>
                  <div class="text-[11px] text-gray-500">SMS & in-app message to parents</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Gate Security Movements Feed -->
          <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-emerald-600" />
                <span>Live Gate Movements & Security Control</span>
              </h3>
              <span class="text-xs text-emerald-600 font-mono font-semibold">Active Monitoring</span>
            </div>
            <div class="divide-y divide-gray-100">
              <div
                v-for="move in recentMovements"
                :key="move.student"
                class="py-3.5 flex items-center justify-between text-xs"
              >
                <div>
                  <div class="font-bold text-gray-900 text-sm">{{ move.student }}</div>
                  <div class="text-gray-500">{{ move.type }} • {{ move.time }}</div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-100 text-emerald-800">
                  {{ move.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
