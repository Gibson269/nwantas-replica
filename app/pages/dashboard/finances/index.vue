<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Bursary, School Central Wallet & Staff Payroll | Nwantas'
})

const { fetchApi } = useNwantasApi()
const tenantStore = useTenantStore()

const activeTab = ref<'overview' | 'schedules' | 'payroll'>('overview')
const walletData = ref<any | null>(null)
const payrollRuns = ref<any[]>([])
const isLoading = ref(true)

// Modals
const isLinkModalOpen = ref(false)
const isAddFeeModalOpen = ref(false)
const isNewPayrollModalOpen = ref(false)
const isRecordPaymentModalOpen = ref(false)

// Payment Link State
const linkStudentName = ref('Chidi Okonkwo')
const linkPurpose = ref('Senior Secondary Tuition (Term 2)')
const linkAmount = ref(350000)
const generatedLink = ref<string | null>(null)
const linkCopied = ref(false)
const isSettlingLink = ref(false)

// New Fee State
const newFeeForm = ref({
  title: '',
  amount: 25000,
  category: 'Mandatory'
})

// New Payroll State
const newPayrollForm = ref({
  month: 'November 2026',
  totalStaff: 86,
  grossSalary: 18450000,
  deductions: 2150000
})

// Offline Payment State
const recordPaymentForm = ref({
  studentName: 'Chidi Okonkwo',
  type: 'Tuition Fee Payment',
  amount: 350000,
  channel: 'Direct Bank Settlement (Zenith)'
})

const isSubmitting = ref(false)

async function loadFinances() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/wallet')
    walletData.value = res

    const payrollRes = await fetchApi('/api/v1/payroll/runs')
    payrollRuns.value = payrollRes.runs || []
  } catch (e) {
    console.error('Failed to load finances:', e)
  } finally {
    isLoading.value = false
  }
}

// Generate Hosted Payment Link
function handleGeneratePaymentLink() {
  const token = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`
  generatedLink.value = `https://nwantas.com/payments/checkout/${token}`
  linkCopied.value = false
}

async function copyLink() {
  if (!generatedLink.value) return
  try {
    await navigator.clipboard.writeText(generatedLink.value)
    linkCopied.value = true
    setTimeout(() => { linkCopied.value = false }, 3000)
  } catch (e) {
    console.error('Copy failed:', e)
  }
}

// Simulate Instant Parent Payment via Gateway
async function simulateInstantPayment() {
  isSettlingLink.value = true
  try {
    await fetchApi('/api/v1/wallet/charges/create', {
      method: 'POST',
      body: {
        studentName: linkStudentName.value,
        amount: linkAmount.value,
        type: linkPurpose.value,
        channel: 'Paystack Card Checkout (Simulated)',
        settleImmediately: true
      }
    })
    isLinkModalOpen.value = false
    await loadFinances()
  } catch (e) {
    console.error('Failed to simulate payment:', e)
  } finally {
    isSettlingLink.value = false
  }
}

// Add Fee Schedule
async function handleCreateFee() {
  if (!newFeeForm.value.title || !newFeeForm.value.amount) return
  isSubmitting.value = true
  try {
    await fetchApi('/api/v1/wallet/fee-schedules', {
      method: 'POST',
      body: newFeeForm.value
    })
    isAddFeeModalOpen.value = false
    newFeeForm.value = { title: '', amount: 25000, category: 'Mandatory' }
    await loadFinances()
  } catch (e) {
    console.error('Failed to add fee schedule:', e)
  } finally {
    isSubmitting.value = false
  }
}

// Delete Fee Schedule
async function handleDeleteFee(id: string) {
  if (!confirm('Are you sure you want to delete this fee item?')) return
  try {
    await fetchApi(`/api/v1/wallet/fee-schedules/${id}`, { method: 'DELETE' })
    await loadFinances()
  } catch (e) {
    console.error('Failed to delete fee:', e)
  }
}

// Record Manual / Bank Payment
async function handleRecordPayment() {
  if (!recordPaymentForm.value.studentName || !recordPaymentForm.value.amount) return
  isSubmitting.value = true
  try {
    await fetchApi('/api/v1/wallet/charges/create', {
      method: 'POST',
      body: {
        studentName: recordPaymentForm.value.studentName,
        amount: recordPaymentForm.value.amount,
        type: recordPaymentForm.value.type,
        channel: recordPaymentForm.value.channel,
        settleImmediately: true
      }
    })
    isRecordPaymentModalOpen.value = false
    await loadFinances()
  } catch (e) {
    console.error('Failed to record payment:', e)
  } finally {
    isSubmitting.value = false
  }
}

// Authorize & Disburse Payroll Run
const isDisbursing = ref<string | null>(null)
async function handleDisbursePayroll(runId: string) {
  if (!confirm('Authorize final staff payroll disbursement? This will debit the Central School Wallet and record all statutory remittances.')) return
  isDisbursing.value = runId
  try {
    await fetchApi(`/api/v1/payroll/${runId}/disburse`, {
      method: 'POST',
      body: { approver: 'Chief Anthony Balogun (Proprietor)' }
    })
    await loadFinances()
  } catch (e) {
    console.error('Disbursement failed:', e)
  } finally {
    isDisbursing.value = null
  }
}

// Create New Payroll Run
async function handleCreatePayroll() {
  isSubmitting.value = true
  try {
    await fetchApi('/api/v1/payroll/runs', {
      method: 'POST',
      body: newPayrollForm.value
    })
    isNewPayrollModalOpen.value = false
    await loadFinances()
  } catch (e) {
    console.error('Failed to create payroll batch run:', e)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadFinances()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-banknotes" class="w-3.5 h-3.5 text-emerald-600" />
          <span>BURSARY, MULTI-WALLET & DISBURSEMENT LEDGER</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Institutional Finances, Fees & Staff Payroll</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Dual-entry accounting ledger, tuition collections via Paystack/Flutterwave, and monthly staff payroll batch runs.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all cursor-pointer"
          @click="isRecordPaymentModalOpen = true"
        >
          <UIcon name="i-heroicons-plus-circle" class="w-4 h-4" />
          <span>Record Offline Settlement</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          @click="isLinkModalOpen = true"
        >
          <UIcon name="i-heroicons-link" class="w-4 h-4" />
          <span>Generate Payment Link</span>
        </button>
      </div>
    </div>

    <!-- Central Wallet Cards -->
    <div v-if="walletData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Main Wallet Card -->
      <div class="p-6 rounded-3xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-green-600 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
        <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div>
          <div class="flex items-center justify-between text-xs font-mono uppercase text-emerald-200 mb-1">
            <span>SCHOOL CENTRAL WALLET</span>
            <span class="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">ACTIVE</span>
          </div>
          <div class="text-3xl font-black tracking-tight">
            {{ tenantStore.currentTenant.symbol }}{{ (walletData.wallet.balance).toLocaleString() }}
          </div>
        </div>

        <div class="pt-4 border-t border-white/20 text-xs text-emerald-100 mt-4 flex items-center justify-between font-mono">
          <span>{{ walletData.wallet.bankAccount.bankName }}</span>
          <span class="font-bold tracking-wider">{{ walletData.wallet.bankAccount.accountNumber }}</span>
        </div>
      </div>

      <!-- Tuition Collection Metric -->
      <div class="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div class="text-xs font-mono uppercase text-gray-400 mb-1">TOTAL TUITION COLLECTED (TERM 2)</div>
          <div class="text-3xl font-black text-gray-900">
            {{ tenantStore.currentTenant.symbol }}48,650,000
          </div>
        </div>
        <div>
          <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-3">
            <div class="bg-emerald-500 h-2 rounded-full w-[94.2%]" />
          </div>
          <div class="text-xs text-emerald-600 font-mono mt-2 flex items-center justify-between">
            <span>Reconciliation Index</span>
            <span class="font-bold">94.2% Cleared</span>
          </div>
        </div>
      </div>

      <!-- Monthly Payroll Metric -->
      <div class="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div class="text-xs font-mono uppercase text-gray-400 mb-1">ACTIVE MONTHLY PAYROLL RUN</div>
          <div class="text-3xl font-black text-gray-900">
            {{ tenantStore.currentTenant.symbol }}16,300,000
          </div>
        </div>
        <div class="text-xs text-gray-500 font-mono mt-2 flex items-center justify-between">
          <span>86 Academic & Support Staff</span>
          <span class="text-emerald-700 font-bold">October 2026 Ready</span>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 border-b border-gray-200 pb-2">
      <button
        @click="activeTab = 'overview'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
          activeTab === 'overview'
            ? 'bg-gray-900 text-white shadow-xs'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        <UIcon name="i-heroicons-credit-card" class="w-4 h-4" />
        <span>Recent Transactions Ledger</span>
      </button>

      <button
        @click="activeTab = 'schedules'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
          activeTab === 'schedules'
            ? 'bg-gray-900 text-white shadow-xs'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
        <span>Fee Schedules & Levies ({{ walletData?.feeSchedules?.length || 0 }})</span>
      </button>

      <button
        @click="activeTab = 'payroll'"
        :class="[
          'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
          activeTab === 'payroll'
            ? 'bg-gray-900 text-white shadow-xs'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        <UIcon name="i-heroicons-user-group" class="w-4 h-4" />
        <span>Staff Payroll Engine ({{ payrollRuns.length }})</span>
      </button>
    </div>

    <!-- Tab 1: Recent Transactions Ledger -->
    <div v-if="activeTab === 'overview'" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">Bursary Transactions & Settlements Ledger</h3>
          <p class="text-xs text-gray-500">Live dual-entry transactions recorded via gateways and direct bank payments.</p>
        </div>
        <button
          @click="loadFinances"
          class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
          title="Refresh ledger"
        >
          <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-gray-200 text-gray-400 font-mono uppercase text-[10px]">
              <th class="py-2.5 px-3">Transaction ID</th>
              <th class="py-2.5 px-3">Payer / Beneficiary</th>
              <th class="py-2.5 px-3">Description</th>
              <th class="py-2.5 px-3">Channel</th>
              <th class="py-2.5 px-3 text-right">Amount ({{ tenantStore.currentTenant.symbol }})</th>
              <th class="py-2.5 px-3 text-center">Status</th>
              <th class="py-2.5 px-3 text-right">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="tx in walletData?.recentTransactions" :key="tx.id" class="hover:bg-gray-50/60 transition-colors">
              <td class="py-3 px-3 font-mono font-bold text-gray-500">{{ tx.id }}</td>
              <td class="py-3 px-3 font-bold text-gray-900">{{ tx.studentName }}</td>
              <td class="py-3 px-3 text-gray-700">{{ tx.type }}</td>
              <td class="py-3 px-3 text-gray-600 font-mono text-[11px]">{{ tx.channel }}</td>
              <td class="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                +{{ tx.amount.toLocaleString() }}
              </td>
              <td class="py-3 px-3 text-center">
                <span class="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">
                  {{ tx.status }}
                </span>
              </td>
              <td class="py-3 px-3 text-right font-mono text-gray-500 text-[11px]">{{ tx.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Fee Schedules & Levies -->
    <div v-else-if="activeTab === 'schedules'" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">Term Fee Schedules & Statutory Levies</h3>
          <p class="text-xs text-gray-500">Configure itemized tuition levies, laboratory dues, boarding fees, and PTA levies.</p>
        </div>
        <button
          @click="isAddFeeModalOpen = true"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>Add Fee Schedule</span>
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="fee in walletData?.feeSchedules"
          :key="fee.id"
          class="p-5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between hover:border-emerald-300 transition-all"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-gray-900 text-sm">{{ fee.title }}</span>
              <span class="px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                {{ fee.category }}
              </span>
            </div>
            <div class="text-xs font-mono text-gray-400">ID: {{ fee.id }}</div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-lg font-black font-mono text-emerald-700">
                {{ tenantStore.currentTenant.symbol }}{{ fee.amount.toLocaleString() }}
              </div>
              <div class="text-[10px] text-gray-400 font-mono">Per Student / Term</div>
            </div>

            <button
              @click="handleDeleteFee(fee.id)"
              class="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete fee schedule"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 3: Staff Payroll Engine -->
    <div v-else-if="activeTab === 'payroll'" class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h3 class="text-base font-bold text-gray-900">Institutional Staff Remuneration & Payroll</h3>
          <p class="text-xs text-gray-500">Automated gross salary calculations, statutory pension/tax deductions, and proprietor disbursement clearance.</p>
        </div>
        <button
          @click="isNewPayrollModalOpen = true"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <UIcon name="i-heroicons-plus" class="w-4 h-4" />
          <span>New Monthly Batch</span>
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="pr in payrollRuns"
          :key="pr.id"
          class="p-5 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all space-y-3"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="text-base font-bold text-gray-900">{{ pr.month }}</h4>
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold',
                    pr.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  ]"
                >
                  {{ pr.status }}
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-0.5">
                Staff Count: <strong class="text-gray-900">{{ pr.totalStaff }} profiles</strong>
                <span v-if="pr.approvedBy" class="text-gray-400"> • Approved by: {{ pr.approvedBy }}</span>
              </div>
            </div>

            <div>
              <button
                v-if="pr.status !== 'Disbursed'"
                @click="handleDisbursePayroll(pr.id)"
                :disabled="isDisbursing === pr.id"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <UIcon v-if="isDisbursing === pr.id" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                <span>Authorize & Disburse Payout</span>
              </button>
              <div v-else class="text-right text-xs font-mono text-emerald-700 font-semibold">
                ✓ Disbursed on {{ pr.disbursedDate }}
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 text-xs font-mono">
            <div class="p-3 rounded-xl bg-gray-50">
              <span class="text-gray-400 block text-[10px]">GROSS SALARY</span>
              <span class="font-bold text-gray-900 text-sm">{{ tenantStore.currentTenant.symbol }}{{ (pr.grossSalary).toLocaleString() }}</span>
            </div>
            <div class="p-3 rounded-xl bg-red-50 text-red-700">
              <span class="text-red-400 block text-[10px]">STATUTORY DEDUCTIONS</span>
              <span class="font-bold text-sm">-{{ tenantStore.currentTenant.symbol }}{{ (pr.deductions).toLocaleString() }}</span>
            </div>
            <div class="p-3 rounded-xl bg-emerald-50 text-emerald-800">
              <span class="text-emerald-600 block text-[10px]">NET DISBURSEMENT PAYOUT</span>
              <span class="font-black text-sm">{{ tenantStore.currentTenant.symbol }}{{ (pr.netDisbursement).toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Hosted Payment Link Generator -->
    <div
      v-if="isLinkModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isLinkModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">Generate Hosted Fee Payment Link</h3>
            <p class="text-xs text-gray-500">Create an instant payment gateway link for parents.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isLinkModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Student Candidate</label>
            <input
              v-model="linkStudentName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Fee Purpose / Description</label>
            <input
              v-model="linkPurpose"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Amount ({{ tenantStore.currentTenant.symbol }})</label>
            <input
              v-model.number="linkAmount"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div v-if="generatedLink" class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
            <span class="text-emerald-900 font-bold block">Generated Secure Payment URL:</span>
            <div class="flex items-center gap-2">
              <input
                :value="generatedLink"
                readonly
                class="w-full bg-white px-2.5 py-1.5 rounded-lg border border-emerald-300 font-mono text-[11px] text-emerald-800"
              />
              <button
                @click="copyLink"
                class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer"
              >
                {{ linkCopied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
            <span class="text-[10px] text-emerald-700 block">Universal checkout compatible with Paystack, Flutterwave, USSD, and Card.</span>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            v-if="generatedLink"
            :disabled="isSettlingLink"
            @click="simulateInstantPayment"
            class="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold cursor-pointer"
          >
            {{ isSettlingLink ? 'Settling...' : 'Simulate Instant Payment' }}
          </button>
          <span v-else />

          <div class="flex items-center gap-2">
            <button
              class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
              @click="isLinkModalOpen = false"
            >
              Close
            </button>
            <button
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              @click="handleGeneratePaymentLink"
            >
              Generate Link
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Record Offline Payment -->
    <div
      v-if="isRecordPaymentModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isRecordPaymentModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">Record Offline Fee Settlement</h3>
            <p class="text-xs text-gray-500">Record bank drafts, POS teller deposits, or cash settlements.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isRecordPaymentModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Student Candidate</label>
            <input
              v-model="recordPaymentForm.studentName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Fee Description</label>
            <input
              v-model="recordPaymentForm.type"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Amount ({{ tenantStore.currentTenant.symbol }})</label>
            <input
              v-model.number="recordPaymentForm.amount"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Payment Channel / Bank</label>
            <select
              v-model="recordPaymentForm.channel"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            >
              <option>Direct Bank Settlement (Zenith)</option>
              <option>Campus POS Terminal</option>
              <option>Bank Certified Cheque</option>
              <option>Cash Deposit at Bursary</option>
            </select>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            @click="isRecordPaymentModalOpen = false"
          >
            Cancel
          </button>
          <button
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleRecordPayment"
          >
            Credit Wallet & Record
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Add Fee Schedule -->
    <div
      v-if="isAddFeeModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isAddFeeModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">Add Term Fee Schedule</h3>
            <p class="text-xs text-gray-500">Define a new billable fee item for the term.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isAddFeeModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Fee Item Title</label>
            <input
              v-model="newFeeForm.title"
              type="text"
              placeholder="e.g. Science Laboratory Maintenance Levy"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Amount ({{ tenantStore.currentTenant.symbol }})</label>
            <input
              v-model.number="newFeeForm.amount"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Category</label>
            <select
              v-model="newFeeForm.category"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            >
              <option>Mandatory</option>
              <option>Optional (Boarders)</option>
              <option>Special Levy</option>
              <option>Extracurricular</option>
            </select>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            @click="isAddFeeModalOpen = false"
          >
            Cancel
          </button>
          <button
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleCreateFee"
          >
            Save Fee Item
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: New Payroll Batch Run -->
    <div
      v-if="isNewPayrollModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isNewPayrollModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">Initiate Staff Payroll Batch Run</h3>
            <p class="text-xs text-gray-500">Calculate monthly remunerations and statutory remittances.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700 cursor-pointer" @click="isNewPayrollModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-gray-700 mb-1">Payroll Month</label>
            <input
              v-model="newPayrollForm.month"
              type="text"
              placeholder="e.g. November 2026"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Total Staff Enrolled</label>
            <input
              v-model.number="newPayrollForm.totalStaff"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Gross Salary ({{ tenantStore.currentTenant.symbol }})</label>
            <input
              v-model.number="newPayrollForm.grossSalary"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-gray-900"
            />
          </div>

          <div>
            <label class="block font-semibold text-gray-700 mb-1">Statutory Deductions ({{ tenantStore.currentTenant.symbol }})</label>
            <input
              v-model.number="newPayrollForm.deductions"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-bold text-red-600"
            />
          </div>

          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs flex items-center justify-between">
            <span class="text-emerald-800 font-bold">Net Outlay Required:</span>
            <span class="font-black text-emerald-900 text-sm">
              {{ tenantStore.currentTenant.symbol }}{{ (newPayrollForm.grossSalary - newPayrollForm.deductions).toLocaleString() }}
            </span>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs cursor-pointer"
            @click="isNewPayrollModalOpen = false"
          >
            Cancel
          </button>
          <button
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleCreatePayroll"
          >
            Submit for Owner Clearance
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
