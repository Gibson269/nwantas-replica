<script setup lang="ts">
import { useTenantStore } from '~/stores/tenant'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Admissions Openings & Application Portal | Nwantas'
})

const tenantStore = useTenantStore()
const isSuccess = ref(false)

const applicantForm = ref({
  schoolSlug: 'apex-academy',
  studentName: '',
  applyingForClass: 'JSS 1 Gold',
  parentName: '',
  parentPhone: '',
  parentEmail: ''
})

function handleSubmit() {
  isSuccess.value = true
}
</script>

<template>
  <div class="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
        <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-emerald-600" />
        <span>Centralized Admissions Pipeline</span>
      </div>
      <h1 class="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
        Apply to accredited schools, <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">fully online.</span>
      </h1>
      <p class="text-gray-600 text-sm sm:text-base mt-4 leading-relaxed">
        Browse institutions currently accepting digital admissions, upload necessary documentation, and sit automated CBT entrance examinations.
      </p>
    </div>

    <!-- Active Open Schools Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- School 1 -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span class="text-xs font-mono font-bold text-emerald-600">LEKKI PHASE 1, LAGOS</span>
            <h2 class="text-xl font-bold text-gray-900">Apex International Academy</h2>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
            ADMISSIONS OPEN
          </span>
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Open for JSS 1, JSS 2, and SS 1 Science & Arts. Integrated British-Nigerian dual curriculum with world-class STEM robotics and boarding facilities.
        </p>
        <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
          <div class="flex justify-between">
            <span class="text-gray-500">Entrance Exam:</span>
            <span class="font-bold text-gray-800">Online CBT or On-Campus</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Application Fee:</span>
            <span class="font-bold text-emerald-700">₦15,000</span>
          </div>
        </div>
      </div>

      <!-- School 2 -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <span class="text-xs font-mono font-bold text-emerald-600">KENSINGTON, LONDON</span>
            <h2 class="text-xl font-bold text-gray-900">Kingsway British College</h2>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
            ADMISSIONS OPEN
          </span>
        </div>
        <p class="text-xs text-gray-600 leading-relaxed">
          Full Cambridge IGCSE and A-Levels preparatory college. Now receiving international student applications for 2026/2027 entry.
        </p>
        <div class="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-xs space-y-1.5">
          <div class="flex justify-between">
            <span class="text-gray-500">Entrance Assessment:</span>
            <span class="font-bold text-gray-800">CAT4 Cognitive Testing</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Application Fee:</span>
            <span class="font-bold text-emerald-700">£120</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Application Form -->
    <div class="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
      <div class="pb-6 border-b border-gray-100 mb-6 text-center">
        <h3 class="text-xl font-bold text-gray-900">Direct Online Enrolment Application</h3>
        <p class="text-xs text-gray-500 mt-1">Submit applicant bio-data to be scheduled for the digital entrance test.</p>
      </div>

      <div v-if="isSuccess" class="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
        <UIcon name="i-heroicons-check-circle" class="w-12 h-12 text-emerald-600 mx-auto" />
        <h4 class="text-base font-bold text-emerald-950">Application Successfully Submitted</h4>
        <p class="text-xs text-emerald-800 leading-relaxed">
          Application Reference #APP-{{ Date.now().toString().slice(-6) }} has been received. Your child has been scheduled for the CBT Entrance Examination.
        </p>
        <NuxtLink
          to="/dashboard/cbt/take/asm-cbt-01"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md mt-2"
        >
          <span>Take Sample Entrance Test &rarr;</span>
        </NuxtLink>
      </div>

      <form v-else class="space-y-4 text-xs" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Target School</label>
            <select
              v-model="applicantForm.schoolSlug"
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none"
            >
              <option value="apex-academy">Apex International Academy</option>
              <option value="kingsway">Kingsway British College</option>
            </select>
          </div>
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Target Class Arm</label>
            <select
              v-model="applicantForm.applyingForClass"
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none"
            >
              <option value="JSS 1 Gold">JSS 1 Gold</option>
              <option value="JSS 2 Diamond">JSS 2 Diamond</option>
              <option value="SS 1 Science">SS 1 Science</option>
              <option value="SS 2 Science">SS 2 Science</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Applicant Full Name</label>
          <input
            v-model="applicantForm.studentName"
            type="text"
            required
            placeholder="e.g. Oluwaseun Adeleke"
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 focus:bg-white"
          >
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Parent / Guardian Name</label>
            <input
              v-model="applicantForm.parentName"
              type="text"
              required
              placeholder="e.g. Dr. K. Adeleke"
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 focus:bg-white"
            >
          </div>
          <div>
            <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Phone Number</label>
            <input
              v-model="applicantForm.parentPhone"
              type="tel"
              required
              placeholder="+234 803 000 0000"
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 focus:bg-white"
            >
          </div>
        </div>

        <div>
          <label class="block font-mono font-bold uppercase text-gray-500 mb-1">Parent Email</label>
          <input
            v-model="applicantForm.parentEmail"
            type="email"
            required
            placeholder="parent@gmail.com"
            class="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-emerald-500 focus:bg-white"
          >
        </div>

        <button
          type="submit"
          class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer mt-4"
        >
          Submit Admission Application
        </button>
      </form>
    </div>
  </div>
</template>
