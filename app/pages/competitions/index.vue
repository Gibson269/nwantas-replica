<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'National Inter-School Competitions & Olympiad Leaderboards | Nwantas'
})

const { fetchApi } = useNwantasApi()
const competitions = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchApi('/api/v1/competitions')
    competitions.value = res.data
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
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
        <UIcon name="i-heroicons-trophy" class="w-4 h-4 text-amber-600" />
        <span>Live Inter-School Tournaments & Academic Olympiads</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
        Compete with top schools, <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-500">claim the podium.</span>
      </h1>
      <p class="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
        Real-time score tabulations, round advancement brackets, and nationwide institutional distinctions.
      </p>
    </div>

    <!-- Competitions Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div
        v-for="comp in competitions"
        :key="comp.id"
        class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6"
      >
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span class="text-xs font-mono font-bold text-amber-600 uppercase">{{ comp.category }}</span>
            <h2 class="text-xl font-bold text-gray-900 leading-tight mt-0.5">{{ comp.title }}</h2>
          </div>
          <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-mono font-bold animate-pulse">
            {{ comp.currentRound }}
          </span>
        </div>

        <div class="text-xs text-gray-500 flex items-center justify-between">
          <span>Organizer: {{ comp.organizer }}</span>
          <span class="font-mono">{{ comp.participantsCount }} competing institutions</span>
        </div>

        <!-- Leaderboard -->
        <div class="space-y-2">
          <h4 class="text-xs font-mono font-bold uppercase text-gray-400">Live Stage Leaderboard</h4>
          <div
            v-for="row in comp.leaderboard"
            :key="row.rank"
            class="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
          >
            <div class="flex items-center gap-3">
              <span
                :class="[
                  'w-7 h-7 rounded-xl flex items-center justify-center font-bold font-mono text-xs',
                  row.rank === 1 ? 'bg-amber-400 text-gray-950 font-extrabold shadow-sm' :
                  row.rank === 2 ? 'bg-gray-300 text-gray-900' :
                  row.rank === 3 ? 'bg-amber-700/60 text-white' :
                  'bg-gray-200 text-gray-600'
                ]"
              >
                #{{ row.rank }}
              </span>
              <div>
                <div class="font-bold text-gray-900">{{ row.school }}</div>
                <div class="text-[10px] text-gray-500">Rep: {{ row.representative }}</div>
              </div>
            </div>
            <div class="text-sm font-extrabold text-emerald-600 font-mono">{{ row.score }} pts</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
