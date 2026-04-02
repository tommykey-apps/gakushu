export function useTutor() {
  const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
  const isStreaming = ref(false)

  async function ask(question: string) {
    messages.value.push({ role: 'user', content: question })
    isStreaming.value = true

    try {
      // TODO: SSE 接続を実装
      // const eventSource = new EventSource(`/api/tutor/ask?q=${encodeURIComponent(question)}`)
      messages.value.push({
        role: 'assistant',
        content: 'AI チューターは現在準備中です。',
      })
    }
    finally {
      isStreaming.value = false
    }
  }

  function clearMessages() {
    messages.value = []
  }

  return {
    messages: readonly(messages),
    isStreaming: readonly(isStreaming),
    ask,
    clearMessages,
  }
}
