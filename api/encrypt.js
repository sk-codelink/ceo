import { getSecurityManager, requirePermission } from '../lib/security.js';

async function encryptHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const security = getSecurityManager();
    const result = security.encrypt(JSON.stringify(data));
    
    res.status(200).json({
      success: true,
      encrypted: result.encrypted,
      metadata: {
        keyId: result.key.substring(0, 8) + '...',
        algorithm: 'AES-256-GCM',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Encrypt API error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requirePermission('encrypt')(encryptHandler); 