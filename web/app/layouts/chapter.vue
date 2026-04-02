<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    <LayoutAppHeader />
    <div class="flex-1 flex max-w-7xl mx-auto w-full">
      <!-- Left sidebar: chapter navigation -->
      <aside class="hidden lg:block w-64 shrink-0 border-r border-gray-100 py-8 px-4">
        <nav class="sticky top-8 space-y-1">
          <NuxtLink
            v-for="chapter in chapters"
            :key="chapter.order"
            :to="`/chapters/${chapter.order}`"
            class="block px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded transition-colors"
            active-class="text-gray-900 bg-gray-50"
          >
            {{ chapter.order }}. {{ chapter.title }}
          </NuxtLink>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="flex-1 min-w-0 px-6 lg:px-12 py-8">
        <slot />
      </main>
    </div>

    <!-- Floating tutor button -->
    <TutorTutorChat />

    <LayoutAppFooter />
  </div>
</template>

<script setup lang="ts">
const chapters = [
  { order: 1, title: '基礎LM' },
  { order: 2, title: 'トークナイザ' },
  { order: 3, title: 'Transformer' },
  { order: 4, title: 'RLHF' },
  { order: 5, title: '推論と生成' },
]
</script>
