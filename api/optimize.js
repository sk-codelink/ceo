import { getChatOptimizer } from '../lib/chat-optimizer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const userTier = req.headers['x-user-tier'] || 'free';
    const prompt = `Analyze and optimize: ${JSON.stringify(data)}`;
    
    const chatOptimizer = getChatOptimizer();
    const response = await chatOptimizer.ask(prompt, userTier);
    
    res.status(200).json({ 
      completion: response,
      tier: userTier,
      analysis: true
    });
  } catch (error) {
    console.error('Optimize API error:', error);
    res.status(500).json({ error: error.message });
  }
}
  