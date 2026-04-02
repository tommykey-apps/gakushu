<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900">章一覧</h1>
    <p class="mt-2 text-sm text-gray-500">全5章で GPT の仕組みを理解する</p>

    <div class="mt-10 space-y-4">
      <NuxtLink
        v-for="chapter in chapters"
        :key="chapter.order"
        :to="`/chapters/${chapter.order}`"
        class="block border border-gray-100 rounded p-6 hover:bg-gray-50 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-start gap-4">
            <span class="text-xl">{{ chapter.icon }}</span>
            <div>
              <h3 class="text-sm font-medium text-gray-900">
                Chapter {{ chapter.order }}: {{ chapter.title }}
              </h3>
              <p class="mt-1 text-sm text-gray-500 leading-relaxed">
                {{ chapter.description }}
              </p>
            </div>
          </div>

          <!-- Progress bar (only when authenticated) -->
          <div v-if="user" class="w-24 shrink-0 ml-4">
            <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gray-900 rounded-full transition-all"
                :style="{ width: `${progress[chapter.order] ?? 0}%` }"
              />
            </div>
            <p class="mt-1 text-xs text-gray-400 text-right">
              {{ progress[chapter.order] ?? 0 }}%
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { progress } = useProgress()

const chapters = [
  { order: 1, title: '基礎LM', description: '次の文字を当てるゲーム', icon: '🎲' },
  { order: 2, title: 'トークナイザ', description: '文字を数字に変換する', icon: '🔤' },
  { order: 3, title: 'Transformer', description: '注意のメカニズム', icon: '🔍' },
  { order: 4, title: 'RLHF', description: '人間のフィードバック', icon: '🎯' },
  { order: 5, title: '推論と生成', description: 'テキスト生成の瞬間', icon: '✨' },
]
</script>
