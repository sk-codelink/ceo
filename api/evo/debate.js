import { getDebateResponder } from '../../lib/debate-responder.js';
import { getChatOptimizer } from '../../lib/chat-optimizer.js';
import { getTruthResponder } from '../../lib/truth-enforcer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const userTier = req.headers['x-user-tier'] || 'free';
    
    // First check for grounded response
    const truthResponder = getTruthResponder();
    const groundedResponse = truthResponder.answer(topic);
    
    if (groundedResponse.grounded) {
      return res.status(200).json({ 
        reply: groundedResponse.answer,
        sources: groundedResponse.sources,
        grounded: true,
        confidence: groundedResponse.confidence
      });
    }
    
    // Then try the debate responder for specific topics
    const debateResponder = getDebateResponder();
    const debateResponse = debateResponder.answer(topic);
    
    // If it's a generic response, enhance with ChatOptimizer
    if (debateResponse.includes('[Generic debate response would go here]')) {
      const chatOptimizer = getChatOptimizer();
      const enhancedResponse = await chatOptimizer.ask(
        `Provide a thoughtful debate response for: ${topic}`,
        userTier
      );
      
      return res.status(200).json({ 
        reply: enhancedResponse,
        source: 'chat-optimizer',
        tier: userTier,
        grounded: false
      });
    }
    
    // Return specific debate response
    res.status(200).json({ 
      reply: debateResponse,
      source: 'debate-responder',
      grounded: true,
      enhanced: true
    });
  } catch (error) {
    console.error('Debate API error:', error);
    res.status(500).json({ error: error.message });
  }
}
