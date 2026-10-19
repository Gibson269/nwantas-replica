<script setup lang="ts">
import { useNwantasApi } from '~/composables/useNwantasApi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'GoChats Real-Time Institutional Messenger'
})

const { fetchApi } = useNwantasApi()
const authStore = useAuthStore()

const rooms = ref<any[]>([])
const selectedRoomId = ref<string>('rm-staff-general')
const messages = ref<any[]>([])
const inputMessage = ref('')
const isLoading = ref(true)

async function loadChat() {
  isLoading.value = true
  try {
    const res = await fetchApi('/api/chat/rooms')
    rooms.value = res.data
    await loadMessages(selectedRoomId.value)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function loadMessages(roomId: string) {
  selectedRoomId.value = roomId
  try {
    const res = await fetchApi(`/api/chat/rooms/${roomId}/messages`)
    messages.value = res.data
  } catch (e) {
    console.error(e)
  }
}

async function handleSendMessage() {
  if (!inputMessage.value.trim()) return
  const text = inputMessage.value.trim()
  inputMessage.value = ''

  try {
    const res = await fetchApi(`/api/chat/rooms/${selectedRoomId.value}/messages`, {
      method: 'POST',
      body: {
        text,
        senderName: authStore.currentUser.name,
        senderRole: authStore.currentUser.roleTitle,
        senderAvatar: authStore.currentUser.avatar
      }
    })
    messages.value.push(res.data)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadChat()
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
    <div class="flex-1 flex overflow-hidden">
      <!-- Left: Room & Channel List -->
      <aside class="w-72 border-r border-gray-200 flex flex-col bg-gray-50/60">
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-sm text-gray-900">GoChats Channels</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span class="text-[10px] text-gray-500 font-mono">Real-time WebSocket active</span>
        </div>

        <div class="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            v-for="r in rooms"
            :key="r.id"
            :class="[
              'w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer',
              selectedRoomId === r.id ? 'bg-white shadow-sm border border-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
            ]"
            @click="loadMessages(r.id)"
          >
            <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              #
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold truncate">{{ r.name }}</div>
              <div class="text-[10px] text-gray-400 truncate mt-0.5">{{ r.description }}</div>
            </div>
          </button>
        </div>
      </aside>

      <!-- Right: Chat Messages Stream -->
      <section class="flex-1 flex flex-col bg-white">
        <!-- Room Top Bar -->
        <div class="h-16 px-6 border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-emerald-500" />
            <h3 class="font-bold text-sm text-gray-900">
              {{ rooms.find(r => r.id === selectedRoomId)?.name || 'General Channel' }}
            </h3>
          </div>
          <span class="text-[10px] font-mono text-gray-400">Restricted Broadcast Security</span>
        </div>

        <!-- Messages Stream -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex items-start gap-3 text-xs"
          >
            <img :src="msg.senderAvatar" :alt="msg.senderName" class="w-8 h-8 rounded-full object-cover">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900">{{ msg.senderName }}</span>
                <span class="text-[10px] text-gray-400 font-mono">{{ msg.timestamp }}</span>
              </div>
              <div class="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-800 leading-relaxed max-w-xl">
                {{ msg.text }}
              </div>
              <!-- Reactions -->
              <div v-if="msg.reactions" class="flex items-center gap-1 mt-1.5">
                <span
                  v-for="(count, emoji) in msg.reactions"
                  :key="emoji"
                  class="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-medium"
                >
                  {{ emoji }} {{ count }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Composer -->
        <div class="p-4 border-t border-gray-200 flex items-center gap-3">
          <input
            v-model="inputMessage"
            type="text"
            placeholder="Type your institutional message... (Press Enter to send)"
            class="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500"
            @keydown.enter="handleSendMessage"
          >
          <button
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            @click="handleSendMessage"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
