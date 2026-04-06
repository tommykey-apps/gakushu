<template>
  <div class="max-w-sm mx-auto py-24 text-center">
    <p class="text-6xl font-light text-gray-300">{{ error?.status || 500 }}</p>
    <h1 class="mt-4 text-lg font-semibold text-gray-900">
      {{ error?.status === 404 ? 'ページが見つかりません' : 'エラーが発生しました' }}
    </h1>
    <p v-if="error?.statusText" class="mt-2 text-sm text-gray-500">
      {{ error.statusText }}
    </p>
    <UButton class="mt-8" color="neutral" @click="clearError({ redirect: '/' })">
      ホームに戻る
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: { status: number; statusText: string } | null
}>()
</script>
