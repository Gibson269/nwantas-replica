<script setup lang="ts">
useHead({
  title: 'Sign In | Nwantas Portal'
})

const selectedRole = ref<'admin' | 'teacher' | 'parent' | 'student' | 'gov'>('admin')
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const roles = [
  { id: 'admin', label: 'Admin / Owner', icon: 'i-heroicons-building-office-2' },
  { id: 'teacher', label: 'Teacher', icon: 'i-heroicons-academic-cap' },
  { id: 'parent', label: 'Parent', icon: 'i-heroicons-user-group' },
  { id: 'student', label: 'Student', icon: 'i-heroicons-identification' },
  { id: 'gov', label: 'Government', icon: 'i-heroicons-building-library' }
]

function handleLogin() {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    if (selectedRole.value === 'parent') {
      navigateTo('/parents/dashboard')
    } else {
      navigateTo('/dashboard')
    }
  }, 1000)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center justify-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <span class="font-bold text-xl tracking-tight">N</span>
        </div>
        <span class="font-bold text-2xl tracking-tight text-gray-900">Nwantas</span>
      </NuxtLink>

      <div class="text-center mb-6">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Sign in to your portal
        </h2>
        <p class="mt-1.5 text-xs text-gray-500">
          Select your institutional role to continue
        </p>
      </div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md px-4">
      <div class="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-gray-100">
        <!-- Role Tabs Switcher -->
        <div class="flex items-center justify-between p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
          <button
            v-for="r in roles"
            :key="r.id"
            type="button"
            :class="[
              'px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0',
              selectedRole === r.id ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            ]"
            @click="selectedRole = (r.id as any)"
          >
            <UIcon :name="r.icon" class="w-3.5 h-3.5" />
            <span>{{ r.label }}</span>
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <div>
            <label class="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">Institutional Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="user@school.com"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
          </div>

          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-semibold text-gray-700 uppercase font-mono">Password</label>
              <a href="#" class="text-xs text-emerald-600 hover:underline">Forgot password?</a>
            </div>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••••••"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
          >
            <span v-if="isLoading">Signing in...</span>
            <span v-else>Access {{ roles.find(r => r.id === selectedRole)?.label }} Portal</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
          </button>
        </form>

        <div class="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500">
          Need a new school account?
          <NuxtLink to="/register-school" class="text-emerald-600 font-semibold hover:underline">
            Register your school
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
