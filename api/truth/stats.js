import { getTruthResponder } from '../../lib/truth-enforcer.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const truthResponder = getTruthResponder();
    const stats = truthResponder.getStats();
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Truth Stats API error:', error);
    res.status(500).json({ error: error.message });
  }
} 