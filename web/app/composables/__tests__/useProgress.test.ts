import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, readonly } from 'vue'

// Mock Nuxt auto-imports
vi.stubGlobal('ref', ref)
vi.stubGlobal('readonly', readonly)

const mockUser = ref<{ id: string } | null>(null)
vi.stubGlobal('useAuth', () => ({ user: mockUser }))

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

const { useProgress } = await import('../useProgress')

describe('useProgress', () => {
  beforeEach(() => {
    mockUser.value = null
    mockFetch.mockReset()
  })

  it('未認証では fetchProgress が何もしない', async () => {
    const { progress, fetchProgress } = useProgress()
    await fetchProgress()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(progress.value).toEqual({})
  })

  it('認証済みで API からデータを取得する', async () => {
    mockUser.value = { id: 'user-1' }
    mockFetch.mockResolvedValue({ 1: 50, 2: 100 })

    const { progress, fetchProgress } = useProgress()
    await fetchProgress()
    expect(mockFetch).toHaveBeenCalledWith('/api/progress')
    expect(progress.value).toEqual({ 1: 50, 2: 100 })
  })

  it('API エラー時はデフォルト値', async () => {
    mockUser.value = { id: 'user-1' }
    mockFetch.mockRejectedValue(new Error('Network error'))

    const { progress, fetchProgress } = useProgress()
    await fetchProgress()
    expect(progress.value).toEqual({})
  })
})
