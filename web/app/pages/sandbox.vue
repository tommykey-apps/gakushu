<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">サンドボックス</h1>
    <p class="mt-2 text-sm text-gray-500">テキストを入力して、GPTの処理過程を可視化する</p>

    <div class="mt-10 space-y-6">
      <UFormField label="テキスト入力">
        <UTextarea
          v-model="inputText"
          placeholder="ここにテキストを入力してください..."
          :rows="4"
          size="lg"
        />
      </UFormField>

      <UButton
        color="neutral"
        size="lg"
        :disabled="!inputText.trim()"
        @click="startVisualization"
      >
        学習を始める
      </UButton>

      <!-- Visualization area -->
      <div
        v-if="showViz"
        class="border border-gray-200 rounded p-8 text-center text-sm text-gray-400 min-h-64"
      >
        ここに可視化コンポーネントが表示されます
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const inputText = ref('')
const showViz = ref(false)

function startVisualization() {
  showViz.value = true
}
</script>
