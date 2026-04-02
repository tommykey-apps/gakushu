<template>
  <UAccordion :items="[{ label: title, content: '' }]">
    <template #body>
      <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        <slot />
      </div>
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
