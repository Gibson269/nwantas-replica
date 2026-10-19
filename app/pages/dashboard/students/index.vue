<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Student Information System (SIS)'
})

const { fetchApi } = useNwantasApi()
const students = ref<any[]>([])
const selectedStudent = ref<any | null>(null)
const isModalOpen = ref(false)
const isLoading = ref(true)
const searchFilter = ref('')
const selectedClassFilter = ref('')

async function loadStudents() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/students')
    students.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
                          s.admissionNo.toLowerCase().includes(searchFilter.value.toLowerCase())
    const matchesClass = !selectedClassFilter.value || s.classArmName === selectedClassFilter.value
    return matchesSearch && matchesClass
  })
})

function viewStudentProfile(student: any) {
  selectedStudent.value = student
  isModalOpen.value = true
}

onMounted(() => {
  loadStudents()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-identification" class="w-3.5 h-3.5" />
          <span>STUDENT INFORMATION SYSTEM (SIS)</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Student Records & Academic Lifecycle</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Student bio-data, guardian contacts, attendance rates, boarding records, and batch promotion pipelines.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer">
          <UIcon name="i-heroicons-user-plus" class="w-4 h-4" />
          <span>Enrol New Student</span>
        </button>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
      <div class="relative w-full sm:w-80">
        <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          v-model="searchFilter"
          type="text"
          placeholder="Filter by student name or admission #..."
          class="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <select
          v-model="selectedClassFilter"
          class="px-3 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500"
        >
          <option value="">All Class Arms</option>
          <option value="SS 2 Science">SS 2 Science</option>
          <option value="JSS 1 Gold">JSS 1 Gold</option>
          <option value="JSS 2 Diamond">JSS 2 Diamond</option>
        </select>
        <span class="text-xs font-mono text-gray-500">{{ filteredStudents.length }} students listed</span>
      </div>
    </div>

    <!-- Student Table -->
    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50/70 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-3 px-4">Student</th>
              <th class="py-3 px-4">Admission No</th>
              <th class="py-3 px-4">Class Arm</th>
              <th class="py-3 px-4">Attendance</th>
              <th class="py-3 px-4">Bursary Status</th>
              <th class="py-3 px-4">Guardian Contact</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="st in filteredStudents" :key="st.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img :src="st.avatar" :alt="st.name" class="w-8 h-8 rounded-full object-cover">
                  <div>
                    <div class="font-bold text-gray-900">{{ st.name }}</div>
                    <div class="text-[10px] text-gray-400">{{ st.gender }} • Born {{ st.dateOfBirth }}</div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-gray-600">{{ st.admissionNo }}</td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium">
                  {{ st.classArmName }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span class="font-mono font-bold text-emerald-600">{{ st.attendanceRate }}%</span>
              </td>
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold',
                    st.feeStatus === 'Paid in Full' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ st.feeStatus }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <div class="text-gray-900 font-semibold">{{ st.guardianName }}</div>
                <div class="text-[10px] text-gray-500 font-mono">{{ st.guardianPhone }}</div>
              </td>
              <td class="py-3.5 px-4 text-right">
                <button
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-semibold text-xs transition-colors cursor-pointer"
                  @click="viewStudentProfile(st)"
                >
                  <UIcon name="i-heroicons-user" class="w-3.5 h-3.5" />
                  <span>Full Profile</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Student Profile Details -->
    <div
      v-if="isModalOpen && selectedStudent"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div class="flex items-center gap-3">
            <img :src="selectedStudent.avatar" :alt="selectedStudent.name" class="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20">
            <div>
              <h3 class="text-base font-bold text-gray-900">{{ selectedStudent.name }}</h3>
              <p class="text-xs text-gray-500 font-mono">{{ selectedStudent.admissionNo }} • {{ selectedStudent.classArmName }}</p>
            </div>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 grid grid-cols-2 gap-3">
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">GENDER & DOB</span>
              <span class="font-bold text-gray-900">{{ selectedStudent.gender }} • {{ selectedStudent.dateOfBirth }}</span>
            </div>
            <div>
              <span class="text-gray-400 font-mono text-[10px] block">ATTENDANCE PERFORMANCE</span>
              <span class="font-bold text-emerald-600 font-mono">{{ selectedStudent.attendanceRate }}% Present</span>
            </div>
          </div>

          <!-- Guardian Verification Link -->
          <div class="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40">
            <span class="text-emerald-900 font-mono text-[10px] block font-bold mb-2">VERIFIED GUARDIAN DETAILS</span>
            <div class="flex items-center gap-3">
              <img :src="selectedStudent.guardianPhoto" :alt="selectedStudent.guardianName" class="w-10 h-10 rounded-full object-cover">
              <div>
                <div class="font-bold text-gray-900">{{ selectedStudent.guardianName }} ({{ selectedStudent.guardianRelationship }})</div>
                <div class="text-[11px] text-gray-600 font-mono">{{ selectedStudent.guardianPhone }} • {{ selectedStudent.guardianEmail }}</div>
              </div>
            </div>
          </div>

          <!-- Hostel Boarding Record -->
          <div v-if="selectedStudent.hostelInfo" class="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <span class="text-gray-400 font-mono text-[10px] block font-bold mb-1">HOSTEL BOARDING SPACE</span>
            <div class="font-bold text-gray-900">{{ selectedStudent.hostelInfo.building }}</div>
            <div class="text-gray-600 font-mono">{{ selectedStudent.hostelInfo.room }} • {{ selectedStudent.hostelInfo.bed }}</div>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 mt-6 flex justify-end">
          <button
            class="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs"
            @click="isModalOpen = false"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
