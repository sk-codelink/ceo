import { generateExpertCode } from '../../lib/expert-service.js';
import { getChatOptimizer } from '../../lib/chat-optimizer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestText, language = 'javascript', framework = '' } = req.body;
    if (!requestText) {
      return res.status(400).json({ error: 'Request text is required' });
    }

    const userTier = req.headers['x-user-tier'] || 'free';
    
    // Generate the code
    const code = await generateExpertCode(requestText, language, framework);
    
    // Optionally optimize with ChatOptimizer for paid users
    let optimizedVersion = null;
    if (userTier === 'paid') {
      const chatOptimizer = getChatOptimizer();
      optimizedVersion = await chatOptimizer.ask(
        `Review and optimize this code:\n${code}`,
        userTier
      );
    }
    
    res.status(200).json({ 
      code,
      optimizedVersion,
      language,
      framework,
      tier: userTier,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate Code API error:', error);
    res.status(500).json({ error: error.message });
  }
} 