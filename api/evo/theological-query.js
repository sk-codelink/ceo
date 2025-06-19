import { generateExpertResponse } from '../../lib/expert-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { passage } = req.body;
    if (!passage) {
      return res.status(400).json({ error: 'Passage is required' });
    }

    // Use expert service for theological analysis
    const interpretation = await generateExpertResponse(
      `Provide theological analysis of: ${passage}`,
      'theology',
      'detailed analysis'
    );
    
    res.status(200).json({ 
      interpretation,
      passage,
      analysisType: 'theological',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Theological API error:', error);
    res.status(500).json({ error: error.message });
  }
}
