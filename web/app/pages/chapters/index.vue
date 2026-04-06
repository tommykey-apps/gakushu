<template>
  <UPageSection
    headline="全5章"
    title="章一覧"
    description="GPTの仕組みを、一章ずつ理解する"
    :ui="{
      root: 'py-12 sm:py-16',
      container: 'max-w-3xl',
      title: 'text-2xl font-semibold text-gray-800',
      description: 'text-sm text-gray-400',
    }"
  >
    <UPageList>
      <UPageCard
        v-for="(chapter, i) in chapters"
        :key="chapter.order"
        :title="`Chapter ${chapter.order}: ${chapter.title}`"
        :description="chapter.description"
        :to="`/chapters/${chapter.order}`"
        variant="outline"
        spotlight
        spotlight-color="neutral"
        class="fade-in-up card-hover"
        :style="{ transitionDelay: `${i * 0.08}s` }"
      >
        <template #leading>
          <span class="text-xl">{{ chapter.icon }}</span>
        </template>
        <template v-if="user" #footer>
          <div class="w-full">
            <div class="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-gray-400 rounded-full transition-all duration-500"
                :style="{ width: `${getProgress(chapter.order)}%` }"
              />
            </div>
            <p class="mt-1 text-xs text-gray-300 text-right">
              {{ getProgress(chapter.order) }}%
            </p>
          </div>
        </template>
      </UPageCard>
    </UPageList>
  </UPageSection>
</template>

<script setup lang="ts">
const { user } = useAuth()
const { progress, fetchProgress } = useProgress()
const { chapters } = useChapters()
useScrollReveal()

function getProgress(order: number): number {
  return progress.value?.[order] ?? 0
}
</script>
