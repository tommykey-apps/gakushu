<template>
  <div>
    <!-- Hero -->
    <section class="py-24 text-center">
      <h1 class="text-3xl font-semibold tracking-tight text-gray-900 leading-relaxed">
        GPTの仕組みを、ゼロから理解する
      </h1>
      <p class="mt-4 text-base text-gray-500 max-w-lg mx-auto leading-relaxed">
        インタラクティブな可視化で、言語モデルの仕組みを一歩ずつ学ぶ。
      </p>
      <UButton
        to="/chapters"
        color="neutral"
        size="lg"
        class="mt-10"
      >
        始める
      </UButton>
    </section>

    <!-- Chapter cards -->
    <section class="py-16">
      <div class="space-y-4">
        <NuxtLink
          v-for="chapter in chapters"
          :key="chapter.order"
          :to="`/chapters/${chapter.order}`"
          class="block border border-gray-100 rounded p-6 hover:bg-gray-50 transition-colors"
        >
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
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const chapters = [
  {
    order: 1,
    title: '基礎LM',
    description: 'たった153個の数値で「ももたろう」を学習するAIを作る',
    icon: '🎲',
  },
  {
    order: 2,
    title: 'トークナイザ',
    description: '文字をAIが扱える「数字の列」に変換する仕組み',
    icon: '🔤',
  },
  {
    order: 3,
    title: 'Transformer',
    description: '文脈を理解する「注意」のメカニズム',
    icon: '🔍',
  },
  {
    order: 4,
    title: 'RLHF',
    description: '人間のフィードバックでAIを賢くする方法',
    icon: '🎯',
  },
  {
    order: 5,
    title: '推論と生成',
    description: 'テキストが一文字ずつ生まれる瞬間を見る',
    icon: '✨',
  },
]
</script>
