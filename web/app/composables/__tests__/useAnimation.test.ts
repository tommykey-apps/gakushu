import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, readonly } from 'vue'

// Mock Nuxt auto-imports
vi.stubGlobal('ref', ref)
vi.stubGlobal('readonly', readonly)

const { useAnimation } = await import('../useAnimation')

describe('useAnimation', () => {
  let anim: ReturnType<typeof useAnimation>

  beforeEach(() => {
    anim = useAnimation()
    anim.reset()
    anim.totalSteps.value = 10
  })

  it('初期状態で再生停止中、ステップ0', () => {
    expect(anim.isPlaying.value).toBe(false)
    expect(anim.currentStep.value).toBe(0)
  })

  it('play で再生開始', () => {
    anim.play()
    expect(anim.isPlaying.value).toBe(true)
  })

  it('pause で再生停止', () => {
    anim.play()
    anim.pause()
    expect(anim.isPlaying.value).toBe(false)
  })

  it('step でステップが進む', () => {
    anim.step()
    expect(anim.currentStep.value).toBe(1)
    anim.step()
    expect(anim.currentStep.value).toBe(2)
  })

  it('step は totalSteps を超えない', () => {
    anim.totalSteps.value = 2
    anim.step()
    anim.step()
    anim.step() // should not go beyond 2
    expect(anim.currentStep.value).toBe(2)
  })

  it('reset で初期状態に戻る', () => {
    anim.play()
    anim.step()
    anim.step()
    anim.reset()
    expect(anim.isPlaying.value).toBe(false)
    expect(anim.currentStep.value).toBe(0)
  })

  it('setSpeed で速度が変わる', () => {
    anim.setSpeed(3)
    expect(anim.speed.value).toBe(3)
  })
})
