<template>
  <div class="max-w-sm mx-auto py-24">
    <h1 class="text-xl font-semibold text-gray-900 text-center">ログイン</h1>
    <p class="mt-2 text-sm text-gray-500 text-center">
      アカウントにログインして学習を続けましょう
    </p>

    <UForm :schema="loginSchema" :state="state" class="mt-10 space-y-4" @submit="handleLogin">
      <UFormField label="メールアドレス" name="email">
        <UInput
          v-model="state.email"
          type="email"
          placeholder="you@example.com"
          size="lg"
        />
      </UFormField>

      <UFormField label="パスワード" name="password">
        <UInput
          v-model="state.password"
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
    </UForm>

    <p class="mt-6 text-center text-sm text-gray-500">
      アカウントをお持ちでない方は
      <NuxtLink to="/signup" class="text-gray-900 underline underline-offset-4">サインアップ</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上です'),
})

const state = reactive({
  email: '',
  password: '',
})

const { login } = useAuth()

async function handleLogin() {
  await login(state.email, state.password)
  navigateTo('/dashboard')
}
</script>
