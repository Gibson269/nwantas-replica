<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Admissions Pipeline & Entrance CBT Engine'
})

const applications = ref([
  { id: 'app-001', applicantName: 'Tobiloba Williams', applyingFor: 'JSS 1 Gold', parentName: 'Mrs. Janet Williams', phone: '+234 802 999 4433', examScore: '84%', status: 'Under Review', documents: ['Birth Certificate', 'Primary 6 Result', 'Medical Clearance'] },
  { id: 'app-002', applicantName: 'Faruq Al-Hassan', applyingFor: 'SS 1 Science', parentName: 'Alhaji Bashir Al-Hassan', phone: '+234 803 777 2211', examScore: '92%', status: 'Accepted', documents: ['JSCE Certificate', 'Testimonial', 'Passport Photo'] },
  { id: 'app-003', applicantName: 'Kamsi Okafor', applyingFor: 'JSS 1 Gold', parentName: 'Dr. Emeka Okafor', phone: '+234 805 111 2233', examScore: 'Pending', status: 'Entrance Exam Pending', documents: ['Birth Certificate', 'Medical Form'] },
  { id: 'app-004', applicantName: 'Zainab Danjuma', applyingFor: 'SS 2 Science', parentName: 'Col. Danjuma Bello', phone: '+234 807 444 8899', examScore: '88%', status: 'Accepted', documents: ['SS1 Transcript', 'Recommendation Letter'] }
])

function updateStatus(app: any, newStatus: string) {
  app.status = newStatus
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-user-plus" class="w-3.5 h-3.5" />
          <span>ADMISSIONS & ENTRANCE EXAMINATION PIPELINE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Digital Admissions Pipeline</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Process online applications, verify mandatory uploaded documents, and track entrance CBT exam grading.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/admissions"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <UIcon name="i-heroicons-globe-alt" class="w-4 h-4" />
          <span>View Public Admissions Portal</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Active Admission Cycle Overview Card -->
    <div class="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-green-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-mono text-emerald-200 font-bold uppercase">ACTIVE ENROLMENT CYCLE</span>
        <h2 class="text-xl font-black mt-0.5">2026/2027 Academic Year Admissions</h2>
        <div class="text-xs text-emerald-100 mt-1">Open for JSS 1, JSS 2, and SS 1 • Application Fee: ₦15,000</div>
      </div>
      <div class="flex items-center gap-6 bg-emerald-900/60 p-4 rounded-2xl border border-white/10 text-center">
        <div>
          <div class="text-[10px] font-mono text-emerald-200">TOTAL APPLICANTS</div>
          <div class="text-2xl font-extrabold text-white">142</div>
        </div>
        <div class="w-px h-8 bg-emerald-700" />
        <div>
          <div class="text-[10px] font-mono text-emerald-200">ADMITTED</div>
          <div class="text-2xl font-extrabold text-emerald-300">48</div>
        </div>
      </div>
    </div>

    <!-- Applicants Board -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h3 class="text-sm font-bold text-gray-900 mb-4">Applicant Processing Roster</h3>
      <div class="space-y-3">
        <div
          v-for="app in applications"
          :key="app.id"
          class="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-gray-900 text-sm">{{ app.applicantName }}</span>
              <span class="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-50 text-emerald-800">Applying for: {{ app.applyingFor }}</span>
            </div>
            <div class="text-xs text-gray-500">
              Parent: {{ app.parentName }} • Phone: {{ app.phone }}
            </div>
            <div class="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1">
              <span class="font-mono text-[10px] text-gray-400">DOCUMENTS:</span>
              <span v-for="d in app.documents" :key="d" class="px-1.5 py-0.2 bg-gray-100 rounded text-[10px]">{{ d }}</span>
            </div>
          </div>

          <!-- Score & Decision Actions -->
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-[10px] font-mono text-gray-400">ENTRANCE CBT</div>
              <div :class="['text-xs font-mono font-bold', app.examScore === 'Pending' ? 'text-amber-600' : 'text-emerald-600']">
                {{ app.examScore }}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <span
                :class="[
                  'px-3 py-1 rounded-xl text-xs font-mono font-semibold',
                  app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                  app.status === 'Entrance Exam Pending' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                ]"
              >
                {{ app.status }}
              </span>

              <button
                v-if="app.status !== 'Accepted'"
                class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                @click="updateStatus(app, 'Accepted')"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
