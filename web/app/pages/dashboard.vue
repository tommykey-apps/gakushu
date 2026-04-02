<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">ダッシュボード</h1>
    <p class="mt-2 text-sm text-gray-500">学習の進捗を確認する</p>

    <!-- Progress overview -->
    <section class="mt-10">
      <h2 class="text-sm font-medium text-gray-900 mb-4">章ごとの進捗</h2>
      <div class="space-y-3">
        <div
          v-for="chapter in chapters"
          :key="chapter.order"
          class="border border-gray-100 rounded p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-gray-700">
              Chapter {{ chapter.order }}: {{ chapter.title }}
            </span>
            <span class="text-xs text-gray-400">
              {{ progress[chapter.order] ?? 0 }}%
            </span>
          </div>
          <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              class="h-full bg-gray-900 rounded-full transition-all"
              :style="{ width: `${progress[chapter.order] ?? 0}%` }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Quiz scores -->
    <section class="mt-12">
      <h2 class="text-sm font-medium text-gray-900 mb-4">クイズスコア履歴</h2>
      <div class="border border-gray-100 rounded p-6 text-center text-sm text-gray-400">
        まだクイズを受けていません
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { progress } = useProgress()

const chapters = [
  { order: 1, title: '基礎LM' },
  { order: 2, title: 'トークナイザ' },
  { order: 3, title: 'Transformer' },
  { order: 4, title: 'RLHF' },
  { order: 5, title: '推論と生成' },
]
</script>
