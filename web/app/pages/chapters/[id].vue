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
if (!chapter) {
  throw createError({ status: 404, statusText: 'この章は存在しません' })
}
const slug = chapter.slug

const { data: page } = await useAsyncData(`chapter-${slug}`, () =>
  queryCollection('content').path(`/chapters/${slug}`).first(),
)

useScrollReveal()
</script>
