<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'CBT Assessments & Anti-Cheat Monitoring Engine'
})

const { fetchApi } = useNwantasApi()
const assessments = ref<any[]>([])
const isLoading = ref(true)

const telemetryLogs = ref([
  { id: 1, student: 'David Adeleke Jr.', class: 'JSS 2 Diamond', exam: 'SS 2 Physics Midterm', event: 'Window Blur / Tab Switch (4.2s)', time: '10:14 AM', severity: 'High' },
  { id: 2, student: 'Tobi Bakare', class: 'SS 2 Science', exam: 'SS 2 Physics Midterm', event: 'Copy Shortcut Attempt (Ctrl+C)', time: '10:22 AM', severity: 'Medium' },
  { id: 3, student: 'Fatima Sanusi', class: 'JSS 1 Gold', exam: 'Basic Science Quiz', event: 'Fullscreen Exit Dismissed', time: '09:48 AM', severity: 'Low' }
])

onMounted(async () => {
  try {
    const res = await fetchApi('/api/v1/assessments')
    assessments.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
          <span>PROCTORING & ANTI-CHEAT TELEMETRY ACTIVE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Assessments & Computer-Based Testing (CBT)</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Schedule online tests, monitor server-synchronized countdown timers, and track proctoring security telemetry in real time.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer">
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>Create New CBT Assessment</span>
        </button>
      </div>
    </div>

    <!-- Active Assessments Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <div
        v-for="asm in assessments"
        :key="asm.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <span class="text-xs font-mono font-bold text-emerald-700 uppercase">{{ asm.subject }}</span>
            <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold">
              {{ asm.type }}
            </span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ asm.title }}</h3>
          <p class="text-xs text-gray-600 leading-relaxed mb-4">{{ asm.instructions }}</p>

          <div class="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center mb-6">
            <div>
              <div class="text-[10px] font-mono text-gray-400">DURATION</div>
              <div class="text-sm font-bold text-gray-900">{{ asm.durationMinutes }} Mins</div>
            </div>
            <div>
              <div class="text-[10px] font-mono text-gray-400">TOTAL MARKS</div>
              <div class="text-sm font-bold text-gray-900">{{ asm.totalMarks }} pts</div>
            </div>
            <div>
              <div class="text-[10px] font-mono text-gray-400">SUBMITTED</div>
              <div class="text-sm font-bold text-emerald-600">{{ asm.submissionsCount }} students</div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Anti-Cheat Enabled</span>
          </div>

          <NuxtLink
            :to="`/dashboard/cbt/take/${asm.id}`"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <UIcon name="i-heroicons-play" class="w-3.5 h-3.5" />
            <span>Launch Candidate Exam View</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Live Anti-Cheat Telemetry Audit Logs -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h3 class="text-sm font-bold text-gray-900">Live Anti-Cheat Proctoring Incident Telemetry</h3>
          <p class="text-xs text-gray-500">Real-time sensor logs from student browsers during active CBT sessions</p>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-mono font-semibold">
          WebSocket Heartbeat: Normal
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-2.5 px-3">Student Name</th>
              <th class="py-2.5 px-3">Class Arm</th>
              <th class="py-2.5 px-3">Exam Paper</th>
              <th class="py-2.5 px-3">Proctoring Telemetry Event</th>
              <th class="py-2.5 px-3">Time</th>
              <th class="py-2.5 px-3 text-right">Severity</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="log in telemetryLogs" :key="log.id" class="hover:bg-gray-50/60">
              <td class="py-3 px-3 font-bold text-gray-900">{{ log.student }}</td>
              <td class="py-3 px-3 text-gray-600 font-mono">{{ log.class }}</td>
              <td class="py-3 px-3 text-gray-700">{{ log.exam }}</td>
              <td class="py-3 px-3 text-gray-800 font-mono">{{ log.event }}</td>
              <td class="py-3 px-3 text-gray-500 font-mono">{{ log.time }}</td>
              <td class="py-3 px-3 text-right">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full font-mono text-[10px] font-bold',
                    log.severity === 'High' ? 'bg-red-100 text-red-800' :
                    log.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                    'bg-blue-100 text-blue-800'
                  ]"
                >
                  {{ log.severity }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
