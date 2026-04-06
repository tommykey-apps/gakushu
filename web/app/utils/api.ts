export async function $api<T>(path: string, options?: Parameters<typeof $fetch>[1]): Promise<T> {
  const { getToken, logout } = useAuth()
  const token = await getToken()

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return $fetch<T>(path, {
    ...options,
    headers,
    onResponseError({ response }) {
      if (response.status === 401) {
        logout()
      }
    },
  })
}
