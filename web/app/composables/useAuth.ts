interface User {
  id: string
  email: string
  displayName?: string
}

const user = ref<User | null>(null)

export function useAuth() {
  const runtimeConfig = useRuntimeConfig()

  async function login(email: string, _password: string) {
    // TODO: Cognito 認証を実装
    // ローカル開発では DEV_USER_ID で自動ログイン
    user.value = {
      id: 'local-dev-user',
      email,
      displayName: email.split('@')[0],
    }
  }

  function logout() {
    user.value = null
    navigateTo('/')
  }

  return {
    user: readonly(user),
    login,
    logout,
  }
}
