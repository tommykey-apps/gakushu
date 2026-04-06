<template>
  <MathExpandable title="log って何？">
    <div class="space-y-6">
      <p class="text-sm text-gray-600 leading-relaxed">
        log は「確率が低いほど大きなマイナスを返す」関数。
        ハズレ測定で使う <code>-log(確率)</code> は、確率が低いほど大きな正の数になる。
      </p>

      <!-- Interactive slider -->
      <div class="space-y-3">
        <label class="text-sm text-gray-700 font-medium">
          確率を変えてみよう: <span class="text-blue-600 font-semibold">{{ probability.toFixed(2) }}</span>
        </label>
        <input
          v-model.number="probability"
          type="range"
          min="0.01"
          max="1"
          step="0.01"
          class="w-full accent-blue-600"
        >
        <div class="flex gap-8 text-sm">
          <div>
            <span class="text-gray-500">log({{ probability.toFixed(2) }}) = </span>
            <span class="font-mono font-semibold">{{ logValue.toFixed(3) }}</span>
          </div>
          <div>
            <span class="text-gray-500">-log({{ probability.toFixed(2) }}) = </span>
            <span class="font-mono font-semibold text-blue-600">{{ negLogValue.toFixed(3) }}</span>
          </div>
        </div>
      </div>

      <!-- D3 graph -->
      <ClientOnly>
        <div ref="graphContainer" class="w-full" />
      </ClientOnly>
    </div>
  </MathExpandable>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

const probability = ref(0.5)
const logValue = computed(() => Math.log(probability.value))
const negLogValue = computed(() => -Math.log(probability.value))

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

  const xScale = d3.scaleLinear().domain([0.01, 1]).range([0, innerW])
  const yScale = d3.scaleLinear().domain([0, 5]).range([innerH, 0])

  // Axes
  g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(5)).selectAll('text').attr('fill', '#a3a3a3').attr('font-size', '10px')
  g.append('g').call(d3.axisLeft(yScale).ticks(5)).selectAll('text').attr('fill', '#a3a3a3').attr('font-size', '10px')

  g.append('text').attr('x', innerW / 2).attr('y', innerH + 28).attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#a3a3a3').text('確率')
  g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -36).attr('text-anchor', 'middle').attr('font-size', '10px').attr('fill', '#a3a3a3').text('-log(確率)')

  g.selectAll('.domain').attr('stroke', '#e5e5e5')
  g.selectAll('.tick line').attr('stroke', '#e5e5e5')

  // -log(x) curve
  const points: [number, number][] = []
  for (let x = 0.01; x <= 1; x += 0.005) {
    points.push([x, -Math.log(x)])
  }

  const line = d3.line<[number, number]>().x((d) => xScale(d[0])).y((d) => yScale(Math.min(d[1], 5))).curve(d3.curveMonotoneX)
  g.append('path').datum(points).attr('fill', 'none').attr('stroke', '#171717').attr('stroke-width', 1.5).attr('d', line)

  // Current point
  const px = xScale(probability.value)
  const py = yScale(Math.min(negLogValue.value, 5))
  g.append('circle').attr('cx', px).attr('cy', py).attr('r', 5).attr('fill', '#2563eb')
  g.append('line').attr('x1', px).attr('y1', py).attr('x2', px).attr('y2', yScale(0)).attr('stroke', '#2563eb').attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.5)
}

watch(probability, render)
onMounted(render)
</script>
