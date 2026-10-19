import { db, type GoChatMessage } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const roomId = getRouterParam(event, 'id') || 'rm-staff-general'

  if (event.node.req.method === 'POST') {
    const body = await readBody(event)
    const { text, senderName, senderRole, senderAvatar } = body || {}

    const newMsg: GoChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      senderId: 'usr-active-01',
      senderName: senderName || 'Faculty Member',
      senderRole: senderRole || 'Teacher',
      senderAvatar: senderAvatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      text: text || 'Acknowledged. Updating records accordingly.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: { '👍': 1 }
    }

    db.chatMessages.push(newMsg)
    return {
      success: true,
      data: newMsg
    }
  }

  const roomMessages = db.chatMessages.filter(m => m.roomId === roomId)
  return {
    data: roomMessages
  }
})
