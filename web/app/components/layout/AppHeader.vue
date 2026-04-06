<template>
  <UHeader title="学" to="/">
    <UNavigationMenu
      :items="navItems"
      variant="link"
      color="neutral"
    />

    <template #right>
      <UButton
        v-if="!user"
        to="/login"
        variant="ghost"
        color="neutral"
        size="sm"
        class="text-gray-400 hover:text-gray-600"
      >
        ログイン
      </UButton>
      <template v-else>
        <UButton
          to="/dashboard"
          variant="ghost"
          color="neutral"
          size="sm"
          class="text-gray-400 hover:text-gray-600"
        >
          ダッシュボード
        </UButton>
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          class="text-gray-400 hover:text-gray-600"
          @click="handleLogout"
        >
          ログアウト
        </UButton>
      </template>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
}

const navItems = [
  { label: 'ホーム', to: '/' },
  { label: '章一覧', to: '/chapters' },
  { label: 'サンドボックス', to: '/sandbox' },
]
</script>
