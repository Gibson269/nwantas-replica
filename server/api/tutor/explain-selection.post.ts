export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { selectedText, subject } = body || {}

  return {
    selection: selectedText,
    simplifiedExplanation: `Here is a breakdown of "${selectedText}": It refers to the physical principle where energy cannot be created or destroyed, only transformed. In ${subject || 'this context'}, it guarantees that any work done overcoming magnetic opposition is converted directly into electrical electrical potential.`,
    keyTerms: ['Electromotive Force', 'Magnetic Flux', 'Conservation of Energy'],
    quickCheckQuestion: 'What happens to the induced current if the magnet is held stationary inside the coil?'
  }
})

