/**
 * rawminilm/tiny.py の TypeScript 移植
 * たった153個のパラメータで「ももたろう」を学習する最小のAI
 */

// --- 文字 ↔ 番号変換 ---
export class Vocab {
  chars: string[]
  size: number
  toI: Map<string, number>
  toC: Map<number, string>

  constructor(text: string) {
    this.chars = [...new Set(text)].sort()
    this.size = this.chars.length
    this.toI = new Map(this.chars.map((c, i) => [c, i]))
    this.toC = new Map(this.chars.map((c, i) => [i, c]))
  }

  encode(text: string): number[] {
    return [...text].map((c) => this.toI.get(c)!)
  }
}

// --- ヘルパー: 乱数生成 ---
function randn(): number {
  // Box-Muller transform
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function uniformRandom(low: number, high: number): number {
  return low + Math.random() * (high - low)
}

// --- 2D 配列ヘルパー ---
function zeros(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => new Array(cols).fill(0))
}

function zerosFlat(n: number): number[] {
  return new Array(n).fill(0)
}

// --- 学習ステップごとのスナップショット ---
export interface TrainingSnapshot {
  step: number
  loss: number
  embWeight: number[][]
  linearWeight: number[][]
  linearBias: number[]
  probs: number[][]   // 各入力文字の予測確率
}

// --- 順伝播の結果 ---
export interface ForwardResult {
  probs: number[][]  // (N, vocabSize)
  h: number[][]      // (N, embDim) embedding output
}

export class TinyLM {
  embWeight: number[][]     // (vocabSize, embDim)
  linearWeight: number[][]  // (embDim, vocabSize)
  linearBias: number[]      // (vocabSize)

  readonly vocabSize: number
  readonly embDim: number

  constructor(vocabSize: number, embDim: number = 8) {
    this.vocabSize = vocabSize
    this.embDim = embDim

    // 文字の変換表 (9×8 = 72個)
    this.embWeight = Array.from({ length: vocabSize }, () =>
      Array.from({ length: embDim }, () => randn()),
    )

    // 予測の点数表 (8×9 = 72個)
    const bound = 1.0 / Math.sqrt(embDim)
    this.linearWeight = Array.from({ length: embDim }, () =>
      Array.from({ length: vocabSize }, () => uniformRandom(-bound, bound)),
    )

    // 予測の調整値 (9個)
    this.linearBias = zerosFlat(vocabSize)
  }

  get paramCount(): number {
    return (
      this.vocabSize * this.embDim +
      this.embDim * this.vocabSize +
      this.vocabSize
    )
  }

  // --- 順伝播: 文字を入れたら予測が出る ---
  forward(X: number[]): ForwardResult {
    const N = X.length

    // 変換表を引く
    const h: number[][] = X.map((xi) => [...this.embWeight[xi]!])

    // 点数を計算: logits = h @ linearWeight + linearBias
    const logits: number[][] = zeros(N, this.vocabSize)
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < this.vocabSize; j++) {
        let sum = this.linearBias[j]!
        for (let k = 0; k < this.embDim; k++) {
          sum += h[i]![k]! * this.linearWeight[k]![j]!
        }
        logits[i]![j] = sum
      }
    }

    // softmax: 点数 → パーセント
    const probs: number[][] = zeros(N, this.vocabSize)
    for (let i = 0; i < N; i++) {
      const maxVal = Math.max(...logits[i]!)
      const expVals = logits[i]!.map((v) => Math.exp(v - maxVal))
      const sumExp = expVals.reduce((a, b) => a + b, 0)
      for (let j = 0; j < this.vocabSize; j++) {
        probs[i]![j] = expVals[j]! / sumExp
      }
    }

    return { probs, h }
  }

  // --- ハズレを測る (Cross Entropy Loss) ---
  loss(probs: number[][], Y: number[]): number {
    const N = Y.length
    let totalLoss = 0
    for (let i = 0; i < N; i++) {
      totalLoss += -Math.log(probs[i]![Y[i]!]!)
    }
    return totalLoss / N
  }

  // --- 逆伝播: 3つの表の数値を直す ---
  backward(probs: number[][], Y: number[], h: number[][], X: number[], lr: number): void {
    const N = Y.length

    // 点数に対する修正指示: 予測確率 - 正解
    const dlogits: number[][] = probs.map((row) => [...row])
    for (let i = 0; i < N; i++) {
      const row = dlogits[i]!
      const yi = Y[i]!
      row[yi] = row[yi]! - 1
    }
    for (let i = 0; i < N; i++) {
      const row = dlogits[i]!
      for (let j = 0; j < this.vocabSize; j++) {
        row[j] = row[j]! / N
      }
    }

    // 点数表への修正指示: h^T @ dlogits
    const dlinearWeight: number[][] = zeros(this.embDim, this.vocabSize)
    for (let k = 0; k < this.embDim; k++) {
      for (let j = 0; j < this.vocabSize; j++) {
        let sum = 0
        for (let i = 0; i < N; i++) {
          sum += h[i]![k]! * dlogits[i]![j]!
        }
        dlinearWeight[k]![j] = sum
      }
    }

    // 調整値への修正指示
    const dlinearBias: number[] = zerosFlat(this.vocabSize)
    for (let j = 0; j < this.vocabSize; j++) {
      for (let i = 0; i < N; i++) {
        dlinearBias[j]! += dlogits[i]![j]!
      }
    }

    // 変換表への修正指示: dlogits @ linearWeight^T
    const dh: number[][] = zeros(N, this.embDim)
    for (let i = 0; i < N; i++) {
      for (let k = 0; k < this.embDim; k++) {
        let sum = 0
        for (let j = 0; j < this.vocabSize; j++) {
          sum += dlogits[i]![j]! * this.linearWeight[k]![j]!
        }
        dh[i]![k] = sum
      }
    }

    const dembWeight: number[][] = zeros(this.vocabSize, this.embDim)
    for (let i = 0; i < N; i++) {
      const row = dembWeight[X[i]!]!
      for (let k = 0; k < this.embDim; k++) {
        row[k] = row[k]! + dh[i]![k]!
      }
    }

    // 実際に表の数値を直す
    for (let i = 0; i < this.vocabSize; i++) {
      const embRow = this.embWeight[i]!
      for (let k = 0; k < this.embDim; k++) {
        embRow[k] = embRow[k]! - lr * dembWeight[i]![k]!
      }
    }
    for (let k = 0; k < this.embDim; k++) {
      const lwRow = this.linearWeight[k]!
      for (let j = 0; j < this.vocabSize; j++) {
        lwRow[j] = lwRow[j]! - lr * dlinearWeight[k]![j]!
      }
    }
    for (let j = 0; j < this.vocabSize; j++) {
      this.linearBias[j] = this.linearBias[j]! - lr * dlinearBias[j]!
    }
  }

  // --- テキスト生成 ---
  generate(startChar: string, length: number, vocab: Vocab): string {
    let ch = startChar
    let result = ch

    for (let t = 0; t < length; t++) {
      const xIdx = vocab.toI.get(ch)!

      // 1文字ぶん forward
      const h = [...this.embWeight[xIdx]!]
      const logits = zerosFlat(this.vocabSize)
      for (let j = 0; j < this.vocabSize; j++) {
        let sum = this.linearBias[j]!
        for (let k = 0; k < this.embDim; k++) {
          sum += h[k]! * this.linearWeight[k]![j]!
        }
        logits[j] = sum
      }

      const maxVal = Math.max(...logits)
      const expVals = logits.map((v) => Math.exp(v - maxVal))
      const sumExp = expVals.reduce((a, b) => a + b, 0)
      const probs = expVals.map((v) => v / sumExp)

      // 確率に従って1文字選ぶ
      const r = Math.random()
      let cumulative = 0
      let chosen = 0
      for (let j = 0; j < this.vocabSize; j++) {
        cumulative += probs[j]!
        if (r < cumulative) {
          chosen = j
          break
        }
      }

      ch = vocab.toC.get(chosen)!
      result += ch
    }

    return result
  }

  // --- ディープコピー ---
  cloneWeights(): { embWeight: number[][]; linearWeight: number[][]; linearBias: number[] } {
    return {
      embWeight: this.embWeight.map((row) => [...row]),
      linearWeight: this.linearWeight.map((row) => [...row]),
      linearBias: [...this.linearBias],
    }
  }
}

// --- 学習を実行してスナップショットを返す ---
export function trainTinyLM(
  text: string = 'ももたろうはももからうまれた',
  steps: number = 300,
  lr: number = 1.0,
  snapshotInterval: number = 1,
): { vocab: Vocab; model: TinyLM; snapshots: TrainingSnapshot[] } {
  const vocab = new Vocab(text)
  const model = new TinyLM(vocab.size)

  const chars = [...text]
  const X = vocab.encode(chars.slice(0, -1).join(''))
  const Y = vocab.encode(chars.slice(1).join(''))

  const snapshots: TrainingSnapshot[] = []

  for (let step = 0; step < steps; step++) {
    const { probs, h } = model.forward(X)
    const loss = model.loss(probs, Y)

    if (step % snapshotInterval === 0) {
      const weights = model.cloneWeights()
      snapshots.push({
        step,
        loss,
        embWeight: weights.embWeight,
        linearWeight: weights.linearWeight,
        linearBias: weights.linearBias,
        probs: probs.map((row) => [...row]),
      })
    }

    model.backward(probs, Y, h, X, lr)
  }

  // Final snapshot
  const { probs } = model.forward(X)
  const finalLoss = model.loss(probs, Y)
  const finalWeights = model.cloneWeights()
  snapshots.push({
    step: steps,
    loss: finalLoss,
    embWeight: finalWeights.embWeight,
    linearWeight: finalWeights.linearWeight,
    linearBias: finalWeights.linearBias,
    probs: probs.map((row) => [...row]),
  })

  return { vocab, model, snapshots }
}
