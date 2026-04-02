<template>
  <div class="max-w-lg">
    <h1 class="text-2xl font-semibold text-gray-900">設定</h1>
    <p class="mt-2 text-sm text-gray-500">プロフィールを編集する</p>

    <form class="mt-10 space-y-6" @submit.prevent="handleSave">
      <UFormField label="表示名">
        <UInput v-model="form.displayName" size="lg" />
      </UFormField>

      <UFormField label="職業">
        <UInput v-model="form.occupation" placeholder="例: エンジニア、学生" size="lg" />
      </UFormField>

      <UFormField label="知識レベル">
        <USelect
          v-model="form.level"
          :items="['初心者', '中級者', '上級者']"
          size="lg"
        />
      </UFormField>

      <UButton type="submit" color="neutral" size="lg">
        保存
      </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const form = reactive({
  displayName: '',
  occupation: '',
  level: '初心者',
})

function handleSave() {
  // TODO: save to API
}
</script>
