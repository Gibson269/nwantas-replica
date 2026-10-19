<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Adaptive Conversational AI Tutor'
})

const { fetchApi } = useNwantasApi()

const studyPlans = ref<any[]>([])
const chatMessages = ref([
  {
    sender: 'ai',
    text: 'Hello Chidi! I am your Nwantas AI Tutor. We are currently working on Senior Secondary Physics: Electromagnetism & Induction. Which topic or question would you like to review today?'
  }
])
const userPrompt = ref('')
const isReplying = ref(false)

// Highlight explanation state
const selectedSnippet = ref('Faraday\'s Law of Electromagnetic Induction')
const explanationResult = ref<any | null>(null)

async function handleSendMessage() {
  if (!userPrompt.value.trim() || isReplying.value) return
  const query = userPrompt.value.trim()
  chatMessages.value.push({ sender: 'user', text: query })
  userPrompt.value = ''
  isReplying.value = true

  try {
    const res = await fetchApi('/api/tutor/chat', {
      method: 'POST',
      body: { message: query, topic: 'Electromagnetism' }
    })
    chatMessages.value.push({ sender: 'ai', text: res.reply })
  } catch (e) {
    console.error(e)
  } finally {
    isReplying.value = false
  }
}

async function handleExplainSelection() {
  try {
    const res = await fetchApi('/api/tutor/explain-selection', {
      method: 'POST',
      body: { selectedText: selectedSnippet.value, subject: 'Physics' }
    })
    explanationResult.value = res
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  try {
    const res = await fetchApi('/api/tutor/study-plans')
    studyPlans.value = res.studyPlans
    await handleExplainSelection()
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
          <span>ADAPTIVE SOURCED RAG & BLOOM'S TAXONOMY ENGINE</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Conversational AI Tutor & Adaptive Study Planner</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Step-by-step concept explanations, curriculum-aligned study plans, and instant text-selection breakdowns.
        </p>
      </div>
    </div>

    <!-- Active Study Plan Progress Card -->
    <div v-for="plan in studyPlans" :key="plan.id" class="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-emerald-900 text-white shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <span class="text-xs font-mono text-purple-300 font-bold uppercase">TARGET GOAL: {{ plan.targetExam }}</span>
          <h2 class="text-xl font-extrabold mt-0.5">{{ plan.title }}</h2>
        </div>
        <div class="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-center">
          <div class="text-[10px] font-mono text-purple-200">MASTERY LEVEL</div>
          <div class="text-2xl font-black text-emerald-400">{{ plan.progress }}</div>
        </div>
      </div>

      <!-- Modules List -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
        <div v-for="mod in plan.modules" :key="mod.id" class="p-3 rounded-2xl bg-white/5 border border-white/10">
          <div class="font-bold text-white mb-1">{{ mod.title }}</div>
          <div class="text-[10px] text-emerald-300 font-mono">{{ mod.status }} • {{ mod.masteryScore }}</div>
        </div>
      </div>
    </div>

    <!-- Two-Column Studio: Chat with AI Tutor & Selection Explainer -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left: Interactive AI Conversation (7 cols) -->
      <div class="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col h-[520px]">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs font-bold text-gray-900">Nwantas Physics AI Specialist</h3>
              <span class="text-[10px] text-emerald-600 font-mono">Trained on WAEC/Cambridge syllabi</span>
            </div>
          </div>
        </div>

        <!-- Chat Stream -->
        <div class="flex-1 overflow-y-auto space-y-3 pr-2 text-xs">
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            :class="['flex', msg.sender === 'user' ? 'justify-end' : 'justify-start']"
          >
            <div
              :class="[
                'max-w-md p-4 rounded-2xl leading-relaxed',
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-50 border border-gray-100 text-gray-800'
              ]"
            >
              {{ msg.text }}
            </div>
          </div>
          <div v-if="isReplying" class="text-xs text-purple-600 italic font-mono">
            AI Tutor is formulating step-by-step guidance...
          </div>
        </div>

        <!-- Prompt input -->
        <div class="pt-4 border-t border-gray-100 flex items-center gap-2">
          <input
            v-model="userPrompt"
            type="text"
            placeholder="Ask a question about physics formulas, derivations, or exam problems..."
            class="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs outline-none focus:border-purple-500 focus:bg-white"
            @keydown.enter="handleSendMessage"
          >
          <button
            class="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleSendMessage"
          >
            Ask AI
          </button>
        </div>
      </div>

      <!-- Right: "Explain Selection" Feature (5 cols) -->
      <div class="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div class="pb-3 border-b border-gray-100">
          <span class="text-[10px] font-mono font-bold uppercase text-purple-700 block">CONTEXTUAL EXPLAIN-SELECTION</span>
          <h3 class="text-sm font-bold text-gray-900 mt-0.5">Instant Concept Simplification</h3>
          <p class="text-[11px] text-gray-500 mt-0.5">Simulates highlighting difficult academic terminology to get instant step-by-step breakdown.</p>
        </div>

        <div>
          <label class="block text-[10px] font-mono uppercase text-gray-400 mb-1">Highlighted Text Snippet</label>
          <input
            v-model="selectedSnippet"
            type="text"
            class="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold"
            @blur="handleExplainSelection"
          >
        </div>

        <div v-if="explanationResult" class="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3 text-xs">
          <div class="font-bold text-purple-900">Simplified Pedagogical Explanation:</div>
          <p class="text-gray-700 leading-relaxed">{{ explanationResult.simplifiedExplanation }}</p>

          <div class="pt-2 border-t border-purple-200/50">
            <span class="font-mono text-[10px] font-bold text-purple-800 uppercase block mb-1">Key Curriculum Terms:</span>
            <div class="flex flex-wrap gap-1">
              <span v-for="t in explanationResult.keyTerms" :key="t" class="px-2 py-0.5 rounded bg-white text-purple-900 border border-purple-200 text-[10px]">
                {{ t }}
              </span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-white border border-purple-200 text-[11px] text-purple-950 font-medium">
            💡 Quick Diagnostic Check: {{ explanationResult.quickCheckQuestion }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
