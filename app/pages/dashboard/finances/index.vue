<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Bursary, School Wallet & Staff Payroll'
})

const { fetchApi } = useNwantasApi()
const tenantStore = useTenantStore()

const walletData = ref<any | null>(null)
const payrollRuns = ref<any[]>([])
const isLoading = ref(true)

// Hosted payment link generator modal state
const isLinkModalOpen = ref(false)
const linkStudentName = ref('Chidi Okonkwo')
const linkAmount = ref(350000)
const generatedLink = ref<string | null>(null)

async function loadFinances() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/wallet')
    walletData.value = res

    const payrollRes = await fetchApi('/api/v1/payroll/runs')
    payrollRuns.value = payrollRes.runs
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function handleGeneratePaymentLink() {
  const token = `pay_${Date.now().toString(36)}`
  generatedLink.value = `https://nwantas.com/payments/link/${token}`
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
          <UIcon name="i-heroicons-banknotes" class="w-3.5 h-3.5" />
          <span>BURSARY, MULTI-WALLET & DISBURSEMENT LEDGER</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Institutional Finances, Fees & Staff Payroll</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Dual-entry accounting ledger, tuition collections via Paystack/Flutterwave, and monthly staff payroll batch runs.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          @click="isLinkModalOpen = true"
        >
          <UIcon name="i-heroicons-link" class="w-4 h-4" />
          <span>Generate Hosted Payment Link</span>
        </button>
      </div>
    </div>

    <!-- Wallet Balance Cards -->
    <div v-if="walletData" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 rounded-3xl bg-gradient-to-tr from-emerald-800 to-green-700 text-white shadow-lg">
        <div class="text-xs font-mono uppercase text-emerald-200 mb-1">SCHOOL CENTRAL WALLET</div>
        <div class="text-3xl font-black">
          {{ tenantStore.currentTenant.symbol }}{{ (walletData.wallet.balance / 1000000).toFixed(2) }}M
        </div>
        <div class="text-xs text-emerald-100 mt-2 flex items-center justify-between">
          <span>{{ walletData.wallet.bankAccount.bankName }}</span>
          <span class="font-mono">{{ walletData.wallet.bankAccount.accountNumber }}</span>
        </div>
      </div>

      <div class="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="text-xs font-mono uppercase text-gray-400 mb-1">TOTAL TUITION COLLECTED (TERM 2)</div>
          <div class="text-3xl font-black text-gray-900">
            {{ tenantStore.currentTenant.symbol }}48,650,000
          </div>
        </div>
        <div class="text-xs text-emerald-600 font-mono mt-2">Reconciled with 94.2% collection rate</div>
      </div>

      <div class="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
        <div>
          <div class="text-xs font-mono uppercase text-gray-400 mb-1">MONTHLY SALARY DISBURSEMENT</div>
          <div class="text-3xl font-black text-gray-900">
            {{ tenantStore.currentTenant.symbol }}16,300,000
          </div>
        </div>
        <div class="text-xs text-gray-500 font-mono mt-2">86 Academic & Support Staff profiles</div>
      </div>
    </div>

    <!-- Two-Column Financial Layout: Fee Schedules & Payroll Runs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Fee Schedules -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h3 class="text-sm font-bold text-gray-900">Active Term Fee Schedules</h3>
          <span class="text-xs font-mono text-emerald-600 font-bold">Mandatory & Levies</span>
        </div>

        <div v-if="walletData" class="space-y-3">
          <div
            v-for="fee in walletData.feeSchedules"
            :key="fee.id"
            class="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs"
          >
            <div>
              <div class="font-bold text-gray-900">{{ fee.title }}</div>
              <div class="text-[10px] text-gray-500 font-mono">{{ fee.category }}</div>
            </div>
            <div class="text-sm font-extrabold text-emerald-700 font-mono">
              {{ tenantStore.currentTenant.symbol }}{{ fee.amount.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <!-- Staff Payroll Batch Runs -->
      <div class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h3 class="text-sm font-bold text-gray-900">Monthly Staff Payroll Engine</h3>
          <span class="text-xs font-mono text-emerald-600 font-bold">Batch Processing</span>
        </div>

        <div class="space-y-3">
          <div
            v-for="pr in payrollRuns"
            :key="pr.id"
            class="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all text-xs space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-900 text-sm">{{ pr.month }}</span>
              <span
                :class="[
                  'px-2 py-0.5 rounded font-mono text-[10px] font-bold',
                  pr.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                ]"
              >
                {{ pr.status }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 p-2 rounded-xl bg-gray-50 text-[11px] font-mono">
              <div>
                <span class="text-gray-400 block text-[9px]">STAFF</span>
                <span class="font-bold text-gray-800">{{ pr.totalStaff }} profiles</span>
              </div>
              <div>
                <span class="text-gray-400 block text-[9px]">DEDUCTIONS</span>
                <span class="font-bold text-red-600">-₦{{ (pr.deductions / 1000000).toFixed(2) }}M</span>
              </div>
              <div>
                <span class="text-gray-400 block text-[9px]">NET PAYOUT</span>
                <span class="font-bold text-emerald-700">₦{{ (pr.netDisbursement / 1000000).toFixed(2) }}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Hosted Payment Link Generator -->
    <div
      v-if="isLinkModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isLinkModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <h3 class="text-base font-bold text-gray-900">Generate Hosted Fee Payment Link</h3>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isLinkModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Student</label>
            <input
              v-model="linkStudentName"
              type="text"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
            >
          </div>
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Fee Amount ({{ tenantStore.currentTenant.symbol }})</label>
            <input
              v-model="linkAmount"
              type="number"
              class="w-full px-3 py-2 bg-gray-50 rounded-xl border border-gray-200"
            >
          </div>

          <div v-if="generatedLink" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <span class="text-emerald-900 font-bold block mb-1">Direct Secure Payment URL:</span>
            <input
              :value="generatedLink"
              readonly
              class="w-full bg-white px-2 py-1.5 rounded border border-emerald-300 font-mono text-[11px] text-emerald-800"
            >
            <span class="text-[10px] text-emerald-700 mt-1 block">Compatible with Paystack, Flutterwave, and card debit.</span>
          </div>
        </div>

        <div class="pt-6 border-t border-gray-100 mt-6 flex justify-end gap-3">
          <button
            class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs"
            @click="isLinkModalOpen = false"
          >
            Close
          </button>
          <button
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
            @click="handleGeneratePaymentLink"
          >
            Create Link
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
