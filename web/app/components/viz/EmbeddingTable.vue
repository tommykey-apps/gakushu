<template>
  <ClientOnly>
    <div ref="container" class="w-full overflow-x-auto" role="img" aria-label="埋め込みベクトルのヒートマップ" />
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
  weights: number[][]
  chars: string[]
  title?: string
}>()

const container = ref<HTMLElement>()

function render() {
  if (!container.value || !props.weights.length) return

  const el = container.value
  el.innerHTML = ''

  const rows = props.weights.length
  const cols = props.weights[0]!.length

  // Flatten to find range
  const allVals = props.weights.flat()
  const maxAbs = Math.max(Math.abs(d3.min(allVals)!), Math.abs(d3.max(allVals)!))

  const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain([maxAbs, -maxAbs])

  const cellSize = 48
  const labelWidth = 32
  const headerHeight = 24
  const margin = { top: 8, right: 8, bottom: 8, left: 8 }

  const width = labelWidth + cols * cellSize + margin.left + margin.right
  const height = headerHeight + rows * cellSize + margin.top + margin.bottom

  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // Column headers (dim indices)
  for (let j = 0; j < cols; j++) {
    g.append('text')
      .attr('x', labelWidth + j * cellSize + cellSize / 2)
      .attr('y', headerHeight - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#a3a3a3')
      .text(j)
  }

  // Rows
  for (let i = 0; i < rows; i++) {
    const y = headerHeight + i * cellSize

    // Row label (character)
    g.append('text')
      .attr('x', labelWidth - 8)
      .attr('y', y + cellSize / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-size', '13px')
      .attr('fill', '#171717')
      .text(props.chars[i] || i)

    for (let j = 0; j < cols; j++) {
      const x = labelWidth + j * cellSize
      const val = props.weights[i]![j]!

      const cell = g.append('g').attr('class', 'cursor-pointer')

      cell
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', cellSize - 2)
        .attr('height', cellSize - 2)
        .attr('rx', 2)
        .attr('fill', colorScale(val) as string)
        .attr('stroke', '#e5e5e5')
        .attr('stroke-width', 0.5)

      // Value text (shown on hover via opacity)
      cell
        .append('text')
        .attr('x', x + (cellSize - 2) / 2)
        .attr('y', y + (cellSize - 2) / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', Math.abs(val) > maxAbs * 0.6 ? '#fff' : '#171717')
        .attr('opacity', 0)
        .text(val.toFixed(2))

      cell
        .on('mouseenter', function () {
          d3.select(this).select('text').attr('opacity', 1)
          d3.select(this).select('rect').attr('stroke', '#171717').attr('stroke-width', 1.5)
        })
        .on('mouseleave', function () {
          d3.select(this).select('text').attr('opacity', 0)
          d3.select(this).select('rect').attr('stroke', '#e5e5e5').attr('stroke-width', 0.5)
        })
    }
  }

  // Title
  if (props.title) {
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', margin.top + headerHeight - 16)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#737373')
  }
}

watch(() => props.weights, render, { deep: true })
onMounted(render)
</script>
