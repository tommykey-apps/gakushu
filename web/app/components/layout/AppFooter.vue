<template>
  <UFooter>
    <template #left>
      <span class="text-xs text-gray-300">
        &copy; {{ new Date().getFullYear() }} gakushu.now
      </span>
    </template>
    <template #right>
      <a
        href="https://github.com/tommykey-apps/gakushu"
        target="_blank"
        rel="noopener noreferrer"
        class="text-xs text-gray-300 hover:text-gray-500 transition-colors duration-300"
      >
        GitHub
      </a>
    </template>
  </UFooter>
</template>
