import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

export interface BedrockMessage {
  role: "user" | "assistant";
  content: string;
}

export async function invokeModel(
  system: string,
  messages: BedrockMessage[],
): Promise<string> {
  if (process.env.BEDROCK_MOCK === "true") {
    return getMockResponse(messages);
  }

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    system,
    messages,
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text;
}

export async function* invokeModelStream(
  system: string,
  messages: BedrockMessage[],
): AsyncGenerator<string> {
  if (process.env.BEDROCK_MOCK === "true") {
    const mockText = getMockResponse(messages);
    const words = mockText.split(" ");
    for (const word of words) {
      yield word + " ";
      await new Promise((r) => setTimeout(r, 50));
    }
    return;
  }

  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    system,
    messages,
  });

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  if (!response.body) return;

  for await (const event of response.body) {
    if (event.chunk?.bytes) {
      const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));
      if (chunk.type === "content_block_delta" && chunk.delta?.text) {
        yield chunk.delta.text;
      }
    }
  }
}

function getMockResponse(messages: BedrockMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content || "";

  if (lastMessage.includes("quiz") || lastMessage.includes("クイズ")) {
    return JSON.stringify({
      questions: [
        {
          id: "q1",
          text: "トークン化の目的は何ですか？",
          choices: [
            "テキストをモデルが処理できる数値に変換するため",
            "テキストを翻訳するため",
            "テキストを要約するため",
            "テキストを暗号化するため",
          ],
          correctIndex: 0,
          explanation: "トークン化は、テキストをモデルが処理できる数値トークンに変換するプロセスです。",
        },
        {
          id: "q2",
          text: "Attention機構の役割は？",
          choices: [
            "データを保存する",
            "入力の重要な部分に注目する",
            "出力を暗号化する",
            "モデルを軽量化する",
          ],
          correctIndex: 1,
          explanation: "Attention機構は、入力シーケンスの中で重要な部分に注目するメカニズムです。",
        },
      ],
    });
  }

  if (lastMessage.includes("evaluate") || lastMessage.includes("評価")) {
    return JSON.stringify({
      score: 80,
      feedback: "よくできました！Attention機構の理解が深まっています。",
      corrections: [],
    });
  }

  return "GPTは、Transformer アーキテクチャに基づく大規模言語モデルです。入力テキストをトークン化し、Self-Attention 機構を通じて文脈を理解し、次のトークンを予測することでテキストを生成します。学習は大量のテキストデータで行われ、パターンを統計的に学習します。";
}
