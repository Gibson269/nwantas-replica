<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'cbt'
})

useHead({
  title: 'Secure CBT Examination Session'
})

const route = useRoute()
const { fetchApi } = useNwantasApi()
const authStore = useAuthStore()

const assessment = ref<any | null>(null)
const currentQuestionIndex = ref(0)
const answers = ref<Record<string, number>>({})
const remainingSeconds = ref(45 * 60)
const isSubmitting = ref(false)
const submissionResult = ref<any | null>(null)
const antiCheatWarning = ref<string | null>(null)
let timerInterval: any = null

const currentQuestion = computed(() => {
  if (!assessment.value?.questions) return null
  return assessment.value.questions[currentQuestionIndex.value]
})

const formattedTime = computed(() => {
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

async function recordTelemetry(type: string, details: string) {
  try {
    antiCheatWarning.value = `Anti-Cheat Sensor Alert: ${details}`
    setTimeout(() => { antiCheatWarning.value = null }, 6000)

    await fetchApi(`/api/v1/assessments/${route.params.id || 'asm-cbt-01'}/monitoring-events`, {
      method: 'POST',
      body: {
        studentId: authStore.currentUser.id,
        studentName: authStore.currentUser.name,
        eventType: type,
        details
      }
    })
  } catch (e) {
    console.error(e)
  }
}

function handleSelectOption(optIndex: number) {
  if (!currentQuestion.value) return
  answers.value[currentQuestion.value.id] = optIndex
}

async function handleSubmitExam() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const res = await fetchApi(`/api/v1/assessments/${route.params.id || 'asm-cbt-01'}/submit`, {
      method: 'POST',
      body: {
        studentId: authStore.currentUser.id,
        studentName: authStore.currentUser.name,
        answers: answers.value
      }
    })
    submissionResult.value = res.data
    clearInterval(timerInterval)
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetchApi(`/api/v1/assessments/${route.params.id || 'asm-cbt-01'}`)
    assessment.value = res.data

    // Fetch server synchronized remaining time
    const timeRes = await fetchApi('/api/v1/assessments/session/remaining')
    remainingSeconds.value = timeRes.remainingSeconds || 45 * 60

    timerInterval = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
      } else {
        handleSubmitExam()
      }
    }, 1000)
  } catch (e) {
    console.error(e)
  }

  // Setup Anti-Cheat Sensor Listeners
  window.addEventListener('blur', () => {
    recordTelemetry('window_blur', 'Candidate shifted focus away from active examination browser window.')
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      recordTelemetry('tab_switch', 'Candidate minimized or switched to another browser tab.')
    }
  })

  window.addEventListener('copy', (e) => {
    e.preventDefault()
    recordTelemetry('copy_paste_attempt', 'Attempted unauthorized text copy from examination canvas.')
  })
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
    <!-- Anti-Cheat Real-time Warning Banner -->
    <div
      v-if="antiCheatWarning"
      class="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-mono flex items-center justify-between animate-pulse"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-400" />
        <span>{{ antiCheatWarning }} (Logged to proctoring ledger)</span>
      </div>
      <span class="text-[10px] text-red-300">VIOLATION RECORDED</span>
    </div>

    <!-- Exam Info & Server Timer Bar -->
    <div v-if="assessment" class="bg-gray-800 rounded-3xl p-6 border border-gray-700/60 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="text-xs font-mono text-emerald-400 mb-1">{{ assessment.subject }} • {{ assessment.classLevel }}</div>
        <h1 class="text-xl font-extrabold text-white">{{ assessment.title }}</h1>
        <div class="text-xs text-gray-400 mt-0.5">Instructions: Select the single best answer for each question.</div>
      </div>

      <!-- Live Server Synchronized Timer -->
      <div class="flex items-center gap-4 bg-gray-950/80 px-6 py-3 rounded-2xl border border-gray-700/80">
        <UIcon name="i-heroicons-clock" class="w-6 h-6 text-emerald-400 animate-pulse" />
        <div class="flex flex-col">
          <span class="text-[10px] font-mono text-gray-400">SERVER REMAINING TIME</span>
          <span class="text-2xl font-mono font-extrabold text-emerald-400">{{ formattedTime }}</span>
        </div>
      </div>
    </div>

    <!-- Active Question Card & Answer Options -->
    <div v-if="currentQuestion && !submissionResult" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Main Question Panel (8 cols) -->
      <div class="lg:col-span-8 bg-gray-800 rounded-3xl p-6 sm:p-8 border border-gray-700/60 shadow-xl space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-gray-700">
          <span class="text-xs font-mono text-emerald-400 font-bold uppercase">
            Question {{ currentQuestionIndex + 1 }} of {{ assessment?.questions.length }}
          </span>
          <span class="text-xs font-mono text-gray-400">Weight: 10 Marks</span>
        </div>

        <!-- Question Text -->
        <h2 class="text-base sm:text-lg font-bold text-white leading-relaxed">
          {{ currentQuestion.questionText }}
        </h2>

        <!-- Options List -->
        <div class="space-y-3">
          <button
            v-for="(option, optIdx) in currentQuestion.options"
            :key="optIdx"
            :class="[
              'w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-medium',
              answers[currentQuestion.id] === optIdx
                ? 'border-emerald-500 bg-emerald-500/15 text-white ring-2 ring-emerald-500/30'
                : 'border-gray-700 bg-gray-900/60 text-gray-300 hover:border-gray-600 hover:bg-gray-900'
            ]"
            @click="handleSelectOption(optIdx)"
          >
            <div
              :class="[
                'w-7 h-7 rounded-xl flex items-center justify-center font-bold font-mono text-xs shrink-0',
                answers[currentQuestion.id] === optIdx ? 'bg-emerald-500 text-gray-950' : 'bg-gray-800 text-gray-400'
              ]"
            >
              {{ String.fromCharCode(65 + optIdx) }}
            </div>
            <span>{{ option }}</span>
          </button>
        </div>

        <!-- Previous / Next Controls -->
        <div class="pt-6 border-t border-gray-700 flex items-center justify-between">
          <button
            :disabled="currentQuestionIndex === 0"
            class="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
            @click="currentQuestionIndex--"
          >
            &larr; Previous Question
          </button>
          <button
            v-if="currentQuestionIndex < (assessment?.questions.length - 1)"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer shadow-md"
            @click="currentQuestionIndex++"
          >
            Next Question &rarr;
          </button>
          <button
            v-else
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
            @click="handleSubmitExam"
          >
            {{ isSubmitting ? 'Grading Responses...' : 'Finish & Submit Exam' }}
          </button>
        </div>
      </div>

      <!-- Question Palette Navigator (4 cols) -->
      <div class="lg:col-span-4 bg-gray-800 rounded-3xl p-6 border border-gray-700/60 shadow-xl space-y-4">
        <h3 class="text-xs font-mono font-bold uppercase text-gray-400">Question Palette</h3>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="(q, idx) in assessment?.questions"
            :key="q.id"
            :class="[
              'h-11 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center',
              currentQuestionIndex === idx
                ? 'ring-2 ring-emerald-400 bg-emerald-500 text-gray-950'
                : answers[q.id] !== undefined
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                : 'bg-gray-900 text-gray-400 border border-gray-700'
            ]"
            @click="currentQuestionIndex = idx"
          >
            {{ idx + 1 }}
          </button>
        </div>

        <div class="pt-4 border-t border-gray-700 space-y-2 text-xs text-gray-400 font-mono">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-md bg-emerald-500" />
            <span>Active Question</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-md bg-emerald-950 border border-emerald-500/40" />
            <span>Answered Question</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-md bg-gray-900 border border-gray-700" />
            <span>Unanswered Question</span>
          </div>
        </div>

        <div class="pt-4">
          <button
            :disabled="isSubmitting"
            class="w-full py-3 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs cursor-pointer shadow-sm"
            @click="handleSubmitExam"
          >
            End Test & Submit Now
          </button>
        </div>
      </div>
    </div>

    <!-- Submission & Auto-Graded Result Modal / Panel -->
    <div
      v-if="submissionResult"
      class="bg-gray-800 rounded-3xl p-8 border border-emerald-500/40 shadow-2xl space-y-6 animate-fade-in text-center"
    >
      <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
        <UIcon name="i-heroicons-check-circle" class="w-10 h-10" />
      </div>

      <div>
        <h2 class="text-2xl font-extrabold text-white">Examination Submitted & Automatically Graded</h2>
        <p class="text-xs text-gray-400 mt-1">
          Telemetry ledger synchronized with school examination server.
        </p>
      </div>

      <!-- Score Card -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto p-4 rounded-2xl bg-gray-900/80 border border-gray-700">
        <div>
          <div class="text-[10px] font-mono text-gray-400">CANDIDATE SCORE</div>
          <div class="text-2xl font-extrabold text-emerald-400">{{ submissionResult.score }} / {{ submissionResult.totalMarks }}</div>
        </div>
        <div>
          <div class="text-[10px] font-mono text-gray-400">PERCENTAGE</div>
          <div class="text-2xl font-extrabold text-emerald-400">{{ submissionResult.percentage }}%</div>
        </div>
        <div>
          <div class="text-[10px] font-mono text-gray-400">CORRECT ANSWERS</div>
          <div class="text-2xl font-extrabold text-white">{{ submissionResult.correctCount }} / {{ submissionResult.totalQuestions }}</div>
        </div>
        <div>
          <div class="text-[10px] font-mono text-gray-400">STATUS</div>
          <div class="text-2xl font-extrabold text-emerald-400">PASSED</div>
        </div>
      </div>

      <!-- Question-by-Question Explanations -->
      <div class="text-left space-y-3 max-w-2xl mx-auto pt-4 border-t border-gray-700">
        <h4 class="text-xs font-mono font-bold uppercase text-gray-400">Pedagogical Question Explanations</h4>
        <div
          v-for="(res, idx) in submissionResult.questionResults"
          :key="idx"
          class="p-4 rounded-2xl bg-gray-900/60 border border-gray-700 text-xs space-y-1"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-white">Question {{ idx + 1 }}</span>
            <span :class="['font-mono font-bold text-[10px]', res.isCorrect ? 'text-emerald-400' : 'text-red-400']">
              {{ res.isCorrect ? 'CORRECT' : 'INCORRECT' }}
            </span>
          </div>
          <p class="text-gray-300 leading-relaxed">{{ res.explanation }}</p>
        </div>
      </div>

      <div class="pt-4 flex items-center justify-center gap-4">
        <NuxtLink
          to="/dashboard/academics/gradebook"
          class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
        >
          View Broadsheet & Gradebook Collation &rarr;
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs transition-all"
        >
          Return to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
