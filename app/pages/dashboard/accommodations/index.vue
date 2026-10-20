<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Hostels & Bed Accommodation Management | Nwantas'
})

const { fetchApi } = useNwantasApi()
const buildings = ref<any[]>([])
const beds = ref<any[]>([])
const students = ref<any[]>([])
const isLoading = ref(true)

// Modals
const isAllocateModalOpen = ref(false)
const selectedBed = ref<any | null>(null)
const selectedStudentId = ref('')
const isAllocating = ref(false)

// Filter
const selectedBuildingFilter = ref('All')

async function loadAccommodations() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/accommodations/buildings')
    buildings.value = res.buildings || []
    beds.value = res.beds || []

    // Also fetch students for the allocation dropdown
    const studRes = await fetchApi('/api/v1/students')
    students.value = studRes.data || []
    if (students.value.length > 0 && !selectedStudentId.value) {
      selectedStudentId.value = students.value[0].id
    }
  } catch (e) {
    console.error('Failed to load accommodations:', e)
  } finally {
    isLoading.value = false
  }
}

// Open Allocation Modal
function openAllocateModal(bed: any) {
  selectedBed.value = bed
  isAllocateModalOpen.value = true
}

// Confirm Bed Allocation
async function handleAllocate() {
  if (!selectedBed.value || !selectedStudentId.value) return
  const st = students.value.find(s => s.id === selectedStudentId.value)
  if (!st) return

  isAllocating.value = true
  try {
    await fetchApi(`/api/v1/accommodations/beds/${selectedBed.value.id}/allocate`, {
      method: 'POST',
      body: {
        studentId: st.id,
        studentName: st.name
      }
    })
    isAllocateModalOpen.value = false
    await loadAccommodations()
  } catch (e) {
    console.error('Allocation failed:', e)
  } finally {
    isAllocating.value = false
  }
}

// Vacate Bed
async function handleVacate(bed: any) {
  if (!confirm(`Are you sure you want to vacate Bed ${bed.roomNumber} - ${bed.bedCode} currently allocated to ${bed.studentName}?`)) return
  try {
    await fetchApi(`/api/v1/accommodations/beds/${bed.id}/vacate`, {
      method: 'POST'
    })
    await loadAccommodations()
  } catch (e) {
    console.error('Failed to vacate bed:', e)
  }
}

const filteredBeds = computed(() => {
  if (selectedBuildingFilter.value === 'All') return beds.value
  return beds.value.filter(b => b.buildingId === selectedBuildingFilter.value)
})

onMounted(() => {
  loadAccommodations()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-home-modern" class="w-3.5 h-3.5 text-emerald-600" />
          <span>HOSTEL INFRASTRUCTURE & VACANCY TRACKING</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Hostel & Bed Space Accommodation</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Boarding halls, room capacities, real-time bed space allocation, and warden clearance tracking.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="loadAccommodations"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh Occupancy</span>
        </button>
      </div>
    </div>

    <!-- Hostel Buildings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="bld in buildings"
        :key="bld.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4"
      >
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <h3 class="text-base font-bold text-gray-900">{{ bld.name }}</h3>
            <span
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-mono font-bold',
                bld.vacantBeds > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              ]"
            >
              {{ bld.vacantBeds }} Vacancies
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Hall Warden:</span>
              <span class="font-bold text-gray-800">{{ bld.warden }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Total Rooms:</span>
              <span class="font-mono text-gray-800">{{ bld.totalRooms }} rooms</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Occupancy Rate:</span>
              <span class="font-mono font-bold text-emerald-700">
                {{ ((bld.occupiedBeds / (bld.totalBeds || 1)) * 100).toFixed(1) }}% ({{ bld.occupiedBeds }}/{{ bld.totalBeds }} beds)
              </span>
            </div>
          </div>
        </div>

        <div>
          <!-- Progress bar -->
          <div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div
              class="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              :style="{ width: `${(bld.occupiedBeds / (bld.totalBeds || 1)) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Bed Allocation Matrix Section -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">Real-Time Bed Space Allocation Matrix</h3>
          <p class="text-xs text-gray-500">Click any vacant bed to assign a boarder, or manage existing allocations.</p>
        </div>

        <!-- Filter Select -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-400 font-mono">Building:</span>
          <select
            v-model="selectedBuildingFilter"
            class="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Buildings</option>
            <option v-for="b in buildings" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="bed in filteredBeds"
          :key="bed.id"
          :class="[
            'p-4 rounded-2xl border text-xs space-y-2 transition-all',
            bed.status === 'Occupied'
              ? 'border-gray-200 bg-gray-50/80'
              : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-900">{{ bed.roomNumber }} - {{ bed.bedCode }}</span>
            <span
              :class="[
                'px-2 py-0.5 rounded-full font-mono text-[10px] font-bold',
                bed.status === 'Occupied' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'
              ]"
            >
              {{ bed.status }}
            </span>
          </div>

          <div class="text-[11px] text-gray-500 truncate">{{ bed.buildingName }}</div>

          <div v-if="bed.studentName" class="pt-2 border-t border-gray-200/60 space-y-2">
            <div class="text-emerald-950 font-semibold text-xs flex items-center gap-1.5">
              <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-emerald-600" />
              <span>{{ bed.studentName }}</span>
            </div>
            <button
              @click="handleVacate(bed)"
              class="w-full py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Vacate Bed Space
            </button>
          </div>

          <div v-else class="pt-2 border-t border-emerald-100">
            <button
              @click="openAllocateModal(bed)"
              class="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              + Allocate to Student
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Allocate Bed to Student -->
    <div
      v-if="isAllocateModalOpen && selectedBed"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isAllocateModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <span class="text-[10px] font-mono font-bold text-emerald-600 uppercase">{{ selectedBed.buildingName }}</span>
            <h3 class="text-base font-bold text-gray-900">Allocate {{ selectedBed.roomNumber }} - {{ selectedBed.bedCode }}</h3>
            <p class="text-xs text-gray-500">Assign a registered boarding student to this bed space.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isAllocateModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Select Student</label>
            <select
              v-model="selectedStudentId"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="st in students" :key="st.id" :value="st.id">
                {{ st.name }} ({{ st.admissionNo }} - {{ st.classArmName }})
              </option>
            </select>
          </div>

          <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1">
            <div class="text-gray-500 font-mono text-[10px]">HOSTEL BUILDING</div>
            <div class="font-bold text-gray-900">{{ selectedBed.buildingName }}</div>
            <div class="text-gray-600">Room: {{ selectedBed.roomNumber }} • Bed Code: {{ selectedBed.bedCode }}</div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            @click="isAllocateModalOpen = false"
          >
            Cancel
          </button>
          <button
            :disabled="isAllocating"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleAllocate"
          >
            Confirm Allocation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
