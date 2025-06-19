import { generateExpertResponse } from '../../lib/expert-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestText, domain = 'general', format = 'report' } = req.body;
    if (!requestText) {
      return res.status(400).json({ error: 'Request text is required' });
    }

    const expertReply = await generateExpertResponse(requestText, domain, format);
    
    res.status(200).json({ 
      expertReply,
      domain,
      format,
      cached: false, // You could implement cache hit detection
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Expert API error:', error);
    res.status(500).json({ error: error.message });
  }
}
