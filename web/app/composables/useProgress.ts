export function useProgress() {
  const progress = ref<Record<number, number>>({})

  async function fetchProgress() {
    const { user } = useAuth()
    if (!user.value) return

    try {
      const data = await $api<Record<number, number>>('/api/progress')
      progress.value = data
    }
    catch {
      // API 未接続時はデフォルト値
      progress.value = {}
    }
  }

  return {
    progress: readonly(progress),
    fetchProgress,
  }
}
