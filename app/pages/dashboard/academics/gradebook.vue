<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Gradebook & Broadsheet Collation Engine'
})

const { fetchApi } = useNwantasApi()
const tenantStore = useTenantStore()

const gradebook = ref<any[]>([])
const selectedStudentId = ref<string | null>(null)
const reportCardData = ref<any | null>(null)
const isLoading = ref(true)
const isCollating = ref(false)
const isReportModalOpen = ref(false)

async function loadGradebook() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/gradebooks/collate', { method: 'POST', body: {} })
    gradebook.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function handleCollate() {
  isCollating.value = true
  try {
    const res = await fetchApi('/api/v1/gradebooks/collate', { method: 'POST', body: {} })
    gradebook.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isCollating.value = false
  }
}

async function handleViewReportCard(studentId: string) {
  selectedStudentId.value = studentId
  try {
    const res = await fetchApi(`/api/v1/term-reports/${studentId}`)
    reportCardData.value = res
    isReportModalOpen.value = true
  } catch (e) {
    console.error(e)
  }
}

function handlePrint() {
  window.print()
}

onMounted(() => {
  loadGradebook()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-calculator" class="w-3.5 h-3.5" />
          <span>AUTOMATED BROADSHEET & REPORT CARD ENGINE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Gradebook, Weightages & Broadsheet Collation</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Automate term aggregate calculations (20% CA + 20% Midterm + 60% Exam), ranking positions, and printable report cards.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          :disabled="isCollating"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          @click="handleCollate"
        >
          <UIcon name="i-heroicons-arrow-path" :class="['w-4 h-4', isCollating && 'animate-spin']" />
          <span>{{ isCollating ? 'Recalculating...' : 'Collate Broadsheet Grades' }}</span>
        </button>
      </div>
    </div>

    <!-- Weightage Configuration Banner -->
    <div class="p-5 rounded-3xl bg-white border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
      <div class="p-3 rounded-2xl bg-gray-50">
        <div class="text-[10px] font-mono uppercase text-gray-400">CONTINUOUS ASSESSMENT (CA)</div>
        <div class="text-lg font-bold text-gray-900">20% Weightage</div>
        <div class="text-[10px] text-emerald-600">Max Score: 20 pts</div>
      </div>
      <div class="p-3 rounded-2xl bg-gray-50">
        <div class="text-[10px] font-mono uppercase text-gray-400">MIDTERM CBT EXAM</div>
        <div class="text-lg font-bold text-gray-900">20% Weightage</div>
        <div class="text-[10px] text-emerald-600">Max Score: 20 pts</div>
      </div>
      <div class="p-3 rounded-2xl bg-gray-50">
        <div class="text-[10px] font-mono uppercase text-gray-400">FINAL EXAMINATION</div>
        <div class="text-lg font-bold text-gray-900">60% Weightage</div>
        <div class="text-[10px] text-emerald-600">Max Score: 60 pts</div>
      </div>
      <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
        <div class="text-[10px] font-mono uppercase text-emerald-700">AGGREGATE SCALE</div>
        <div class="text-lg font-bold text-emerald-800">100% Total</div>
        <div class="text-[10px] text-emerald-700">5.0 GPA / Letter A1 - F9</div>
      </div>
    </div>

    <!-- Broadsheet Table -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h3 class="text-base font-bold text-gray-900">Class Broadsheet: SS 2 Science (Term 2)</h3>
          <p class="text-xs text-gray-500">Subject: Senior Secondary Physics (Course Code: PHY-201)</p>
        </div>
        <span class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Collation Status: Fully Collated
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-2.5 px-3">Position</th>
              <th class="py-2.5 px-3">Student Name</th>
              <th class="py-2.5 px-3">Admission No</th>
              <th class="py-2.5 px-3">CA (20)</th>
              <th class="py-2.5 px-3">Midterm (20)</th>
              <th class="py-2.5 px-3">Exam (60)</th>
              <th class="py-2.5 px-3 font-bold text-gray-900">Total (100)</th>
              <th class="py-2.5 px-3">Grade</th>
              <th class="py-2.5 px-3">GPA</th>
              <th class="py-2.5 px-3 text-right">Report Card</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="entry in gradebook" :key="entry.studentId" class="hover:bg-gray-50/60">
              <td class="py-3.5 px-3 font-mono font-bold text-gray-900">
                <span class="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                  {{ entry.position }}
                </span>
              </td>
              <td class="py-3.5 px-3 font-bold text-gray-900">{{ entry.studentName }}</td>
              <td class="py-3.5 px-3 font-mono text-gray-500">{{ entry.admissionNo }}</td>
              <td class="py-3.5 px-3 font-mono">{{ entry.caScore }}</td>
              <td class="py-3.5 px-3 font-mono">{{ entry.midtermScore }}</td>
              <td class="py-3.5 px-3 font-mono">{{ entry.examScore }}</td>
              <td class="py-3.5 px-3 font-mono font-bold text-emerald-600 text-sm">{{ entry.totalScore }}%</td>
              <td class="py-3.5 px-3">
                <span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-100 text-emerald-800">
                  {{ entry.letterGrade }}
                </span>
              </td>
              <td class="py-3.5 px-3 font-mono text-gray-700">{{ entry.gpa.toFixed(1) }}</td>
              <td class="py-3.5 px-3 text-right">
                <button
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                  @click="handleViewReportCard(entry.studentId)"
                >
                  <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5" />
                  <span>View Report</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Printable Term Report Card (Module 7 PDF / Print Engine) -->
    <div
      v-if="isReportModalOpen && reportCardData"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isReportModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-4xl w-full p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        <!-- Top Action Bar for modal -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-6 print:hidden">
          <div class="flex items-center gap-2">
            <span class="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              OFFICIAL TERM REPORT CARD
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              @click="handlePrint"
            >
              <UIcon name="i-heroicons-printer" class="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button class="p-2 text-gray-400 hover:text-gray-700" @click="isReportModalOpen = false">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Printable Document Area -->
        <div id="printable-report" class="space-y-6 text-gray-900">
          <!-- Institutional Header -->
          <div class="text-center pb-6 border-b-2 border-emerald-600">
            <div class="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-2xl mx-auto flex items-center justify-center mb-2 shadow-sm">
              N
            </div>
            <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900">{{ reportCardData.school.name }}</h2>
            <p class="text-xs italic text-gray-600 mt-0.5">"{{ reportCardData.school.motto }}"</p>
            <p class="text-xs text-gray-500 mt-1">{{ reportCardData.school.address }} • Tel: {{ reportCardData.school.phone }}</p>
            <div class="inline-block mt-3 px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs font-mono">
              CONTINUOUS ASSESSMENT & TERMINAL REPORT SHEET
            </div>
          </div>

          <!-- Student & Session Meta -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">STUDENT FULL NAME</span>
              <span class="font-bold text-gray-900 text-sm">{{ reportCardData.student.name }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">ADMISSION NUMBER</span>
              <span class="font-mono font-bold text-gray-900">{{ reportCardData.student.admissionNo }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">CLASS LEVEL & ARM</span>
              <span class="font-bold text-gray-900">{{ reportCardData.student.classArm }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">ACADEMIC SESSION</span>
              <span class="font-bold text-emerald-700">{{ reportCardData.termInfo.term }} ({{ reportCardData.termInfo.session }})</span>
            </div>
          </div>

          <!-- Subjects & Score Collation -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border border-gray-200">
              <thead class="bg-gray-100 font-mono text-[10px] uppercase text-gray-700">
                <tr class="divide-x divide-gray-200">
                  <th class="py-2.5 px-3">Subject</th>
                  <th class="py-2.5 px-3 text-center">CA (20)</th>
                  <th class="py-2.5 px-3 text-center">Midterm (20)</th>
                  <th class="py-2.5 px-3 text-center">Exam (60)</th>
                  <th class="py-2.5 px-3 text-center font-bold">Total (100)</th>
                  <th class="py-2.5 px-3 text-center">Grade</th>
                  <th class="py-2.5 px-3">Subject Tutor Remarks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="sub in reportCardData.subjects" :key="sub.subject" class="divide-x divide-gray-200">
                  <td class="py-2.5 px-3 font-bold">{{ sub.subject }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ sub.ca }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ sub.midterm }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ sub.exam }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{{ sub.total }}</td>
                  <td class="py-2.5 px-3 text-center font-mono font-bold">{{ sub.grade }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ sub.remarks }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Performance Summary -->
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">TOTAL MARKS OBTAINED</span>
              <span class="font-extrabold text-sm text-gray-900">{{ reportCardData.summary.totalScore }} / {{ reportCardData.summary.maxPossibleScore }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">AVERAGE SCORE</span>
              <span class="font-extrabold text-sm text-emerald-700">{{ reportCardData.summary.average }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">CLASS POSITION</span>
              <span class="font-extrabold text-sm text-gray-900">{{ reportCardData.summary.classPosition }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">OVERALL RATING</span>
              <span class="font-extrabold text-sm text-emerald-700">{{ reportCardData.summary.overallGrade }}</span>
            </div>
          </div>

          <!-- Teacher & Principal Remarks & Signatures -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-gray-200">
            <div class="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
              <span class="font-mono text-[10px] text-gray-400 block uppercase font-bold">FORM TEACHER REMARK</span>
              <p class="italic text-gray-700">{{ reportCardData.summary.classTeacherRemark }}</p>
              <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono">
                <span class="text-gray-500">Signature:</span>
                <span class="font-bold text-emerald-800">{{ reportCardData.summary.classTeacherSignature }}</span>
              </div>
            </div>

            <div class="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
              <span class="font-mono text-[10px] text-gray-400 block uppercase font-bold">PRINCIPAL / HEAD OF SCHOOL REMARK</span>
              <p class="italic text-gray-700">{{ reportCardData.summary.principalRemark }}</p>
              <div class="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-mono">
                <span class="text-gray-500">Official Seal & Sign:</span>
                <span class="font-bold text-emerald-800">{{ reportCardData.summary.principalSignature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
