<template>
  <MathMathExpandable title="Σ（掛けて全部足す）って何？">
    <div class="space-y-6">
      <p class="text-sm text-gray-600 leading-relaxed">
        変換表から取り出した数値と、点数表の数値を「1つずつ掛けて全部足す」。
        この操作を数学では Σ（シグマ）や内積と呼ぶ。
      </p>

      <!-- Step-by-step example -->
      <div class="space-y-4">
        <p class="text-xs text-gray-500 font-medium">具体例</p>

        <div class="font-mono text-sm space-y-2">
          <div class="flex gap-4 items-center">
            <span class="text-gray-500">変換表:</span>
            <div class="flex gap-2">
              <span
                v-for="(v, i) in vecA"
                :key="i"
                class="px-2 py-1 rounded text-xs"
                :class="activeStep >= i ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'"
              >{{ v }}</span>
            </div>
          </div>
          <div class="flex gap-4 items-center">
            <span class="text-gray-500">点数表:</span>
            <div class="flex gap-2">
              <span
                v-for="(v, i) in vecB"
                :key="i"
                class="px-2 py-1 rounded text-xs"
                :class="activeStep >= i ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'"
              >{{ v }}</span>
            </div>
          </div>
        </div>

        <!-- Calculation steps -->
        <div class="border-t border-gray-100 pt-3 space-y-1">
          <div
            v-for="(_, i) in vecA"
            :key="i"
            class="text-sm font-mono transition-opacity"
            :class="activeStep >= i ? 'opacity-100' : 'opacity-20'"
          >
            <span class="text-gray-400">{{ i > 0 ? '+ ' : '  ' }}</span>
            <span class="text-blue-600">{{ vecA[i] }}</span>
            <span class="text-gray-400"> × </span>
            <span class="text-blue-600">{{ vecB[i] }}</span>
            <span class="text-gray-400"> = </span>
            <span class="font-semibold">{{ (vecA[i] * vecB[i]).toFixed(2) }}</span>
          </div>
          <div
            class="text-sm font-mono border-t border-gray-200 pt-1 transition-opacity"
            :class="activeStep >= vecA.length ? 'opacity-100' : 'opacity-20'"
          >
            <span class="text-gray-400">= </span>
            <span class="font-semibold text-blue-600">{{ total.toFixed(2) }}</span>
          </div>
        </div>

        <UButton
          size="xs"
          variant="outline"
          color="neutral"
          @click="nextStep"
        >
          {{ activeStep >= vecA.length ? 'リセット' : '次のステップ' }}
        </UButton>
      </div>
    </div>
  </MathMathExpandable>
</template>

<script setup lang="ts">
const vecA = [0.3, -1.2, 0.8]
const vecB = [0.5, 0.2, 0.9]
const total = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0)

const activeStep = ref(-1)

function nextStep() {
  if (activeStep.value >= vecA.length) {
    activeStep.value = -1
  }
  else {
    activeStep.value++
  }
}
</script>
