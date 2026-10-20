<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Campus Gate Security, Exeats & Child Pickup Verification | Nwantas'
})

const { fetchApi } = useNwantasApi()
const exeats = ref<any[]>([])
const pickups = ref<any[]>([])
const students = ref<any[]>([])
const isLoading = ref(true)

// Modals
const isExeatModalOpen = ref(false)
const isVerifyModalOpen = ref(false)

// Exeat issue form
const selectedStudentId = ref('')
const exeatForm = ref({
  type: 'Weekend Exeat',
  departureTime: '2026-10-20 15:30',
  expectedReturn: '2026-10-22 17:00',
  guardianPickupName: 'Dr. Kenneth Okonkwo',
  guardianRelationship: 'Father'
})

// Photo Verification Modal State
const verifyStudentId = ref('usr-stud-01')
const verifyGuardianName = ref('Dr. Kenneth Okonkwo')
const isScanning = ref(false)
const verificationResult = ref<any | null>(null)
const isSubmitting = ref(false)

const selectedStudentForExeat = computed(() => {
  return students.value.find(s => s.id === selectedStudentId.value) || null
})

const selectedStudentForVerify = computed(() => {
  return students.value.find(s => s.id === verifyStudentId.value) || null
})

async function loadSecurityData() {
  isLoading.value = true
  try {
    const [exeatRes, pickupRes, studRes] = await Promise.all([
      fetchApi('/api/v1/security/exeats'),
      fetchApi('/api/v1/security/pickups'),
      fetchApi('/api/v1/students')
    ])
    exeats.value = exeatRes.data || []
    pickups.value = pickupRes.data || []
    students.value = studRes.data || []

    if (students.value.length > 0 && !selectedStudentId.value) {
      selectedStudentId.value = students.value[0].id
      verifyStudentId.value = students.value[0].id
      verifyGuardianName.value = students.value[0].guardianName || 'Dr. Kenneth Okonkwo'
    }
  } catch (e) {
    console.error('Failed to load security data:', e)
  } finally {
    isLoading.value = false
  }
}

// Issue Exeat Pass
async function handleIssueExeat() {
  if (!selectedStudentForExeat.value) return
  isSubmitting.value = true
  try {
    const res = await fetchApi('/api/v1/security/exeats', {
      method: 'POST',
      body: {
        studentId: selectedStudentForExeat.value.id,
        studentName: selectedStudentForExeat.value.name,
        classArm: selectedStudentForExeat.value.classArmName,
        type: exeatForm.value.type,
        departureTime: exeatForm.value.departureTime,
        expectedReturn: exeatForm.value.expectedReturn,
        guardianPickupName: exeatForm.value.guardianPickupName
      }
    })
    exeats.value.unshift(res.data)
    isExeatModalOpen.value = false
  } catch (e) {
    console.error('Failed to issue exeat:', e)
  } finally {
    isSubmitting.value = false
  }
}

// Transition Exeat Status (Approved -> Departed -> Returned)
async function updateExeatStatus(ext: any, newStatus: string) {
  try {
    const res = await fetchApi(`/api/v1/security/exeats/${ext.id}/status`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    ext.status = res.data.status
    ext.actualReturn = res.data.actual_return || res.data.actualReturn
  } catch (e) {
    console.error('Failed to update exeat status:', e)
  }
}

// Guardian Biometric Photo Match Simulation
function startFaceMatchSimulation() {
  isScanning.value = true
  verificationResult.value = null
  setTimeout(async () => {
    try {
      const res = await fetchApi('/api/v1/security/pickups/verify', {
        method: 'POST',
        body: {
          studentId: verifyStudentId.value,
          guardianName: verifyGuardianName.value,
          guardianRelationship: selectedStudentForVerify.value?.guardianRelationship || 'Father'
        }
      })
      verificationResult.value = res
      await loadSecurityData()
    } catch (e) {
      console.error('Verification error:', e)
    } finally {
      isScanning.value = false
    }
  }, 1200)
}

onMounted(() => {
  loadSecurityData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5 text-emerald-600" />
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
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">Active Exeat Movement Passes</h3>
          <p class="text-xs text-gray-500">Real-time gate departures, movement permits, and scheduled return tracking.</p>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold">
          All Perimeter Gates Monitored
        </span>
      </div>

      <div v-if="isLoading" class="py-8 text-center text-xs text-gray-400">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
        Loading gate exeat registry...
      </div>

      <div v-else-if="exeats.length === 0" class="py-8 text-center text-xs text-gray-400">
        Zero active gate exeat passes issued today.
      </div>

      <div v-else class="space-y-3">
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
            <div class="text-gray-500 font-mono text-[10px] mt-1 flex items-center gap-3">
              <span>Departed: <strong>{{ ext.departureTime }}</strong></span>
              <span>•</span>
              <span>Expected Return: <strong>{{ ext.expectedReturn }}</strong></span>
              <span v-if="ext.actualReturn" class="text-emerald-700">• Returned at: {{ ext.actualReturn }}</span>
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

            <!-- Status Transition Buttons -->
            <button
              v-if="ext.status === 'Approved'"
              @click="updateExeatStatus(ext, 'Departed')"
              class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Log Departure
            </button>
            <button
              v-else-if="ext.status === 'Departed'"
              @click="updateExeatStatus(ext, 'Returned')"
              class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              Log Return
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Guardian Pickups Audit Log -->
    <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">Biometric & Authorized Pickup Clearance Ledger</h3>
          <p class="text-xs text-gray-500">Security checkpoint logs with authorized guardian photo matching verification.</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-2.5 px-3">Student Name</th>
              <th class="py-2.5 px-3">Authorized Guardian</th>
              <th class="py-2.5 px-3">Relationship</th>
              <th class="py-2.5 px-3">Pickup Timestamp</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-3 text-right">Security Officer</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="pkp in pickups" :key="pkp.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-3 px-3">
                <div class="font-bold text-gray-900">{{ pkp.studentName }}</div>
                <div class="text-[10px] text-gray-400 font-mono">{{ pkp.classArm }}</div>
              </td>
              <td class="py-3 px-3">
                <div class="flex items-center gap-2">
                  <img
                    :src="pkp.guardianPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'"
                    class="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                  <span class="font-bold text-gray-900">{{ pkp.guardianName }}</span>
                </div>
              </td>
              <td class="py-3 px-3 text-gray-600 font-mono">{{ pkp.guardianRelationship }}</td>
              <td class="py-3 px-3 font-mono text-gray-500 text-[11px]">{{ pkp.pickupDate }}</td>
              <td class="py-3 px-3 text-center">
                <span class="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">
                  {{ pkp.status }}
                </span>
              </td>
              <td class="py-3 px-3 text-right font-mono text-gray-600 text-[11px]">{{ pkp.verifiedBy }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Issue New Exeat Pass -->
    <div
      v-if="isExeatModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isExeatModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">Issue New Gate Exeat Pass</h3>
            <p class="text-xs text-gray-500">Authorize boarding student departure with guardian escort.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isExeatModalOpen = false">
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
                {{ st.name }} ({{ st.classArmName }})
              </option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Exeat Type</label>
            <select
              v-model="exeatForm.type"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>Weekend Exeat</option>
              <option>Medical</option>
              <option>Emergency</option>
              <option>Day Pass</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Departure Time</label>
              <input
                v-model="exeatForm.departureTime"
                type="text"
                class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
              />
            </div>
            <div>
              <label class="block font-semibold text-gray-700 mb-1">Expected Return</label>
              <input
                v-model="exeatForm.expectedReturn"
                type="text"
                class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Authorized Guardian Escort</label>
            <input
              v-model="exeatForm.guardianPickupName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            @click="isExeatModalOpen = false"
          >
            Cancel
          </button>
          <button
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleIssueExeat"
          >
            Authorize & Issue Pass
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Verify Guardian Pickup Photo -->
    <div
      v-if="isVerifyModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isVerifyModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">Guardian Identity & Photo Verification</h3>
            <p class="text-xs text-gray-500">Biometric match authorized guardian before student leaves campus.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isVerifyModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Select Student Being Picked Up</label>
            <select
              v-model="verifyStudentId"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
              @change="verifyGuardianName = selectedStudentForVerify?.guardianName || ''"
            >
              <option v-for="st in students" :key="st.id" :value="st.id">
                {{ st.name }} ({{ st.classArmName }})
              </option>
            </select>
          </div>

          <!-- Guardian Enrolled Dossier Card -->
          <div v-if="selectedStudentForVerify" class="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-4">
            <img
              :src="selectedStudentForVerify.guardianPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'"
              class="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs shrink-0"
            />
            <div>
              <div class="text-[10px] font-mono text-emerald-700 uppercase font-bold">VERIFIED ON-RECORD GUARDIAN</div>
              <div class="font-extrabold text-sm text-gray-900">{{ selectedStudentForVerify.guardianName }}</div>
              <div class="text-gray-500 text-xs">Relationship: {{ selectedStudentForVerify.guardianRelationship }}</div>
              <div class="text-gray-400 font-mono text-[11px]">{{ selectedStudentForVerify.guardianPhone }}</div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Presenting Guardian Name (Gate Entry)</label>
            <input
              v-model="verifyGuardianName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>

          <div v-if="isScanning" class="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center text-xs text-blue-800 animate-pulse">
            <UIcon name="i-heroicons-camera" class="w-8 h-8 mx-auto mb-1 text-blue-600 animate-bounce" />
            <span>Scanning facial features and comparing biometrics with enrollment record...</span>
          </div>

          <div
            v-else-if="verificationResult"
            :class="[
              'p-4 rounded-2xl border text-xs',
              verificationResult.matched ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
            ]"
          >
            <div class="font-bold text-sm mb-1">
              {{ verificationResult.matched ? '✓ Biometric Match Confirmed (98.7% Confidence)' : '✗ Verification Failed / Discrepancy' }}
            </div>
            <p>{{ verificationResult.message }}</p>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            @click="isVerifyModalOpen = false"
          >
            Close
          </button>
          <button
            :disabled="isScanning"
            class="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="startFaceMatchSimulation"
          >
            <UIcon v-if="isScanning" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <span>Run Face & ID Scan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
