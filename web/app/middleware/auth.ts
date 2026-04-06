export default defineNuxtRouteMiddleware(async () => {
  const { user, ensureInitialized } = useAuth()

  await ensureInitialized()

  if (!user.value) {
    return navigateTo('/login')
  }
})
