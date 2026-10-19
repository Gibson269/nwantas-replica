<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Ministry of Education & Regulatory Quality Assurance Portal'
})

const { fetchApi } = useNwantasApi()
const tenantStore = useTenantStore()

const compliance = ref<any | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  try {
    const res = await fetchApi('/api/v1/government/compliance')
    compliance.value = res.data
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
          <UIcon name="i-heroicons-building-library" class="w-3.5 h-3.5" />
          <span>STATUTORY REGULATORY OVERSIGHT & ACCREDITATION</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Ministry of Education Compliance & Audit Engine</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Government accreditation rating, statutory curriculum submissions, and confidential quality assurance citations.
        </p>
      </div>
    </div>

    <!-- Accreditation Rating Banner -->
    <div v-if="compliance" class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950 via-gray-900 to-gray-900 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-emerald-500/20">
      <div>
        <span class="text-xs font-mono text-emerald-400 font-bold uppercase">MINISTRY QUALITY ASSURANCE AUDIT</span>
        <h2 class="text-2xl sm:text-3xl font-black mt-1 text-white">Official Accreditation: {{ compliance.accreditationRating }}</h2>
        <p class="text-xs text-gray-400 mt-1">Lead Inspector: {{ compliance.inspectorLead }} • Last Audit: {{ compliance.lastAuditDate }}</p>
        <p class="text-xs text-emerald-400 font-mono mt-2">Curriculum: {{ compliance.curriculumCompliance }}</p>
      </div>

      <div class="px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
        <UIcon name="i-heroicons-shield-check" class="w-10 h-10 text-emerald-400 mx-auto mb-1" />
        <span class="text-xs font-mono font-bold text-emerald-400">STATE ACCREDITED</span>
      </div>
    </div>

    <!-- Compliance Categories Grid -->
    <div v-if="compliance" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="cat in compliance.categories"
        :key="cat.name"
        class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-2 text-xs"
      >
        <span class="font-bold text-gray-900 block leading-tight">{{ cat.name }}</span>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <span class="text-xl font-extrabold text-emerald-600 font-mono">{{ cat.score }}</span>
          <span class="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {{ cat.status }}
          </span>
        </div>
      </div>
    </div>

    <!-- Active Citations & Inspector Notes -->
    <div v-if="compliance" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <h3 class="text-sm font-bold text-gray-900">Official Inspectorate Citations & Audit Notes</h3>
      <div class="space-y-3">
        <div
          v-for="cit in compliance.activeCitations"
          :key="cit.id"
          class="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
        >
          <div>
            <div class="font-bold text-gray-900">{{ cit.title }}</div>
            <div class="text-gray-500 text-[11px]">Issued: {{ cit.dateIssued }} • Severity: {{ cit.severity }}</div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
            {{ cit.status }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
