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
      <UButton
        v-else
        to="/dashboard"
        variant="ghost"
        color="neutral"
        size="sm"
        class="text-gray-400 hover:text-gray-600"
      >
        ダッシュボード
      </UButton>
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { user } = useAuth()

const navItems = [
  { label: 'ホーム', to: '/' },
  { label: '章一覧', to: '/chapters' },
  { label: 'サンドボックス', to: '/sandbox' },
]
</script>
