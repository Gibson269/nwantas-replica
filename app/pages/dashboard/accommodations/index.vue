<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Hostels & Bed Accommodation Management'
})

const { fetchApi } = useNwantasApi()
const buildings = ref<any[]>([])
const beds = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchApi('/api/v1/accommodations/buildings')
    buildings.value = res.buildings
    beds.value = res.beds
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
          <UIcon name="i-heroicons-home-modern" class="w-3.5 h-3.5" />
          <span>HOSTEL INFRASTRUCTURE & VACANCY TRACKING</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Hostel & Bed Space Accommodation</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Boarding halls, room types, vacant bed space management, and warden clearance tracking.
        </p>
      </div>
    </div>

    <!-- Hostel Buildings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="bld in buildings"
        :key="bld.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
      >
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h3 class="text-base font-bold text-gray-900">{{ bld.name }}</h3>
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
            {{ bld.vacantBeds }} Vacancies
          </span>
        </div>

        <div class="space-y-3 mb-6 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-500">Hall Warden:</span>
            <span class="font-bold text-gray-800">{{ bld.warden }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Total Rooms:</span>
            <span class="font-mono text-gray-800">{{ bld.totalRooms }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Occupancy Rate:</span>
            <span class="font-mono font-bold text-emerald-700">{{ ((bld.occupiedBeds / bld.totalBeds) * 100).toFixed(1) }}% ({{ bld.occupiedBeds }}/{{ bld.totalBeds }} beds)</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            class="bg-emerald-600 h-2 rounded-full"
            :style="{ width: `${(bld.occupiedBeds / bld.totalBeds) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Bed Allocation Matrix Table -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <h3 class="text-sm font-bold text-gray-900 mb-4">Real-Time Bed Space Allocation Matrix</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="bed in beds"
          :key="bed.id"
          :class="[
            'p-4 rounded-2xl border text-xs space-y-1',
            bed.status === 'Occupied' ? 'border-gray-200 bg-gray-50' : 'border-emerald-200 bg-emerald-50/50'
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-900">{{ bed.roomNumber }} - {{ bed.bedCode }}</span>
            <span
              :class="[
                'px-2 py-0.5 rounded font-mono text-[10px] font-bold',
                bed.status === 'Occupied' ? 'bg-gray-200 text-gray-700' : 'bg-emerald-100 text-emerald-800'
              ]"
            >
              {{ bed.status }}
            </span>
          </div>
          <div class="text-[11px] text-gray-500">{{ bed.buildingName }}</div>
          <div v-if="bed.studentName" class="text-emerald-900 font-semibold pt-1">
            Student: {{ bed.studentName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
