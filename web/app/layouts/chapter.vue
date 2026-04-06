<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    <LayoutAppHeader />
    <div class="flex-1 flex max-w-6xl mx-auto w-full">
      <aside class="hidden lg:block w-56 shrink-0 border-r border-gray-50 py-10 px-4">
        <nav class="sticky top-20 space-y-1">
          <NuxtLink
            v-for="chapter in chapters"
            :key="chapter.order"
            :to="`/chapters/${chapter.order}`"
            class="block text-sm text-gray-400 hover:text-gray-700 transition-colors duration-300 py-1.5 px-2 rounded"
            active-class="text-gray-900 bg-gray-50"
          >
            {{ chapter.order }}. {{ chapter.title }}
          </NuxtLink>
        </nav>
      </aside>
      <main class="flex-1 min-w-0 px-8 lg:px-14 py-10">
        <slot />
      </main>
    </div>
    <TutorTutorChat />
    <LayoutAppFooter />
  </div>
</template>

<script setup lang="ts">
const { chapters } = useChapters()
</script>
