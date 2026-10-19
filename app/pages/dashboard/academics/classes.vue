<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Classes & Curriculum Arms'
})

const { fetchApi } = useNwantasApi()

interface ClassArm {
  id: string
  tenantId?: string
  level: string
  arm: string
  displayName: string
  formTeacher: string
  studentCount: number
  capacity: number
  subjects: string[]
}

const classes = ref<ClassArm[]>([])
const isLoading = ref(true)
const searchFilter = ref('')
const selectedLevelFilter = ref('ALL')

// Modal State
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const feedbackMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

// Form State
const formData = reactive({
  level: 'JSS 1',
  arm: 'Gold',
  formTeacher: '',
  capacity: 35,
  subjects: [] as string[]
})

const newSubjectInput = ref('')

const POPULAR_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Basic Science',
  'Social Studies',
  'Civic Education',
  'Computer Studies',
  'Agricultural Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Literature in English',
  'Economics',
  'Government'
]

async function loadClasses() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/v1/classes')
    classes.value = res.data || []
  } catch (err: any) {
    console.error('Failed to load classes:', err)
  } finally {
    isLoading.value = false
  }
}

// Filtered Classes
const filteredClasses = computed(() => {
  return classes.value.filter(c => {
    const matchesSearch =
      c.displayName.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      c.formTeacher.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
      c.subjects.some(s => s.toLowerCase().includes(searchFilter.value.toLowerCase()))

    let matchesLevel = true
    if (selectedLevelFilter.value === 'JSS') {
      matchesLevel = c.level.startsWith('JSS')
    } else if (selectedLevelFilter.value === 'SS') {
      matchesLevel = c.level.startsWith('SS')
    }

    return matchesSearch && matchesLevel
  })
})

// Metrics
const totalEnrolled = computed(() => classes.value.reduce((acc, c) => acc + (c.studentCount || 0), 0))
const totalCapacity = computed(() => classes.value.reduce((acc, c) => acc + (c.capacity || 0), 0))
const avgClassSize = computed(() => classes.value.length ? Math.round(totalEnrolled.value / classes.value.length) : 0)
const nearCapacityCount = computed(() => classes.value.filter(c => (c.studentCount / (c.capacity || 1)) >= 0.9).length)

function openCreateModal() {
  isEditing.value = false
  editingId.value = null
  formData.level = 'JSS 1'
  formData.arm = 'Gold'
  formData.formTeacher = ''
  formData.capacity = 35
  formData.subjects = ['Mathematics', 'English Language', 'Basic Science', 'Civic Education']
  isModalOpen.value = true
}

function openEditModal(cls: ClassArm) {
  isEditing.value = true
  editingId.value = cls.id
  formData.level = cls.level
  formData.arm = cls.arm
  formData.formTeacher = cls.formTeacher
  formData.capacity = cls.capacity
  formData.subjects = [...cls.subjects]
  isModalOpen.value = true
}

function toggleSubject(sub: string) {
  const index = formData.subjects.indexOf(sub)
  if (index >= 0) {
    formData.subjects.splice(index, 1)
  } else {
    formData.subjects.push(sub)
  }
}

function addCustomSubject() {
  const trimmed = newSubjectInput.value.trim()
  if (trimmed && !formData.subjects.includes(trimmed)) {
    formData.subjects.push(trimmed)
    newSubjectInput.value = ''
  }
}

async function handleSaveClass() {
  if (!formData.level || !formData.arm.trim()) {
    feedbackMessage.value = { type: 'error', text: 'Level and Arm Name are required.' }
    return
  }

  isSubmitting.value = true
  feedbackMessage.value = null

  try {
    if (isEditing.value && editingId.value) {
      await fetchApi(`/api/v1/classes/${editingId.value}`, {
        method: 'PUT',
        body: {
          level: formData.level,
          arm: formData.arm,
          displayName: `${formData.level} ${formData.arm}`,
          formTeacher: formData.formTeacher || 'Unassigned',
          capacity: Number(formData.capacity),
          subjects: formData.subjects
        }
      })
      feedbackMessage.value = { type: 'success', text: `Class arm ${formData.level} ${formData.arm} updated successfully!` }
    } else {
      await fetchApi('/api/v1/classes', {
        method: 'POST',
        body: {
          level: formData.level,
          arm: formData.arm,
          displayName: `${formData.level} ${formData.arm}`,
          formTeacher: formData.formTeacher || 'Unassigned',
          capacity: Number(formData.capacity),
          subjects: formData.subjects
        }
      })
      feedbackMessage.value = { type: 'success', text: `Class arm ${formData.level} ${formData.arm} created successfully!` }
    }

    await loadClasses()
    setTimeout(() => {
      isModalOpen.value = false
      feedbackMessage.value = null
    }, 1200)
  } catch (err: any) {
    feedbackMessage.value = { type: 'error', text: err.data?.statusMessage || err.message || 'Operation failed' }
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeleteClass(cls: ClassArm) {
  if (cls.studentCount > 0) {
    alert(`Cannot delete ${cls.displayName}: It currently has ${cls.studentCount} enrolled students. Please reassign the students first in the SIS.`)
    return
  }

  if (!confirm(`Are you sure you want to permanently delete the class arm "${cls.displayName}"?`)) {
    return
  }

  try {
    await fetchApi(`/api/v1/classes/${cls.id}`, { method: 'DELETE' })
    await loadClasses()
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Failed to delete class')
  }
}

onMounted(() => {
  loadClasses()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div>
        <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold tracking-wide mb-1">
          <UIcon name="i-heroicons-academic-cap" class="w-3.5 h-3.5" />
          <span>ACADEMIC STRUCTURE & CLASS ARMS</span>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Classes & Academic Arms</h1>
        <p class="text-xs text-gray-500 mt-0.5">
          Configure classroom divisions, form tutors, subject curricula mappings, and student seat quotas.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all cursor-pointer active:scale-95"
          @click="openCreateModal"
        >
          <UIcon name="i-heroicons-plus-circle" class="w-4 h-4" />
          <span>Add New Class Arm</span>
        </button>
      </div>
    </div>

    <!-- Analytics KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Total Class Arms</span>
        <div class="text-2xl font-extrabold text-gray-900 mt-1 font-mono">{{ classes.length }}</div>
        <span class="text-[10px] text-emerald-600 mt-1 block">Active across all levels</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Total Enrollment</span>
        <div class="text-2xl font-extrabold text-gray-900 mt-1 font-mono">{{ totalEnrolled }} <span class="text-xs text-gray-400 font-normal">/ {{ totalCapacity }}</span></div>
        <span class="text-[10px] text-gray-500 mt-1 block">Capacity: {{ Math.round((totalEnrolled / (totalCapacity || 1)) * 100) }}% utilized</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Average Class Size</span>
        <div class="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">{{ avgClassSize }}</div>
        <span class="text-[10px] text-gray-500 mt-1 block">Optimal pedagogy: 25 - 35</span>
      </div>
      <div class="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
        <span class="text-gray-400 font-mono text-[10px] uppercase font-bold block">Near Capacity</span>
        <div class="text-2xl font-extrabold text-amber-600 mt-1 font-mono">{{ nearCapacityCount }}</div>
        <span class="text-[10px] text-gray-500 mt-1 block">Quota &ge; 90% full</span>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <UIcon name="i-heroicons-magnifying-glass" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        <input
          v-model="searchFilter"
          type="text"
          placeholder="Filter by class, teacher, or subject..."
          class="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs border border-gray-200 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
        >
      </div>

      <!-- Level Filter Segmented Control -->
      <div class="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-semibold self-stretch sm:self-auto">
        <button
          v-for="tab in [
            { label: 'All Levels', value: 'ALL' },
            { label: 'Junior (JSS 1-3)', value: 'JSS' },
            { label: 'Senior (SS 1-3)', value: 'SS' }
          ]"
          :key="tab.value"
          :class="[
            'px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs',
            selectedLevelFilter === tab.value
              ? 'bg-white text-emerald-700 font-bold shadow-xs'
              : 'text-gray-500 hover:text-gray-900'
          ]"
          @click="selectedLevelFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Classes Grid -->
    <div v-if="isLoading" class="p-16 text-center text-xs text-gray-400 font-mono">
      <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
      Loading live curriculum classes from database...
    </div>

    <div v-else-if="filteredClasses.length === 0" class="p-16 text-center bg-white rounded-3xl border border-dashed border-gray-200">
      <UIcon name="i-heroicons-academic-cap" class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <h3 class="text-sm font-bold text-gray-800">No Class Arms Found</h3>
      <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
        No class arms match your current filter query. Try modifying your search or create a new class arm.
      </p>
      <button
        class="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer shadow-sm"
        @click="openCreateModal"
      >
        Create New Class Arm
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      <div
        v-for="cls in filteredClasses"
        :key="cls.id"
        class="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
      >
        <div>
          <!-- Top Tag & Title -->
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <span class="text-[10px] font-mono font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                {{ cls.level }}
              </span>
              <h3 class="text-lg font-bold text-gray-900 mt-1 leading-tight group-hover:text-emerald-700 transition-colors">
                {{ cls.displayName }}
              </h3>
            </div>
            
            <div class="text-right">
              <span
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-mono font-bold inline-block',
                  (cls.studentCount / (cls.capacity || 1)) >= 1.0
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : (cls.studentCount / (cls.capacity || 1)) >= 0.85
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                ]"
              >
                {{ cls.studentCount }} / {{ cls.capacity }} Enrolled
              </span>
              <div class="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 ml-auto overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full',
                    (cls.studentCount / (cls.capacity || 1)) >= 1.0 ? 'bg-rose-500' : 'bg-emerald-500'
                  ]"
                  :style="{ width: `${Math.min(100, (cls.studentCount / (cls.capacity || 1)) * 100)}%` }"
                />
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="space-y-2.5 mb-5 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100/80">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500 font-medium">Form Teacher:</span>
              <div class="flex items-center gap-1.5 font-bold text-gray-900">
                <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-emerald-600" />
                <span>{{ cls.formTeacher || 'Unassigned' }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500 font-medium">Arm Identifier:</span>
              <span class="font-mono text-gray-500 text-[11px]">{{ cls.id }}</span>
            </div>
          </div>

          <!-- Curriculum Subjects -->
          <div class="mb-5">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono font-bold uppercase text-gray-400">Curriculum Subjects ({{ cls.subjects.length }})</span>
            </div>
            <div class="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              <span
                v-for="sub in cls.subjects"
                :key="sub"
                class="px-2.5 py-1 rounded-lg bg-gray-100/80 text-gray-700 text-[11px] font-medium"
              >
                {{ sub }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-between gap-2 mt-auto">
          <NuxtLink
            :to="`/dashboard/students?classArmId=${cls.id}`"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <UIcon name="i-heroicons-users" class="w-3.5 h-3.5" />
            <span>Class Roster ({{ cls.studentCount }})</span>
          </NuxtLink>

          <div class="flex items-center gap-1">
            <button
              class="p-2 rounded-xl text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Edit Class Arm"
              @click="openEditModal(cls)"
            >
              <UIcon name="i-heroicons-pencil-square" class="w-4 h-4" />
            </button>
            <button
              class="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Class Arm"
              @click="handleDeleteClass(cls)"
            >
              <UIcon name="i-heroicons-trash" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Create / Edit Class Arm -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      @click.self="isModalOpen = false"
    >
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 class="text-base font-bold text-gray-900">
              {{ isEditing ? 'Edit Academic Class Arm' : 'Create New Class Arm' }}
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">Define academic division, form tutor, and assigned subjects.</p>
          </div>
          <button class="p-2 text-gray-400 hover:text-gray-700" @click="isModalOpen = false">
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Feedback Alert -->
        <div
          v-if="feedbackMessage"
          :class="[
            'p-3 my-3 rounded-xl text-xs font-semibold',
            feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          ]"
        >
          {{ feedbackMessage.text }}
        </div>

        <!-- Form Body -->
        <div class="space-y-4 py-4 overflow-y-auto text-xs">
          <!-- Level & Arm Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Academic Level *</label>
              <select
                v-model="formData.level"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="JSS 1">JSS 1 (Junior 1)</option>
                <option value="JSS 2">JSS 2 (Junior 2)</option>
                <option value="JSS 3">JSS 3 (Junior 3)</option>
                <option value="SS 1">SS 1 (Senior 1)</option>
                <option value="SS 2">SS 2 (Senior 2)</option>
                <option value="SS 3">SS 3 (Senior 3)</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Arm Division Name *</label>
              <input
                v-model="formData.arm"
                type="text"
                placeholder="e.g. Gold, Science, Diamond"
                class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-semibold"
              >
            </div>
          </div>

          <!-- Form Teacher -->
          <div>
            <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">Form Teacher / Tutor</label>
            <input
              v-model="formData.formTeacher"
              type="text"
              placeholder="e.g. Mrs. Chioma Eze, Dr. Chukwuemeka Eze"
              class="w-full px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-emerald-500 font-medium"
            >
          </div>

          <!-- Capacity Slider -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] font-bold text-gray-700 uppercase font-mono">Student Capacity Quota</label>
              <span class="font-mono font-bold text-emerald-600">{{ formData.capacity }} students</span>
            </div>
            <input
              v-model="formData.capacity"
              type="range"
              min="15"
              max="50"
              step="1"
              class="w-full accent-emerald-600 cursor-pointer"
            >
          </div>

          <!-- Subjects Manager -->
          <div>
            <label class="block text-[11px] font-bold text-gray-700 uppercase font-mono mb-1">
              Assigned Subjects ({{ formData.subjects.length }})
            </label>
            <div class="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-2xl border border-gray-200 mb-2 min-h-16">
              <span
                v-for="sub in formData.subjects"
                :key="sub"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-medium"
              >
                <span>{{ sub }}</span>
                <button type="button" class="text-emerald-700 hover:text-emerald-950 font-bold ml-1 cursor-pointer" @click="toggleSubject(sub)">&times;</button>
              </span>
              <span v-if="formData.subjects.length === 0" class="text-gray-400 text-xs italic self-center">
                Click suggestions below or add custom subjects to assign.
              </span>
            </div>

            <!-- Custom Subject Input -->
            <div class="flex items-center gap-2 mb-2">
              <input
                v-model="newSubjectInput"
                type="text"
                placeholder="Type custom subject name..."
                class="flex-1 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-xs outline-none focus:border-emerald-500"
                @keydown.enter.prevent="addCustomSubject"
              >
              <button
                type="button"
                class="px-3 py-1.5 rounded-xl bg-gray-800 text-white font-semibold text-xs hover:bg-gray-700 cursor-pointer"
                @click="addCustomSubject"
              >
                Add
              </button>
            </div>

            <!-- Suggested Subject Pills -->
            <div class="flex flex-wrap gap-1">
              <button
                v-for="sub in POPULAR_SUBJECTS"
                :key="sub"
                type="button"
                :class="[
                  'px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors cursor-pointer',
                  formData.subjects.includes(sub)
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
                @click="toggleSubject(sub)"
              >
                {{ sub }}
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 mt-auto">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 cursor-pointer"
            @click="isModalOpen = false"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50 shadow-sm"
            @click="handleSaveClass"
          >
            {{ isSubmitting ? 'Saving...' : isEditing ? 'Update Class Arm' : 'Create Class Arm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
