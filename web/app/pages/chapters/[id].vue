<template>
  <div class="fade-in-up">
    <ContentRenderer v-if="page" :value="page" class="prose prose-gray max-w-none leading-relaxed prose-reveal" />
    <div v-else class="text-center py-24 text-sm text-gray-300">
      この章はまだ準備中です
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'chapter' })

const route = useRoute()
const { chapterByOrder } = useChapters()

const chapter = chapterByOrder(route.params.id as string)
const slug = chapter?.slug ?? route.params.id

const { data: page } = await useAsyncData(`chapter-${slug}`, () =>
  queryCollection('content').path(`/chapters/${slug}`).first(),
)

useScrollReveal()
</script>
