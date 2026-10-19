<script setup lang="ts">
useHead({
  title: 'Register your Institution | Nwantas'
})

const currentStep = ref<1 | 2>(1)
const isSubmitting = ref(false)
const isCheckingSlug = ref(false)
const slugAvailable = ref<boolean | null>(null)
const registrationSuccess = ref(false)

const form = reactive({
  // Step 1: Personal
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  country: 'Nigeria',
  
  // Step 2: Institution
  schoolName: '',
  schoolSlug: '',
  packageId: 'pro',
  state: '',
  city: '',
  address: '',
  foundedYear: '',
  termsAccepted: false
})

const packages = [
  { id: 'standard', name: 'Standard Plan', price: '£0.75 / ₦500', desc: 'Everything a school needs to teach, assess, and communicate digitally.' },
  { id: 'pro', name: 'Pro Plan (Recommended)', price: '£1.10 / ₦850', desc: 'Run the finance side too, with payroll and automated fee collection built in.' },
  { id: 'plus', name: 'School Plus', price: '£1.90 / ₦1,500', desc: 'The full platform, automated end to end, with round-the-clock priority support.' },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Dedicated support and custom integrations for multi-campus groups.' }
]

let debounceTimer: any = null
function onSchoolNameInput() {
  if (form.schoolName.length >= 2) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      form.schoolSlug = form.schoolName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
      checkSlug()
    }, 400)
  }
}

function checkSlug() {
  if (!form.schoolSlug) return
  isCheckingSlug.value = true
  slugAvailable.value = null
  setTimeout(() => {
    isCheckingSlug.value = false
    slugAvailable.value = true
  }, 600)
}

function nextStep() {
  if (currentStep.value === 1) {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      alert('Please fill out all required personal fields.')
      return
    }
    currentStep.value = 2
  }
}

async function handleRegister() {
  if (!form.termsAccepted) {
    alert('Please accept the terms and conditions.')
    return
  }
  isSubmitting.value = true
  // Simulate database creation and tenant propagation
  setTimeout(() => {
    isSubmitting.value = false
    registrationSuccess.value = true
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 2500)
  }, 1500)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-xl">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center justify-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <span class="font-bold text-xl tracking-tight">N</span>
        </div>
        <span class="font-bold text-2xl tracking-tight text-gray-900">Nwantas</span>
      </NuxtLink>

      <!-- Stepper Header -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
          {{ currentStep === 1 ? 'Create your administrator account' : 'Configure your educational institution' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          {{ currentStep === 1 ? 'Step 1 of 2: Personal details' : 'Step 2 of 2: School profile and unique web address' }}
        </p>

        <!-- Stepper Indicators -->
        <div class="flex items-center justify-center gap-3 mt-6 max-w-xs mx-auto">
          <div :class="['flex-1 h-2 rounded-full transition-colors', currentStep >= 1 ? 'bg-emerald-600' : 'bg-gray-200']" />
          <div :class="['flex-1 h-2 rounded-full transition-colors', currentStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200']" />
        </div>
      </div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-xl px-4">
      <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-gray-100">
        <!-- Success Banner -->
        <div v-if="registrationSuccess" class="text-center py-8 space-y-4">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <UIcon name="i-heroicons-check" class="w-8 h-8" />
          </div>
          <h3 class="text-2xl font-bold text-gray-900">Institution Created Successfully!</h3>
          <p class="text-sm text-gray-600 max-w-sm mx-auto">
            Welcome to Nwantas! Preparing your tenant environment: <strong class="text-emerald-700">{{ form.schoolSlug }}.nwantas.com</strong>...
          </p>
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto mt-4" />
        </div>

        <form v-else @submit.prevent="currentStep === 1 ? nextStep() : handleRegister()">
          <!-- STEP 1: Personal Account -->
          <div v-if="currentStep === 1" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">First Name *</label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  placeholder="e.g. Gibson"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">Last Name *</label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  placeholder="e.g. Effiong"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">Email Address *</label>
              <input
                v-model="form.email"
                type="email"
                required
                placeholder="principal@yourschool.com"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">Phone Number *</label>
              <input
                v-model="form.phone"
                type="tel"
                required
                placeholder="+234 800 000 0000"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">Password *</label>
              <input
                v-model="form.password"
                type="password"
                required
                placeholder="••••••••••••"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
            </div>

            <button
              type="submit"
              class="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to School Setup</span>
              <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
            </button>
          </div>

          <!-- STEP 2: Institution Setup -->
          <div v-else class="space-y-5">
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">School / Institution Name *</label>
              <input
                v-model="form.schoolName"
                type="text"
                required
                placeholder="e.g. Apex International College"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                @input="onSchoolNameInput"
              >
            </div>

            <!-- Subdomain Web Address -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">Unique Subdomain *</label>
              <div class="flex items-center rounded-xl border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                <input
                  v-model="form.schoolSlug"
                  type="text"
                  required
                  placeholder="apex-college"
                  class="flex-1 px-4 py-2.5 text-sm outline-none border-none"
                  @input="checkSlug"
                >
                <span class="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-2.5 border-l border-gray-200 font-mono">
                  .nwantas.com
                </span>
              </div>
              <div class="mt-1.5 text-xs flex items-center gap-1.5">
                <span v-if="isCheckingSlug" class="text-gray-500">Checking availability...</span>
                <span v-else-if="slugAvailable === true" class="text-emerald-600 font-medium flex items-center gap-1">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Available!
                </span>
                <span class="text-gray-400">This will be your portal address.</span>
              </div>
            </div>

            <!-- Package Selection -->
            <div>
              <label class="block text-xs font-semibold text-gray-700 uppercase mb-2 font-mono">Select Institutional Package</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="pkg in packages"
                  :key="pkg.id"
                  :class="[
                    'p-3.5 rounded-xl border cursor-pointer transition-all',
                    form.packageId === pkg.id
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  ]"
                  @click="form.packageId = pkg.id"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-xs text-gray-900">{{ pkg.name }}</span>
                    <span class="text-[11px] font-semibold text-emerald-700 font-mono">{{ pkg.price }}</span>
                  </div>
                  <p class="text-[11px] text-gray-500 leading-tight">{{ pkg.desc }}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">State / County *</label>
                <input
                  v-model="form.state"
                  type="text"
                  required
                  placeholder="e.g. Lagos"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-700 uppercase mb-1.5 font-mono">Founded Year</label>
                <input
                  v-model="form.foundedYear"
                  type="text"
                  placeholder="e.g. 2012"
                  class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
              </div>
            </div>

            <!-- Terms acceptance -->
            <div class="flex items-start gap-2.5 pt-2">
              <input
                id="terms"
                v-model="form.termsAccepted"
                type="checkbox"
                required
                class="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              >
              <label for="terms" class="text-xs text-gray-600 leading-normal">
                I accept the <NuxtLink to="/terms" class="text-emerald-600 underline">Terms of Service</NuxtLink> and <NuxtLink to="/privacy-policy" class="text-emerald-600 underline">Privacy Policy</NuxtLink>.
              </label>
            </div>

            <div class="flex items-center gap-3 pt-4">
              <button
                type="button"
                class="w-1/3 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
                @click="currentStep = 1"
              >
                Back
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-2/3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                <span v-if="isSubmitting">Provisioning School...</span>
                <span v-else>Complete Registration</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Footer login link -->
      <div class="text-center mt-6 text-xs text-gray-500">
        Already have a school account?
        <NuxtLink to="/auth/login" class="text-emerald-600 font-semibold hover:underline">
          Sign in here
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
