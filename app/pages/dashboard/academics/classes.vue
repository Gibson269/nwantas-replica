<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Classes & Curriculum Arms'
})

const { fetchApi } = useNwantasApi()
const classes = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchApi('/api/v1/classes')
    classes.value = res.data
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
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Classes & Academic Class Arms</h1>
        <p class="text-xs text-gray-500 mt-1">
          Manage classroom divisions, form tutors, subject mappings, and student enrollment capacities.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer">
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>Add New Class Arm</span>
        </button>
      </div>
    </div>

    <!-- Classes Grid -->
    <div v-if="isLoading" class="p-12 text-center text-xs text-gray-400 font-mono">
      Loading class arms and curriculum allocations...
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <div
        v-for="cls in classes"
        :key="cls.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div>
            <span class="text-xs font-mono font-bold text-emerald-600 uppercase">{{ cls.level }}</span>
            <h3 class="text-lg font-bold text-gray-900 leading-tight">{{ cls.displayName }}</h3>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold">
            {{ cls.studentCount }} / {{ cls.capacity }} Enrolled
          </span>
        </div>

        <div class="space-y-3 mb-6">
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500">Form Teacher:</span>
            <span class="font-bold text-gray-900">{{ cls.formTeacher }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500">Class Arm ID:</span>
            <span class="font-mono text-gray-600">{{ cls.id }}</span>
          </div>
        </div>

        <!-- Subjects Pill List -->
        <div>
          <span class="text-[11px] font-mono font-bold uppercase text-gray-400 block mb-2">Assigned Curriculum Subjects:</span>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="sub in cls.subjects"
              :key="sub"
              class="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium"
            >
              {{ sub }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
