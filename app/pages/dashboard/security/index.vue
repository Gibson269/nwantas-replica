<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Campus Gate Security, Exeats & Child Pickup Verification'
})

const { fetchApi } = useNwantasApi()
const exeats = ref<any[]>([])
const isLoading = ref(true)

// Exeat issue form
const isExeatModalOpen = ref(false)
const studentName = ref('Chidi Okonkwo')
const classArm = ref('SS 2 Science')
const exeatType = ref<'Weekend Exeat' | 'Medical' | 'Emergency' | 'Day Pass'>('Weekend Exeat')
const expectedReturn = ref('2026-10-21 17:00')
const guardianName = ref('Dr. Kenneth Okonkwo')

// Photo Verification Modal
const isVerifyModalOpen = ref(false)
const verificationResult = ref<string | null>(null)

async function loadExeats() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/security/exeats')
    exeats.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function handleIssueExeat() {
  try {
    const res = await fetchApi('/api/v1/security/exeats', {
      method: 'POST',
      body: {
        studentName: studentName.value,
        classArm: classArm.value,
        type: exeatType.value,
        expectedReturn: expectedReturn.value,
        guardianPickupName: guardianName.value
      }
    })
    exeats.value.unshift(res.data)
    isExeatModalOpen.value = false
  } catch (e) {
    console.error(e)
  }
}

async function handleVerifyPickup() {
  try {
    const res = await fetchApi('/api/v1/security/pickups/verify', {
      method: 'POST',
      body: {
        studentId: 'usr-stud-01',
        guardianName: 'Dr. Kenneth Okonkwo',
        guardianRelationship: 'Father'
      }
    })
    verificationResult.value = res.message
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadExeats()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
          <span>CAMPUS PERIMETER & CHILD SAFEGUARDING</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Campus Gate Security & Child Safety</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Student exeat movement control, gate passes, authorized guardian pickup photo matching, and security incident logging.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          @click="isVerifyModalOpen = true"
        >
          <UIcon name="i-heroicons-camera" class="w-4 h-4 text-emerald-400" />
          <span>Verify Guardian Pickup Photo</span>
        </button>
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          @click="isExeatModalOpen = true"
        >
          <UIcon name="i-heroicons-ticket" class="w-4 h-4" />
          <span>Issue New Gate Exeat Pass</span>
        </button>
      </div>
    </div>

    <!-- Active Exeats Ledger -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h3 class="text-sm font-bold text-gray-900">Active Exeat Movement Passes</h3>
          <p class="text-xs text-gray-500">Real-time gate departures and scheduled return dates</p>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
          All Gates Monitored
        </span>
      </div>

      <div class="space-y-3">
        <div
          v-for="ext in exeats"
          :key="ext.id"
          class="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900 text-sm">{{ ext.studentName }}</span>
              <span class="px-2 py-0.5 rounded font-mono text-[10px] bg-gray-100 text-gray-700">{{ ext.classArm }}</span>
              <span class="px-2 py-0.5 rounded-full font-mono text-[10px] bg-purple-100 text-purple-800 font-bold">{{ ext.type }}</span>
            </div>
            <div class="text-gray-500 text-[11px]">
              Guardian Escort: <span class="font-semibold text-gray-800">{{ ext.guardianPickupName }}</span> • Approved by: {{ ext.approvedBy }}
            </div>
            <div class="text-gray-500 font-mono text-[10px] mt-1">
              Departed: {{ ext.departureTime }} | Expected Return: {{ ext.expectedReturn }}
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span
              :class="[
                'px-3 py-1 rounded-xl text-xs font-mono font-semibold',
                ext.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                ext.status === 'Departed' ? 'bg-amber-100 text-amber-800' :
                'bg-blue-100 text-blue-800'
              ]"
            >
              {{ ext.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Issue Exeat Pass -->
    <div
      v-if="isExeatModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isExeatModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h3 class="text-base font-bold text-gray-900">Issue Campus Gate Exeat Pass</h3>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isExeatModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Student</label>
            <input
              v-model="studentName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
            >
          </div>
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Exeat Classification</label>
            <select
              v-model="exeatType"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
            >
              <option value="Weekend Exeat">Weekend Exeat</option>
              <option value="Medical">Medical Clinic Pass</option>
              <option value="Emergency">Family Emergency Pass</option>
              <option value="Day Pass">Official Day Pass</option>
            </select>
          </div>
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Authorized Guardian Escort</label>
            <input
              v-model="guardianName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
            >
          </div>
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Expected Return Date & Time</label>
            <input
              v-model="expectedReturn"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
            >
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 mt-6 flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs"
            @click="isExeatModalOpen = false"
          >
            Cancel
          </button>
          <button
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleIssueExeat"
          >
            Authorize Gate Pass
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Verify Guardian Pickup Photo (Anti-abduction safeguard) -->
    <div
      v-if="isVerifyModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isVerifyModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 text-center">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6 text-left">
          <div>
            <h3 class="text-base font-bold text-gray-900">Child Safeguarding: Guardian Biometric & Photo Match</h3>
            <p class="text-xs text-gray-500">Cross-reference person at gate with registered guardian photo on file</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isVerifyModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-6">
          <div class="flex items-center justify-center gap-6">
            <div class="text-center">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                class="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500 mx-auto shadow-md"
              >
              <div class="font-bold text-xs text-gray-900 mt-2">Dr. Kenneth Okonkwo</div>
              <div class="text-[10px] text-emerald-600 font-mono font-bold">Registered Father Profile</div>
            </div>
          </div>

          <div v-if="verificationResult" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs text-left">
            <div class="font-bold flex items-center gap-1.5 mb-1">
              <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-emerald-600" />
              <span>Identity Verified & Cleared</span>
            </div>
            <p>{{ verificationResult }}</p>
          </div>

          <button
            v-if="!verificationResult"
            class="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
            @click="handleVerifyPickup"
          >
            Confirm Photo Match & Open Gate 1
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
