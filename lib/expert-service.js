// lib/expert-service.js
// Expert service for domain-specific responses
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Simple in-memory cache for Vercel (you might want Redis for production)
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function buildExpertPrompt(requestText, domain, format) {
  return `You are a world-class, PhD-level expert in ${domain}.
Deliver a ${format} addressing:
${requestText}

Requirements:
- Authoritative, detailed
- Structured with headings
- Actionable steps if relevant
- Cite best practices
- Concise yet comprehensive
- Maintain security & ethics
`;
}

export async function generateExpertResponse(requestText, domain = 'general', format = 'report') {
  const key = `${domain}::${format}::${requestText}`;
  
  // Check cache
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.result;
    } else {
      cache.delete(key);
    }
  }

  const prompt = buildExpertPrompt(requestText, domain, format);
  const resp = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You are an expert AI assistant.' },
      { role: 'user', content: prompt }
    ]
  });

  const result = resp.content[0].text.trim();
  
  // Cache the result
  cache.set(key, {
    result,
    timestamp: Date.now()
  });
  
  return result;
}

export async function generateExpertCode(requestText, language = 'javascript', framework = '') {
  const prompt = `Generate clean, production-ready ${language} code for: ${requestText}
  ${framework ? `Using framework: ${framework}` : ''}
  
  Requirements:
  - Follow best practices and conventions
  - Include proper error handling
  - Add meaningful comments
  - Make it modular and reusable
  - Include basic tests if applicable
  `;

  return await generateExpertResponse(prompt, 'software-development', 'code-module');
}

export async function generateExpertTool(requestText, toolName, capabilities = []) {
  const capabilitiesText = capabilities.length > 0 
    ? `Capabilities required: ${capabilities.join(', ')}`
    : '';

  const prompt = `Design and implement a complete tool/module: ${toolName}
  
  Purpose: ${requestText}
  ${capabilitiesText}
  
  Create a comprehensive solution including:
  - Main class/module architecture
  - Configuration options
  - Error handling and validation
  - Usage examples
  - API documentation
  - Security considerations
  `;

  return await generateExpertResponse(prompt, 'software-architecture', 'complete-tool');
} 