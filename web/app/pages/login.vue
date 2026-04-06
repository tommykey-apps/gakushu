<template>
  <div class="max-w-sm mx-auto py-24">
    <h1 class="text-xl font-semibold text-gray-900 text-center">ログイン</h1>
    <p class="mt-2 text-sm text-gray-500 text-center">
      アカウントにログインして学習を続けましょう
    </p>

    <p v-if="error" class="mt-4 text-sm text-red-600 text-center">{{ error }}</p>

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
        :loading="loading"
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

const loading = ref(false)
const error = ref<string | null>(null)
const { login } = useAuth()

async function handleLogin() {
  loading.value = true
  error.value = null
  try {
    await login(state.email, state.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    if (e.name === 'UserNotConfirmedException') {
      navigateTo({ path: '/signup', query: { email: state.email, verify: '1' } })
      return
    }
    error.value = e.message || 'ログインに失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
