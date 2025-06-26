// lib/chat-optimizer.js
// Centralized routing & cost-control for all LLM calls
import { Anthropic } from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = 'You are Evo AI, a precise and truthful assistant. always answer in respect of all religions and scriptures. Never disrespect any religion or scripture. Always be respectful and kind.';

class ChatOptimizer {
  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.tierPricing = {
      free: 'claude-3-haiku-20240307',
      paid: 'claude-3-opus-20240229'
    };
    this.simpleKeywords = new Set(['define', 'synonym', 'translate', 'short']);
  }

  selectModel(prompt, tier) {
    if (tier === 'paid') return this.tierPricing.paid;
    const text = prompt.toLowerCase();
    for (const kw of this.simpleKeywords) {
      if (text.includes(kw)) return this.tierPricing.free;
    }
    return this.tierPricing.free;
  }

  maxTokensFor(tier) {
    return tier === 'free' ? 300 : 800;
  }

  async ask(prompt, tier = 'free') {
    const model = this.selectModel(prompt, tier);
    const messages = [
      { role: 'user', content: prompt }
    ];

    const resp = await this.client.messages.create({
      model,
      system: SYSTEM_PROMPT,
      messages,
      max_tokens: this.maxTokensFor(tier),
      temperature: 0.7
    });

    return resp.content[0].text;
  }
}

// Singleton instance
let chatOptimizer = null;

export function getChatOptimizer() {
  if (!chatOptimizer) {
    chatOptimizer = new ChatOptimizer();
  }
  return chatOptimizer;
}

export default ChatOptimizer; 