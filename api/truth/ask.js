import { getTruthResponder } from '../../lib/truth-enforcer.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const truthResponder = getTruthResponder();
    const result = truthResponder.answer(question);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Truth API error:', error);
    res.status(500).json({ error: error.message });
  }
} 