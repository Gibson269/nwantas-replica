<script setup lang="ts">
const billingCycle = ref<'monthly' | 'yearly'>('yearly')

const plans = [
  {
    name: 'Standard',
    icon: 'i-heroicons-academic-cap',
    monthly: '£0.75',
    yearly: '£8',
    note: 'Unlimited free parent, teacher & admin accounts',
    description: 'Everything a school needs to teach, assess, and communicate digitally.',
    features: [
      'Student information system (SIS)',
      'Learning management system (LMS)',
      'Parent, staff & student communications',
      'AI assistance',
      'Computer-based tests (CBT)',
      'Results & report cards',
      'Unlimited parent, teacher & admin accounts, free'
    ],
    cta: 'Start for free',
    highlight: false
  },
  {
    name: 'Pro',
    icon: 'i-heroicons-bolt',
    monthly: '£1.10',
    yearly: '£13',
    note: 'Unlimited free parent, teacher & admin accounts',
    description: 'Run the finance side too, with payroll and fee collection built in.',
    features: [
      'Everything in Standard',
      'Staff payroll processing',
      'Automated tuition & fees collection',
      'Accounting & payment integrations',
      'Priority customer support'
    ],
    cta: 'Get started',
    highlight: true
  },
  {
    name: 'School Plus',
    icon: 'i-heroicons-sparkles',
    monthly: '£1.90',
    yearly: '£21',
    note: 'Unlimited free parent, teacher & admin accounts',
    description: 'The full platform, automated end to end, with round-the-clock support.',
    features: [
      'Everything in Pro',
      'Advanced administrative automation',
      'Unlimited AI tutoring & lesson planning',
      '24/7 priority dedicated support'
    ],
    cta: 'Get started',
    highlight: false
  },
  {
    name: 'Enterprise',
    icon: 'i-heroicons-building-office-2',
    monthly: 'Custom',
    yearly: 'Custom',
    note: 'Pricing for your institution',
    description: 'Dedicated support and custom solutions for large institutions and multi-campus groups.',
    features: [
      'Everything in School Plus',
      'Custom integrations & deep analytics',
      'Dedicated account manager',
      'Multi-campus conglomerate management'
    ],
    cta: 'Contact sales',
    href: 'mailto:sales@nwantas.com',
    highlight: false
  }
]
</script>

<template>
  <section id="pricing" class="py-24 sm:py-28 bg-[#FBFBFA]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <p class="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-emerald-700 mb-3">
          Pricing
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          Simple pricing plans
        </h2>
        <p class="text-base sm:text-lg text-gray-600 leading-relaxed">
          Transparent pricing that scales with your school. No hidden fees, no surprises. We only get paid when you get paid.
        </p>

        <!-- Billing Cycle Switcher -->
        <div class="inline-flex items-center p-1.5 bg-gray-100 rounded-xl mt-8">
          <button
            :class="[
              'px-5 py-2 text-sm font-semibold rounded-lg transition-all',
              billingCycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="billingCycle = 'monthly'"
          >
            Monthly
          </button>
          <button
            :class="[
              'relative px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2',
              billingCycle === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="billingCycle = 'yearly'"
          >
            Yearly
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Save 15%
            </span>
          </button>
        </div>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        <div
          v-for="plan in plans"
          :key="plan.name"
          :class="[
            'relative flex flex-col p-8 rounded-2xl bg-white border transition-all duration-300 hover:shadow-xl',
            plan.highlight
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <!-- Most Popular Badge -->
          <div
            v-if="plan.highlight"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 font-mono text-[11px] font-bold tracking-wider uppercase bg-emerald-600 text-white px-3.5 py-1 rounded-full shadow-sm"
          >
            Most Popular
          </div>

          <!-- Plan Title & Icon -->
          <div class="flex items-center gap-2.5 mb-5">
            <div
              :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center',
                plan.highlight ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
              ]"
            >
              <UIcon :name="plan.icon" class="w-4 h-4" />
            </div>
            <span class="font-bold text-gray-900 text-lg">{{ plan.name }}</span>
          </div>

          <!-- Price Display -->
          <div class="mb-5">
            <div class="flex items-baseline gap-1">
              <span class="text-4xl font-extrabold text-gray-900 tracking-tight">
                {{ billingCycle === 'monthly' ? plan.monthly : plan.yearly }}
              </span>
              <span v-if="plan.monthly !== 'Custom'" class="text-sm font-medium text-gray-500">
                /student/{{ billingCycle === 'monthly' ? 'mo' : 'yr' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1.5">{{ plan.note }}</p>
          </div>

          <p class="text-sm text-gray-600 leading-relaxed mb-6">{{ plan.description }}</p>

          <!-- Feature List -->
          <ul class="space-y-3 mb-8 flex-1">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2.5">
              <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span class="text-xs sm:text-sm text-gray-700 leading-snug">{{ feature }}</span>
            </li>
          </ul>

          <!-- Call to Action -->
          <a
            v-if="plan.href"
            :href="plan.href"
            class="w-full py-3 px-4 text-center text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-900 transition-colors"
          >
            {{ plan.cta }}
          </a>
          <NuxtLink
            v-else
            to="/register-school"
            :class="[
              'w-full py-3 px-4 text-center text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95',
              plan.highlight
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-gray-900 hover:bg-black text-white shadow-gray-900/10'
            ]"
          >
            {{ plan.cta }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
