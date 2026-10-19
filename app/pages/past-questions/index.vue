<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'National & International Past Questions Bank | Nwantas'
})

const { fetchApi } = useNwantasApi()
const pastQuestions = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchApi('/api/v1/past-questions')
    pastQuestions.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
        <UIcon name="i-heroicons-document-text" class="w-4 h-4 text-emerald-600" />
        <span>Official WAEC, JAMB & Cambridge IGCSE Question Bank</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
        Master your examinations with <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">AI-powered practice.</span>
      </h1>
      <p class="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
        Access standardized past examination papers with instant step-by-step AI solutions, exam timer drills, and speed analytics.
      </p>
    </div>

    <!-- Past Questions Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="pq in pastQuestions"
        :key="pq.id"
        class="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
              {{ pq.examBody }}
            </span>
            <span class="text-xs font-mono text-gray-500 font-bold">{{ pq.year }}</span>
          </div>

          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ pq.subject }}</h3>
          <p class="text-xs text-gray-600 leading-relaxed mb-4">{{ pq.description }}</p>

          <div class="flex items-center justify-between text-xs font-mono text-gray-500 p-3 rounded-xl bg-gray-50 mb-6">
            <span>{{ pq.totalQuestions }} Questions</span>
            <span>Duration: {{ pq.duration }}</span>
          </div>
        </div>

        <NuxtLink
          to="/dashboard/cbt/take/asm-cbt-01"
          class="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
        >
          <UIcon name="i-heroicons-play" class="w-4 h-4" />
          <span>Start CBT Practice Session &rarr;</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
