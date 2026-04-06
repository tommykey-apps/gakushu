<template>
  <div>
    <UPageHero
      title="GPTの仕組みを、ゼロから理解する"
      description="インタラクティブな可視化で、言語モデルの仕組みを一歩ずつ学ぶ。"
      :links="[
        {
          label: '始める',
          to: '/chapters',
          color: 'neutral',
          variant: 'outline',
          size: 'xl',
        },
      ]"
      :ui="{
        root: 'py-28 sm:py-36 lg:py-44',
        title: 'text-3xl sm:text-4xl font-semibold tracking-tight text-gray-800',
        description: 'text-base text-gray-400 max-w-lg leading-relaxed',
        links: 'mt-10',
      }"
    />

    <UPageSection
      :ui="{
        root: 'py-16 sm:py-24',
        container: 'max-w-3xl',
      }"
    >
      <UPageList>
        <UPageCard
          v-for="chapter in chapters"
          :key="chapter.order"
          :title="`Chapter ${chapter.order}: ${chapter.title}`"
          :description="chapter.description"
          :to="`/chapters/${chapter.order}`"
          variant="outline"
          spotlight
          spotlight-color="neutral"
          :ui="{
            root: 'transition-all duration-300 ease-out hover:shadow-sm',
            title: 'text-sm font-medium text-gray-800',
            description: 'text-sm text-gray-400 leading-relaxed',
          }"
        >
          <template #leading>
            <span class="text-xl">{{ chapter.icon }}</span>
          </template>
        </UPageCard>
      </UPageList>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
const { chapters } = useChapters()
</script>
