<script setup lang="ts">
definePageMeta({
  layout: false
})

useHead({
  title: 'Nwantas | Complete School Management Platform',
  meta: [
    {
      name: 'description',
      content: 'All-in-one school management operating system: SIS, CBT testing, staff payroll, automated fees, AI tutor, parent portal, and government compliance.'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 selection:bg-emerald-500 selection:text-white">
    <!-- Navbar Header -->
    <LandingHeader />

    <!-- Hero Section with Glowing Aurora Backdrop -->
    <section class="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <!-- Floating Aurora Glow -->
      <div class="aurora-blob aurora-1" />
      <div class="aurora-blob aurora-2" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-xs font-semibold tracking-wide mb-8 shadow-sm">
          <UIcon name="i-heroicons-sparkles" class="w-4 h-4 text-emerald-600" />
          <span>Complete School OS & AI Tutoring Engine</span>
        </div>

        <!-- Main Headline -->
        <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight max-w-5xl mx-auto leading-[1.08] mb-6">
          Everything your school runs, unified in <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500">one platform.</span>
        </h1>

        <!-- Subheadline -->
        <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
          From student records, CBT exams, and fee collection to staff payroll, AI-assisted lesson planning, child safety, and government compliance reports.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <NuxtLink
            to="/register-school"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/25 active:scale-95 transition-all text-base"
          >
            <span>Start for free</span>
            <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
          </NuxtLink>
          <NuxtLink
            to="/#pricing"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-8 py-4 rounded-xl active:scale-95 transition-all text-base border border-gray-200"
          >
            <span>View pricing plans</span>
          </NuxtLink>
        </div>

        <!-- Hero Metric Preview Showcase -->
        <div class="relative max-w-5xl mx-auto rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-gray-900/10 to-gray-900/5 backdrop-blur-xl border border-gray-200 shadow-2xl">
          <div class="bg-gray-900 rounded-2xl p-6 sm:p-8 text-left text-white overflow-hidden shadow-inner relative">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-red-500" />
                <div class="w-3 h-3 rounded-full bg-yellow-500" />
                <div class="w-3 h-3 rounded-full bg-green-500" />
                <span class="text-xs font-mono text-gray-400 ml-2">nwantas-os // live-institution-monitor</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>

            <!-- Dashboard Metric Grid Cards -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div class="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60">
                <div class="text-xs text-gray-400 font-mono mb-1">TOTAL ENROLLED</div>
                <div class="text-2xl sm:text-3xl font-extrabold text-white">1,420</div>
                <div class="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <UIcon name="i-heroicons-arrow-trending-up" class="w-3.5 h-3.5" />
                  +12% this term
                </div>
              </div>
              <div class="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60">
                <div class="text-xs text-gray-400 font-mono mb-1">FEES COLLECTED</div>
                <div class="text-2xl sm:text-3xl font-extrabold text-white">₦28.4M</div>
                <div class="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <UIcon name="i-heroicons-check-circle" class="w-3.5 h-3.5" />
                  94.2% collected
                </div>
              </div>
              <div class="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60">
                <div class="text-xs text-gray-400 font-mono mb-1">ATTENDANCE RATE</div>
                <div class="text-2xl sm:text-3xl font-extrabold text-white">99.1%</div>
                <div class="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <UIcon name="i-heroicons-shield-check" class="w-3.5 h-3.5" />
                  All gates secure
                </div>
              </div>
              <div class="p-4 rounded-xl bg-gray-800/60 border border-gray-700/60">
                <div class="text-xs text-gray-400 font-mono mb-1">AI TUTOR SESSIONS</div>
                <div class="text-2xl sm:text-3xl font-extrabold text-white">6,840</div>
                <div class="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <UIcon name="i-heroicons-sparkles" class="w-3.5 h-3.5" />
                  Adaptive mastery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Ticker Bar -->
    <section class="py-12 border-y border-gray-100 bg-gray-50/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-xs font-mono font-semibold uppercase tracking-widest text-gray-400 mb-6">
          Architected for national & international regulatory standards
        </p>
        <div class="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-semibold text-gray-500">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-building-library" class="w-5 h-5 text-emerald-600" />
            <span>Ministry of Education Compliant</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-academic-cap" class="w-5 h-5 text-emerald-600" />
            <span>WAEC / JAMB / Cambridge Aligned</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-emerald-600" />
            <span>NDPR & GDPR Certified Security</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5 text-emerald-600" />
            <span>Paystack, Flutterwave & Stripe Integrated</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 20-Module Comprehensive Feature Grid -->
    <FeatureGrid />

    <!-- Interactive Pricing Section -->
    <PricingSection />

    <!-- Frequently Asked Questions -->
    <FAQSection />

    <!-- Pre-Footer Call to Action -->
    <section class="py-20 bg-emerald-700 text-white text-center relative overflow-hidden">
      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-6">
          Ready to transform how your school operates?
        </h2>
        <p class="text-base sm:text-lg text-emerald-100 max-w-xl mx-auto mb-10 leading-relaxed">
          Create your school account in less than 2 minutes. Free trial with complete feature access and automated migration support.
        </p>
        <NuxtLink
          to="/register-school"
          class="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-8 py-4 rounded-xl shadow-xl active:scale-95 transition-all text-base"
        >
          <span>Register your school now</span>
          <UIcon name="i-heroicons-arrow-right" class="w-5 h-5" />
        </NuxtLink>
      </div>
    </section>

    <!-- Platform Footer -->
    <footer class="bg-gray-950 text-gray-400 py-16 border-t border-gray-900 text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Platform</h4>
            <ul class="space-y-2.5 text-xs">
              <li><NuxtLink to="/#features" class="hover:text-white transition-colors">Features</NuxtLink></li>
              <li><NuxtLink to="/#pricing" class="hover:text-white transition-colors">Pricing</NuxtLink></li>
              <li><NuxtLink to="/admissions" class="hover:text-white transition-colors">Admissions</NuxtLink></li>
              <li><NuxtLink to="/past-questions" class="hover:text-white transition-colors">Past Questions</NuxtLink></li>
              <li><NuxtLink to="/competitions" class="hover:text-white transition-colors">Competitions</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Portals</h4>
            <ul class="space-y-2.5 text-xs">
              <li><NuxtLink to="/auth/login" class="hover:text-white transition-colors">Staff Login</NuxtLink></li>
              <li><NuxtLink to="/auth/login" class="hover:text-white transition-colors">Parent Portal</NuxtLink></li>
              <li><NuxtLink to="/auth/login" class="hover:text-white transition-colors">Student Dashboard</NuxtLink></li>
              <li><NuxtLink to="/auth/login" class="hover:text-white transition-colors">Government Inspectorate</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Legal & Trust</h4>
            <ul class="space-y-2.5 text-xs">
              <li><NuxtLink to="/privacy-policy" class="hover:text-white transition-colors">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/terms" class="hover:text-white transition-colors">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/cookie-policy" class="hover:text-white transition-colors">Cookie Policy</NuxtLink></li>
              <li><NuxtLink to="/sitemap" class="hover:text-white transition-colors">Sitemap</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h4 class="text-white font-semibold mb-4 text-xs uppercase tracking-wider font-mono">Contact & Support</h4>
            <ul class="space-y-2.5 text-xs">
              <li><a href="mailto:info@nwantas.com" class="hover:text-white transition-colors">info@nwantas.com</a></li>
              <li><a href="mailto:sales@nwantas.com" class="hover:text-white transition-colors">sales@nwantas.com</a></li>
              <li><NuxtLink to="/contact" class="hover:text-white transition-colors">Book a consultation</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© 2026 Nwantas Complete School Management. All rights reserved.</p>
          <div class="flex items-center gap-5">
            <a href="https://x.com/Nwantas_" target="_blank" class="hover:text-white transition-colors">Twitter (X)</a>
            <a href="https://www.linkedin.com/company/nwantas" target="_blank" class="hover:text-white transition-colors">LinkedIn</a>
            <a href="https://www.youtube.com/@nwantas" target="_blank" class="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
