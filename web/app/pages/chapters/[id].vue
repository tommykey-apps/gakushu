<template>
  <ContentRenderer v-if="page" :value="page" class="prose prose-gray max-w-none leading-relaxed" />
  <div v-else class="text-center py-24 text-sm text-gray-400">
    この章はまだ準備中です
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'chapter' })

const route = useRoute()
const chapterMap: Record<string, string> = {
  '1': '1-basic-lm',
  '2': '2-tokenizer',
  '3': '3-transformer',
  '4': '4-rlhf',
  '5': '5-inference',
}

const slug = chapterMap[route.params.id as string] ?? route.params.id
const { data: page } = await useAsyncData(`chapter-${slug}`, () =>
  queryCollection('content').path(`/chapters/${slug}`).first(),
)
</script>
