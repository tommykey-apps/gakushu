<template>
  <div class="max-w-sm mx-auto py-24">
    <h1 class="text-xl font-semibold text-gray-900 text-center">アカウント作成</h1>
    <p class="mt-2 text-sm text-gray-500 text-center">
      {{ isVerifying ? '認証コードを入力してください' : 'メールアドレスで登録' }}
    </p>

    <p v-if="error" class="mt-4 text-sm text-red-600 text-center">{{ error }}</p>

    <!-- Phase 1: Registration -->
    <UForm
      v-if="!isVerifying"
      :schema="signupSchema"
      :state="signupState"
      class="mt-10 space-y-4"
      @submit="handleSignup"
    >
      <UFormField label="メールアドレス" name="email">
        <UInput
          v-model="signupState.email"
          type="email"
          placeholder="you@example.com"
          size="lg"
        />
      </UFormField>

      <UFormField label="パスワード" name="password">
        <UInput
          v-model="signupState.password"
          type="password"
          placeholder="8文字以上（大文字・小文字・数字）"
          size="lg"
        />
      </UFormField>

      <UFormField label="パスワード（確認）" name="confirmPassword">
        <UInput
          v-model="signupState.confirmPassword"
          type="password"
          placeholder="もう一度入力"
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
        登録
      </UButton>
    </UForm>

    <!-- Phase 2: Verification code -->
    <UForm
      v-else
      :schema="verifySchema"
      :state="verifyState"
      class="mt-10 space-y-4"
      @submit="handleVerify"
    >
      <UFormField label="認証コード" name="code">
        <UInput
          v-model="verifyState.code"
          placeholder="6桁のコード"
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
        確認
      </UButton>
    </UForm>

    <p class="mt-6 text-center text-sm text-gray-500">
      すでにアカウントをお持ちの方は
      <NuxtLink to="/login" class="text-gray-900 underline underline-offset-4">ログイン</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({ layout: 'default' })

const signupSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string()
    .min(8, 'パスワードは8文字以上です')
    .regex(/[a-z]/, '小文字を含めてください')
    .regex(/[A-Z]/, '大文字を含めてください')
    .regex(/[0-9]/, '数字を含めてください'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
})

const verifySchema = z.object({
  code: z.string().length(6, '6桁のコードを入力してください'),
})

const route = useRoute()
const { signup, confirmSignup, login } = useAuth()

const isVerifying = ref(route.query.verify === '1')
const loading = ref(false)
const error = ref<string | null>(null)

const signupState = reactive({
  email: (route.query.email as string) || '',
  password: '',
  confirmPassword: '',
})

const verifyState = reactive({
  code: '',
})

const pendingEmail = ref(signupState.email)

async function handleSignup() {
  loading.value = true
  error.value = null
  try {
    await signup(signupState.email, signupState.password)
    pendingEmail.value = signupState.email
    isVerifying.value = true
  } catch (e: any) {
    error.value = e.message || '登録に失敗しました'
  } finally {
    loading.value = false
  }
}

async function handleVerify() {
  loading.value = true
  error.value = null
  try {
    await confirmSignup(pendingEmail.value, verifyState.code)
    await login(pendingEmail.value, signupState.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.message || '認証コードの確認に失敗しました'
  } finally {
    loading.value = false
  }
}
</script>
