<script setup lang="ts">
const activeCategory = ref<'ops' | 'academic' | 'ai' | 'finance' | 'community'>('ops')

const categories = [
  { id: 'ops', label: 'School Operations', icon: 'i-heroicons-building-office-2' },
  { id: 'academic', label: 'Academics & CBT', icon: 'i-heroicons-academic-cap' },
  { id: 'ai', label: 'AI Learning Suite', icon: 'i-heroicons-sparkles' },
  { id: 'finance', label: 'Finance & Payroll', icon: 'i-heroicons-banknotes' },
  { id: 'community', label: 'Community & Gov', icon: 'i-heroicons-user-group' }
]

const featuresByCategory: Record<string, Array<{ title: string; subtitle: string; desc: string; icon: string; badge?: string }>> = {
  ops: [
    {
      title: 'Digital Admissions Pipeline',
      subtitle: 'Cycles, Entrance Exams & Document Verification',
      desc: 'Define academic admission cycles, receive online/paper applications, mandate document uploads, and attach automated entrance CBT test papers.',
      icon: 'i-heroicons-user-plus',
      badge: 'Automated'
    },
    {
      title: 'Student Information System (SIS)',
      subtitle: 'Complete Academic Lifecycles',
      desc: 'Manage student profiles, emergency contacts, parent linkage, and automated progression pipelines (promotions, demotions, graduation, certificates).',
      icon: 'i-heroicons-identification'
    },
    {
      title: 'Hostel & Bed Accommodation',
      subtitle: 'Buildings, Rooms & Vacancy Trackers',
      desc: 'Hierarchy of hostels, room types, and bed capacities. Real-time vacancy queries, online applications, and warden gate sign-in/sign-out logs.',
      icon: 'i-heroicons-home'
    },
    {
      title: 'Campus Security & Child Safety',
      subtitle: 'Exeat Movements & Authorized Pickup',
      desc: 'Student movement control permits (exeat tracking), biometric/photo authorized guardian pickup verification, and incident report dispatching.',
      icon: 'i-heroicons-shield-check',
      badge: 'Safety First'
    }
  ],
  academic: [
    {
      title: 'AI Lesson Planning Suite',
      subtitle: 'Collaborative Review & Approval Workflow',
      desc: 'Generate syllabus-aligned lesson plans with AI. Review with threaded inline comments, resolve teacher-HOD feedback, and publish directly to students.',
      icon: 'i-heroicons-document-text',
      badge: 'AI Powered'
    },
    {
      title: 'Assessments & Anti-Cheat CBT',
      subtitle: 'Proctored Computer-Based Testing',
      desc: 'Quizzes, continuous assessments, and exams with server-synchronized timers and anti-cheat event monitoring (tab switches, blur, copy-paste telemetry).',
      icon: 'i-heroicons-computer-desktop',
      badge: 'Proctored'
    },
    {
      title: 'Automated Gradebook & Broadsheets',
      subtitle: 'Configurable Weightages & Collation',
      desc: 'Dynamic Continuous Assessment weightages (10% quiz, 20% midterm, 70% exam). 1-click grade collation across cohorts and downloadable PDF report cards.',
      icon: 'i-heroicons-chart-bar'
    },
    {
      title: 'Curriculum & Class Arms',
      subtitle: 'Terms, Classes & Multi-Teacher Mapping',
      desc: 'Structure 3-term or 2-semester academic sessions, configure class levels (JSS1 Gold, Grade 10 A), and assign multiple teachers per subject.',
      icon: 'i-heroicons-calendar-days'
    }
  ],
  ai: [
    {
      title: 'Conversational AI Tutor',
      subtitle: 'Personalized Adaptive Study Assistant',
      desc: 'Tailored study plans generated from syllabus topics or student performance gaps. Interactive step-by-step tutoring modules and practice drills.',
      icon: 'i-heroicons-sparkles',
      badge: 'Next Gen'
    },
    {
      title: 'Instant Concept Explainer',
      subtitle: 'Contextual Highlight Clarification',
      desc: 'Students can highlight any confusing text in digital materials to receive instant, simplified explanations and analogies tailored to their grade level.',
      icon: 'i-heroicons-light-bulb'
    },
    {
      title: 'Past Questions Bank',
      subtitle: 'Exam & Practice Interactive Modes',
      desc: 'Curated national exam past papers (WAEC, JAMB, GCSE, IGCSE) with timed exam simulation, instant answer analysis, and topic weakness breakdowns.',
      icon: 'i-heroicons-clipboard-document-check'
    },
    {
      title: 'AI Analytics & Study Planner',
      subtitle: 'Empowering Parents & Students',
      desc: 'Parental visibility into study hours, completed modules, concept mastery, and automated study schedules ahead of examinations.',
      icon: 'i-heroicons-chart-pie'
    }
  ],
  finance: [
    {
      title: 'Multi-Wallet Accounting',
      subtitle: 'School, Staff & Government Wallets',
      desc: 'Segregated wallets for school revenue, staff expense reimbursements, and government statutory commissions with full double-entry audit trails.',
      icon: 'i-heroicons-wallet',
      badge: 'Multi-Currency'
    },
    {
      title: 'Automated Tuition & Fee Billing',
      subtitle: 'Instalment Plans & Hosted Links',
      desc: 'Create fee categories (tuition, uniforms, laboratory, excursions). Generate flexible instalment plans and shareable payment links with Paystack, Flutterwave, and Stripe.',
      icon: 'i-heroicons-banknotes'
    },
    {
      title: 'Institutional Staff Payroll',
      subtitle: 'Salary Structures & Direct Payouts',
      desc: 'Staff salary tier profiles, statutory tax and pension deduction calculations, batch payroll approval runs, automated disbursements, and PDF payslips.',
      icon: 'i-heroicons-currency-dollar'
    },
    {
      title: 'Donations & Fundraising',
      subtitle: 'Alumni & Community Campaigns',
      desc: 'Launch dedicated school development fundraising campaigns, accept localized donations, and track campaign milestones with public transparency.',
      icon: 'i-heroicons-heart'
    }
  ],
  community: [
    {
      title: 'GoChats Real-Time Messaging',
      subtitle: 'WebSocket Multi-Channel Network',
      desc: '1-on-1 direct messages, class channels, and department groups with typing indicators, emoji reactions, and 10MB document uploads.',
      icon: 'i-heroicons-chat-bubble-left-right',
      badge: 'WebSockets'
    },
    {
      title: 'Dedicated Parent Portal',
      subtitle: 'Multi-Child Siblings Switcher',
      desc: 'Single-login portal allowing parents to switch between children to inspect daily attendance, view term report cards, settle fees, and book teacher office hours.',
      icon: 'i-heroicons-user-group'
    },
    {
      title: 'Government & Ministry Oversight',
      subtitle: 'Compliance Inspections & Standards',
      desc: 'State and federal ministry inspection tools: accreditation categories, citations (School Flags), statutory data returns, and national curricula syndication.',
      icon: 'i-heroicons-building-library',
      badge: 'Regulatory'
    },
    {
      title: 'Inter-School Competitions',
      subtitle: 'Multi-Round Tournament Brackets',
      desc: 'Host intra-school and inter-school academic tournaments across multiple knockout rounds with real-time public leaderboards.',
      icon: 'i-heroicons-trophy'
    }
  ]
}
</script>

<template>
  <section id="features" class="py-24 sm:py-28 bg-white border-t border-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-14">
        <p class="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-emerald-700 mb-3">
          Architecture
        </p>
        <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-4">
          All 20 institutional modules in one platform
        </h2>
        <p class="text-base sm:text-lg text-gray-600 leading-relaxed">
          From the school gate to the classroom, exam hall, bursary, and government inspectorate — everything operates synchronously.
        </p>

        <!-- Category Selector Tabs -->
        <div class="flex flex-wrap items-center justify-center gap-2 mt-8">
          <button
            v-for="cat in categories"
            :key="cat.id"
            :class="[
              'flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all',
              activeCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
            @click="activeCategory = (cat.id as any)"
          >
            <UIcon :name="cat.icon" class="w-4 h-4" />
            {{ cat.label }}
          </button>
        </div>
      </div>

      <!-- Features Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          v-for="feat in featuresByCategory[activeCategory]"
          :key="feat.title"
          class="p-8 rounded-2xl bg-gray-50/70 border border-gray-200/80 hover:border-emerald-500/50 hover:bg-white hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-5">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <UIcon :name="feat.icon" class="w-6 h-6" />
              </div>
              <span
                v-if="feat.badge"
                class="font-mono text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full"
              >
                {{ feat.badge }}
              </span>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
              {{ feat.title }}
            </h3>
            <p class="text-xs font-semibold text-emerald-600 mb-3 uppercase tracking-wider font-mono">
              {{ feat.subtitle }}
            </p>
            <p class="text-sm text-gray-600 leading-relaxed">
              {{ feat.desc }}
            </p>
          </div>

          <div class="mt-6 pt-5 border-t border-gray-200/60 flex items-center gap-2 text-xs font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
            <span>Explore module workflows</span>
            <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
