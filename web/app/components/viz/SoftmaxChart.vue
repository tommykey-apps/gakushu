<template>
  <ClientOnly>
    <div ref="container" class="w-full" />
    <template #fallback>
      <div class="border border-gray-200 rounded p-8 text-center text-sm text-gray-400">
        読み込み中...
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

const props = defineProps<{
  probs: number[]
  chars: string[]
  correctIndex?: number
}>()

const container = ref<HTMLElement>()

function render() {
  if (!container.value || !props.probs.length) return

  const el = container.value
  el.innerHTML = ''

  const data = props.chars.map((ch, i) => ({
    char: ch,
    prob: props.probs[i]!,
    isCorrect: i === props.correctIndex,
  }))

  // Sort by probability descending
  data.sort((a, b) => b.prob - a.prob)

  const margin = { top: 8, right: 48, bottom: 8, left: 32 }
  const barHeight = 28
  const barGap = 4
  const width = 400
  const height = data.length * (barHeight + barGap) + margin.top + margin.bottom

  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const xScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([0, width - margin.left - margin.right])

  data.forEach((d, i) => {
    const y = i * (barHeight + barGap)

    // Character label
    g.append('text')
      .attr('x', -8)
      .attr('y', y + barHeight / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '13px')
      .attr('fill', d.isCorrect ? '#2563eb' : '#171717')
      .attr('font-weight', d.isCorrect ? '600' : '400')
      .text(d.char)

    // Bar background
    g.append('rect')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', xScale(1))
      .attr('height', barHeight)
      .attr('rx', 2)
      .attr('fill', '#f5f5f5')

    // Bar
    g.append('rect')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', xScale(d.prob))
      .attr('height', barHeight)
      .attr('rx', 2)
      .attr('fill', d.isCorrect ? '#2563eb' : '#a3a3a3')
      .attr('opacity', d.isCorrect ? 1 : 0.6)

    // Percentage label
    g.append('text')
      .attr('x', xScale(d.prob) + 6)
      .attr('y', y + barHeight / 2 + 4)
      .attr('font-size', '11px')
      .attr('fill', '#737373')
      .text(`${(d.prob * 100).toFixed(1)}%`)
  })
}

watch(() => props.probs, render, { deep: true })
onMounted(render)
</script>
