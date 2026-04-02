<template>
  <div class="max-w-sm mx-auto py-24">
    <h1 class="text-xl font-semibold text-gray-900 text-center">ログイン</h1>
    <p class="mt-2 text-sm text-gray-500 text-center">
      アカウントにログインして学習を続けましょう
    </p>

    <form class="mt-10 space-y-4" @submit.prevent="handleLogin">
      <UFormField label="メールアドレス">
        <UInput
          v-model="email"
          type="email"
          placeholder="you@example.com"
          size="lg"
        />
      </UFormField>

      <UFormField label="パスワード">
        <UInput
          v-model="password"
          type="password"
          placeholder="••••••••"
          size="lg"
        />
      </UFormField>

      <UButton
        type="submit"
        color="neutral"
        size="lg"
        block
        class="mt-6"
      >
        ログイン
      </UButton>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
      アカウントをお持ちでない方は
      <NuxtLink to="/login" class="text-gray-900 underline underline-offset-4">サインアップ</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const email = ref('')
const password = ref('')
const { login } = useAuth()

async function handleLogin() {
  await login(email.value, password.value)
  navigateTo('/dashboard')
}
</script>
