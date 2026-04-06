<template>
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Chat panel -->
    <div
      v-if="isOpen"
      class="absolute bottom-14 right-0 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span class="text-sm font-medium text-gray-900">AI チューター</span>
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          color="neutral"
          size="xs"
          @click="isOpen = false"
        />
      </div>
      <div class="flex-1 px-4 py-3 overflow-y-auto">
        <p class="text-sm text-gray-400">質問を入力してください...</p>
      </div>
      <div class="px-4 py-3 border-t border-gray-100">
        <UInput
          placeholder="質問を入力..."
          size="sm"
          disabled
        />
      </div>
    </div>

    <!-- Floating button -->
    <UButton
      icon="i-lucide-message-circle"
      color="neutral"
      size="lg"
      class="rounded-full shadow-sm"
      :aria-label="isOpen ? 'AIチューターを閉じる' : 'AIチューターを開く'"
      @click="isOpen = !isOpen"
    />
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)
</script>
