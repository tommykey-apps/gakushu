export function useAnimation() {
  const isPlaying = ref(false)
  const speed = ref(1)
  const currentStep = ref(0)
  const totalSteps = ref(0)

  function play() {
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  function step() {
    if (currentStep.value < totalSteps.value) {
      currentStep.value++
    }
  }

  function reset() {
    isPlaying.value = false
    currentStep.value = 0
  }

  function setSpeed(s: number) {
    speed.value = s
  }

  return {
    isPlaying: readonly(isPlaying),
    speed: readonly(speed),
    currentStep,
    totalSteps,
    play,
    pause,
    step,
    reset,
    setSpeed,
  }
}
