<template>
  <header class="border-b border-gray-100">
    <div class="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="text-lg font-semibold tracking-tight text-gray-900">
        学
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex items-center gap-6">
        <NuxtLink
          to="/"
          class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          active-class="text-gray-900"
        >
          ホーム
        </NuxtLink>
        <NuxtLink
          to="/chapters"
          class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          active-class="text-gray-900"
        >
          章一覧
        </NuxtLink>
        <NuxtLink
          to="/sandbox"
          class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          active-class="text-gray-900"
        >
          サンドボックス
        </NuxtLink>
      </nav>

      <!-- Auth -->
      <div>
        <UButton
          v-if="!user"
          to="/login"
          variant="ghost"
          color="neutral"
          size="sm"
        >
          ログイン
        </UButton>
        <UButton
          v-else
          to="/dashboard"
          variant="ghost"
          color="neutral"
          size="sm"
        >
          ダッシュボード
        </UButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { user } = useAuth()
</script>
