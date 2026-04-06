import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from 'aws-amplify/auth'

interface User {
  id: string
  email: string
  displayName?: string
}

const user = ref<User | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

let initPromise: Promise<void> | null = null
let initialized = false

export function useAuth() {
  const config = useRuntimeConfig()
  const isDevMode = !config.public.cognitoUserPoolId || !config.public.cognitoClientId

  async function login(email: string, password: string) {
    error.value = null

    if (isDevMode) {
      user.value = { id: 'local-dev-user', email, displayName: email.split('@')[0] }
      return
    }

    const result = await signIn({ username: email, password })
    if (result.isSignedIn) {
      await loadUser()
    }
  }

  async function signup(email: string, password: string) {
    error.value = null

    if (isDevMode) return

    await signUp({
      username: email,
      password,
      options: { userAttributes: { email } },
    })
  }

  async function confirmSignup(email: string, code: string) {
    error.value = null

    if (isDevMode) return

    await confirmSignUp({ username: email, confirmationCode: code })
  }

  async function logout() {
    error.value = null

    if (!isDevMode) {
      await signOut()
    }

    user.value = null
    navigateTo('/')
  }

  async function getToken(): Promise<string | null> {
    if (isDevMode) return null

    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() ?? null
    } catch {
      return null
    }
  }

  async function loadUser() {
    try {
      const cognitoUser = await getCurrentUser()
      const session = await fetchAuthSession()
      const email = session.tokens?.idToken?.payload?.email as string || ''

      user.value = {
        id: cognitoUser.userId,
        email,
        displayName: email.split('@')[0],
      }
    } catch {
      user.value = null
    }
  }

  async function restoreSession() {
    if (isDevMode) return

    isLoading.value = true
    try {
      await loadUser()
    } finally {
      isLoading.value = false
    }
  }

  function ensureInitialized(): Promise<void> {
    if (initialized) return Promise.resolve()
    if (!initPromise) {
      initPromise = restoreSession().finally(() => { initialized = true })
    }
    return initPromise
  }

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    error: readonly(error),
    login,
    signup,
    confirmSignup,
    logout,
    getToken,
    ensureInitialized,
  }
}
