<template>
  <ClientOnly>
    <div ref="container" class="w-full" role="img" aria-label="学習損失の推移グラフ" />
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
  data: { step: number; loss: number }[]
}>()

const container = ref<HTMLElement>()

function render() {
  if (!container.value || !props.data.length) return

  const el = container.value
  el.innerHTML = ''

  const margin = { top: 16, right: 16, bottom: 36, left: 48 }
  const width = 480
  const height = 240

  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.step)!])
    .range([0, innerW])

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.loss)! * 1.1])
    .range([innerH, 0])

  // X axis
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .selectAll('text')
    .attr('fill', '#a3a3a3')
    .attr('font-size', '10px')

  g.append('text')
    .attr('x', innerW / 2)
    .attr('y', innerH + 30)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#a3a3a3')
    .text('ステップ')

  // Y axis
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5))
    .selectAll('text')
    .attr('fill', '#a3a3a3')
    .attr('font-size', '10px')

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2)
    .attr('y', -36)
    .attr('text-anchor', 'middle')
    .attr('font-size', '11px')
    .attr('fill', '#a3a3a3')
    .text('Loss')

  // Grid lines
  g.selectAll('.grid-y')
    .data(yScale.ticks(5))
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('x2', innerW)
    .attr('y1', (d: number) => yScale(d))
    .attr('y2', (d: number) => yScale(d))
    .attr('stroke', '#f5f5f5')

  // Line
  const line = d3
    .line<{ step: number; loss: number }>()
    .x((d) => xScale(d.step))
    .y((d) => yScale(d.loss))
    .curve(d3.curveMonotoneX)

  const path = g
    .append('path')
    .datum(props.data)
    .attr('fill', 'none')
    .attr('stroke', '#171717')
    .attr('stroke-width', 1.5)
    .attr('d', line)

  // Animate the line drawing
  const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0
  if (totalLength > 0) {
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
  }

  // Style axis lines
  g.selectAll('.domain').attr('stroke', '#e5e5e5')
  g.selectAll('.tick line').attr('stroke', '#e5e5e5')
}

watch(() => props.data, render, { deep: true })
onMounted(render)
</script>
