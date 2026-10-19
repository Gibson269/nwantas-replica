<script setup lang="ts">
const activeIndex = ref<string | null>('who-can-use')

function toggle(value: string) {
  activeIndex.value = activeIndex.value === value ? null : value
}

const faqs = [
  {
    value: 'who-can-use',
    title: 'Who can use Nwantas?',
    content: 'Nwantas is built for primary and secondary schools, all-through schools, and multi-school groups anywhere in the world. Roles on the platform include school owners, principals, teachers, finance officers, parents, and students, each with their own tailored dashboard.'
  },
  {
    value: 'what-provides',
    title: 'What does the platform cover?',
    content: 'Everything a school runs: student records, timetables, CBT and paper exams, fee collection with local and international payment providers, staff payroll, parent communication, AI-assisted lesson planning, government compliance reports, and child safety at the gate.'
  },
  {
    value: 'data-security',
    title: 'How secure is our data?',
    content: 'All data is encrypted in transit (TLS) and at rest. We follow NDPR and GDPR-aligned practices, perform regular audits, and keep your school\'s data isolated from other tenants. You own your data and can export it at any time.'
  },
  {
    value: 'pricing',
    title: 'How is Nwantas priced?',
    content: 'Pricing is per-school and scales with your student count. There is a free tier for small schools getting started. Larger schools and groups get volume discounts. No hidden fees. Fee processing costs are passed through at standard rates via our payment partners.'
  },
  {
    value: 'migration',
    title: 'How do we migrate from our current system?',
    content: 'Our onboarding team handles data migration. We accept CSV exports from most school management software and common data formats, map your existing records, and run a verification check before go-live. Most schools are fully live within two weeks.'
  },
  {
    value: 'finance-integrated',
    title: 'Can parents pay fees directly through the platform?',
    content: 'Yes. Parents receive a payment link and can settle fees by card, bank transfer, or USSD. The school wallet receives funds instantly, and the ledger updates in real time. Flexible payment plans and instalments are supported.'
  },
  {
    value: 'support',
    title: 'What support do you offer?',
    content: 'Every school gets a dedicated success manager for onboarding. Ongoing support is available via live chat, email, and phone during business hours. We also run regular webinars and maintain a full help centre in plain English.'
  }
]
</script>

<template>
  <section id="faq" class="py-24 sm:py-28 bg-[#FBFBFA] border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 lg:gap-16">
        <!-- Left Side Column -->
        <div>
          <p class="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-emerald-700 mb-3">
            Questions
          </p>
          <h2 class="font-display text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p class="text-sm text-gray-600 leading-relaxed mb-6">
            Everything you need to know about setting up and migrating your school's data.
          </p>
          <NuxtLink
            to="/contact"
            class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 group"
          >
            Contact our advisory team
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NuxtLink>
        </div>

        <!-- Right Side Accordion List -->
        <div class="divide-y divide-gray-200">
          <div
            v-for="faq in faqs"
            :key="faq.value"
            class="py-6 first:pt-0 last:pb-0"
          >
            <button
              class="flex items-center justify-between w-full text-left gap-4 group"
              @click="toggle(faq.value)"
            >
              <span class="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {{ faq.title }}
              </span>
              <UIcon
                name="i-heroicons-chevron-down"
                :class="[
                  'w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 shrink-0',
                  activeIndex === faq.value ? 'rotate-180 text-emerald-600' : ''
                ]"
              />
            </button>
            <div
              v-if="activeIndex === faq.value"
              class="mt-3.5 text-sm text-gray-600 leading-relaxed pr-8"
            >
              {{ faq.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
