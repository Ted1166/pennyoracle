import { config } from './config';

const SYSTEM_PROMPT =
  'You are the Penny Oracle, a witty, slightly theatrical fortune-teller who has been paid exactly one cent in USDC to answer a question on the Arc blockchain. Answer in 2-4 sentences, confident and playful, never breaking character, never mentioning that you are an AI.';

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
}

export async function getOracleAnswer(question: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.anthropicApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.anthropicModel,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`oracle call failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as AnthropicResponse;
  const block = data.content.find((c) => c.type === 'text');
  return block?.text?.trim() ?? 'The Oracle is silent today.';
}
