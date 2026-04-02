<template>
  <MathMathExpandable title="e（指数関数）って何？">
    <div class="space-y-6">
      <p class="text-sm text-gray-600 leading-relaxed">
        点数にはマイナスの値もある。パーセントに変換するには全部正の数にしたい。
        <code>e^x</code>（指数関数）を使うと、どんな数値でも正の数に変換できる。
      </p>

      <!-- Interactive slider -->
      <div class="space-y-3">
        <label class="text-sm text-gray-700 font-medium">
          入力値を変えてみよう: <span class="text-blue-600 font-semibold">{{ inputValue.toFixed(1) }}</span>
        </label>
        <input
          v-model.number="inputValue"
          type="range"
          min="-3"
          max="3"
          step="0.1"
          class="w-full accent-blue-600"
        >
        <div class="text-sm">
          <span class="text-gray-500">e^{{ inputValue.toFixed(1) }} = </span>
          <span class="font-mono font-semibold text-blue-600">{{ expValue.toFixed(3) }}</span>
          <span class="text-gray-400 ml-2">(常に正の数)</span>
        </div>
      </div>

      <!-- D3 graph -->
      <ClientOnly>
        <div ref="graphContainer" class="w-full" />
      </ClientOnly>

      <p class="text-xs text-gray-500 leading-relaxed">
        マイナスの入力 → 0に近い小さな正の数。プラスの入力 → 大きな正の数。
        これを全文字の点数に適用してから合計で割ると、パーセントになる（softmax）。
      </p>
    </div>
  </MathMathExpandable>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

const inputValue = ref(0)
const expValue = computed(() => Math.exp(inputValue.value))

const graphContainer = ref<HTMLElement>()

function render() {
  if (!graphContainer.value) return
  const el = graphContainer.value
  el.innerHTML = ''

  const margin = { top: 8, right: 16, bottom: 32, left: 48 }
  const width = 360
  const height = 180

  const svg = d3.select(el).append('svg').attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`)
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const xScale = d3.scaleLinear().domain([-3, 3]).range([0, innerW])
  const yScale = d3.scaleLinear().domain([0, 10]).range([innerH, 0])

  g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(7)).selectAll('text').attr('fill', '#a3a3a3').attr('font-size', '10px')
  g.append('g').call(d3.axisLeft(yScale).ticks(5)).selectAll('text').attr('fill', '#a3a3a3').attr('font-size', '10px')

  g.append('text').attr('x', innerW / 2).attr('y', innerH + 28).attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#a3a3a3').text('入力値 x')
  g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -36).attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#a3a3a3').text('e^x')

  g.selectAll('.domain').attr('stroke', '#e5e5e5')
  g.selectAll('.tick line').attr('stroke', '#e5e5e5')

  // y=0 line
  g.append('line').attr('x1', 0).attr('x2', innerW).attr('y1', yScale(0)).attr('y2', yScale(0)).attr('stroke', '#e5e5e5')

  // e^x curve
  const points: [number, number][] = []
  for (let x = -3; x <= 3; x += 0.05) {
    points.push([x, Math.exp(x)])
  }
  const line = d3.line<[number, number]>().x((d) => xScale(d[0])).y((d) => yScale(Math.min(d[1], 10))).curve(d3.curveMonotoneX)
  g.append('path').datum(points).attr('fill', 'none').attr('stroke', '#171717').attr('stroke-width', 1.5).attr('d', line)

  // Current point
  const px = xScale(inputValue.value)
  const py = yScale(Math.min(expValue.value, 10))
  g.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', '#2563eb')
  g.append('line').attr('x1', px).attr('y1', py).attr('x2', px).attr('y2', yScale(0)).attr('stroke', '#2563eb').attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.5)
}

watch(inputValue, render)
onMounted(render)
</script>
