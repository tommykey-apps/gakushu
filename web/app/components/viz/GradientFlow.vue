<template>
  <ClientOnly>
    <div ref="container" class="w-full" role="img" aria-label="勾配逆伝播の流れ図" />
    <template #fallback>
      <div class="border border-gray-200 rounded p-8 text-center text-sm text-gray-400">
        読み込み中...
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

const container = ref<HTMLElement>()

const stages = [
  { label: 'パーセント\nと正解の差', x: 0 },
  { label: '点数表への\n修正指示', x: 1 },
  { label: '調整値への\n修正指示', x: 2 },
  { label: '変換表への\n修正指示', x: 3 },
]

function render() {
  if (!container.value) return

  const el = container.value
  el.innerHTML = ''

  const margin = { top: 16, right: 16, bottom: 16, left: 16 }
  const width = 520
  const height = 100
  const boxW = 96
  const boxH = 48

  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  const innerW = width - margin.left - margin.right
  const gap = (innerW - stages.length * boxW) / (stages.length - 1)

  // Draw boxes and arrows
  stages.forEach((stage, i) => {
    const x = i * (boxW + gap)
    const y = (height - margin.top - margin.bottom - boxH) / 2

    // Box
    g.append('rect')
      .attr('x', x)
      .attr('y', y)
      .attr('width', boxW)
      .attr('height', boxH)
      .attr('rx', 4)
      .attr('fill', '#fafafa')
      .attr('stroke', '#e5e5e5')

    // Label (handle multiline)
    const lines = stage.label.split('\n')
    lines.forEach((line, li) => {
      g.append('text')
        .attr('x', x + boxW / 2)
        .attr('y', y + boxH / 2 + (li - (lines.length - 1) / 2) * 14 + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('fill', '#525252')
        .text(line)
    })

    // Arrow to next box
    if (i < stages.length - 1) {
      const arrowX1 = x + boxW + 4
      const arrowX2 = x + boxW + gap - 4
      const arrowY = y + boxH / 2

      // Arrow line
      const arrow = g
        .append('line')
        .attr('x1', arrowX1)
        .attr('y1', arrowY)
        .attr('x2', arrowX1)
        .attr('y2', arrowY)
        .attr('stroke', '#2563eb')
        .attr('stroke-width', 1.5)
        .attr('marker-end', 'url(#arrowhead)')

      // Animate arrow
      arrow
        .transition()
        .delay(i * 400)
        .duration(400)
        .attr('x2', arrowX2)
    }
  })

  // Arrow marker definition
  svg
    .append('defs')
    .append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 8)
    .attr('refY', 5)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
    .attr('fill', '#2563eb')
}

onMounted(render)
</script>
