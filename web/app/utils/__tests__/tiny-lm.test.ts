import { describe, it, expect } from 'vitest'
import { Vocab, TinyLM, trainTinyLM } from '../tiny-lm'

const TEXT = 'ももたろうはももからうまれた'

describe('Vocab', () => {
  const vocab = new Vocab(TEXT)

  it('encode → decode で元に戻る', () => {
    const encoded = vocab.encode(TEXT)
    const decoded = encoded.map((i) => vocab.toC.get(i)!).join('')
    expect(decoded).toBe(TEXT)
  })

  it('語彙サイズがユニーク文字数と一致', () => {
    const unique = new Set([...TEXT])
    expect(vocab.size).toBe(unique.size)
  })

  it('chars がソート済み', () => {
    const sorted = [...vocab.chars].sort()
    expect(vocab.chars).toEqual(sorted)
  })
})

describe('TinyLM', () => {
  const vocab = new Vocab(TEXT)
  const model = new TinyLM(vocab.size)

  it('パラメータ数が 153', () => {
    expect(model.paramCount).toBe(153)
  })

  describe('forward', () => {
    const X = vocab.encode('ももたろうはももからうまれ')
    const { probs } = model.forward(X)

    it('softmax 出力の合計が 1.0', () => {
      for (const row of probs) {
        const sum = row.reduce((a, b) => a + b, 0)
        expect(sum).toBeCloseTo(1.0, 5)
      }
    })

    it('全値が 0〜1 の範囲', () => {
      for (const row of probs) {
        for (const v of row) {
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(1)
        }
      }
    })
  })

  describe('loss', () => {
    it('初期状態で loss > 0', () => {
      const X = vocab.encode('ももたろうはももからうまれ')
      const Y = vocab.encode('もたろうはももからうまれた')
      const { probs } = model.forward(X)
      const loss = model.loss(probs, Y)
      expect(loss).toBeGreaterThan(0)
    })
  })

  describe('backward', () => {
    it('1ステップ後に loss が下がる', () => {
      const m = new TinyLM(vocab.size)
      const X = vocab.encode('ももたろうはももからうまれ')
      const Y = vocab.encode('もたろうはももからうまれた')

      const { probs: p1, h: h1 } = m.forward(X)
      const loss1 = m.loss(p1, Y)

      m.backward(p1, Y, h1, X, 1.0)

      const { probs: p2 } = m.forward(X)
      const loss2 = m.loss(p2, Y)

      expect(loss2).toBeLessThan(loss1)
    })
  })
})

describe('trainTinyLM', () => {
  it('300ステップ後の loss が初期より大幅に下がる', () => {
    const { snapshots } = trainTinyLM(TEXT, 300, 1.0, 10)
    const initialLoss = snapshots[0]!.loss
    const finalLoss = snapshots[snapshots.length - 1]!.loss
    expect(finalLoss).toBeLessThan(initialLoss * 0.5)
  })

  it('スナップショットが記録されている', () => {
    const { snapshots } = trainTinyLM(TEXT, 10, 1.0, 1)
    // 10 steps (0..9) + final = 11
    expect(snapshots.length).toBe(11)
  })
})

describe('generate', () => {
  it('指定した長さの文字列が生成される', () => {
    const { vocab, model } = trainTinyLM(TEXT, 100, 1.0, 100)
    const generated = model.generate('も', 10, vocab)
    // start char + 10 generated = 11
    expect(generated.length).toBe(11)
  })

  it('全文字が語彙に含まれる', () => {
    const { vocab, model } = trainTinyLM(TEXT, 100, 1.0, 100)
    const generated = model.generate('も', 20, vocab)
    for (const ch of generated) {
      expect(vocab.toI.has(ch)).toBe(true)
    }
  })
})
