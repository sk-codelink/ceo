import { generateExpertTool } from '../../lib/expert-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requestText, toolName, capabilities = [] } = req.body;
    if (!requestText || !toolName) {
      return res.status(400).json({ error: 'Request text and tool name are required' });
    }

    const tool = await generateExpertTool(requestText, toolName, capabilities);
    
    res.status(200).json({ 
      tool,
      toolName,
      capabilities,
      complexity: capabilities.length > 3 ? 'advanced' : 'standard',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate Tool API error:', error);
    res.status(500).json({ error: error.message });
  }
} 