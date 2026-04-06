export interface Chapter {
  order: number
  slug: string
  title: string
  description: string
  icon: string
}

const chapters: Chapter[] = [
  {
    order: 1,
    slug: '1-basic-lm',
    title: '基礎LM',
    description: 'たった153個の数値で「ももたろう」を学習するAIを作る',
    icon: '🎲',
  },
  {
    order: 2,
    slug: '2-positional',
    title: 'Positional Encoding',
    description: '1文字だけでなく、文脈を考慮して予測する仕組みを学ぶ',
    icon: '🔤',
  },
  {
    order: 3,
    slug: '3-attention',
    title: 'Self-Attention',
    description: '文脈の中で「どの単語に注目すべきか」を自動で学ぶ仕組み',
    icon: '🔍',
  },
  {
    order: 4,
    slug: '4-transformer',
    title: 'Transformer ブロック',
    description: 'Multi-Head Attention + FFN + LayerNorm で GPT の基本ブロックを組み立てる',
    icon: '🎯',
  },
  {
    order: 5,
    slug: '5-gpt',
    title: 'GPT 全体像',
    description: 'Transformer ブロックを積み重ねて、テキストを生成する GPT の完全な姿',
    icon: '✨',
  },
]

export function useChapters() {
  const chapterByOrder = (order: number | string) =>
    chapters.find(c => c.order === Number(order))

  return {
    chapters,
    chapterByOrder,
  }
}
