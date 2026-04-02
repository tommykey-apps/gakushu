import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, readonly } from 'vue'

// Mock Nuxt auto-imports
vi.stubGlobal('useRuntimeConfig', () => ({ public: {} }))
vi.stubGlobal('navigateTo', vi.fn())
vi.stubGlobal('ref', ref)
vi.stubGlobal('readonly', readonly)

// Import after mocking globals
const { useAuth } = await import('../useAuth')

describe('useAuth', () => {
  beforeEach(() => {
    const { logout } = useAuth()
    logout()
    vi.mocked(navigateTo).mockClear()
  })

  it('初期状態で未認証', () => {
    const { user } = useAuth()
    expect(user.value).toBeNull()
  })

  it('login で認証状態になる', async () => {
    const { user, login } = useAuth()
    await login('test@example.com', 'password')
    expect(user.value).not.toBeNull()
    expect(user.value!.id).toBe('local-dev-user')
    expect(user.value!.email).toBe('test@example.com')
    expect(user.value!.displayName).toBe('test')
  })

  it('logout で未認証に戻る', async () => {
    const { user, login, logout } = useAuth()
    await login('test@example.com', 'password')
    expect(user.value).not.toBeNull()

    logout()
    expect(user.value).toBeNull()
  })

  it('logout で navigateTo("/") が呼ばれる', () => {
    const { logout } = useAuth()
    logout()
    expect(navigateTo).toHaveBeenCalledWith('/')
  })
})
