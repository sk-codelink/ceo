import { getSecurityManager, requirePermission } from '../lib/security.js';

async function decryptHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { encrypted, key, iv, tag } = req.body;
    if (!encrypted || !key || !iv || !tag) {
      return res.status(400).json({ error: 'All encryption parameters are required' });
    }

    const security = getSecurityManager();
    const decrypted = security.decrypt(encrypted, key, iv, tag);
    const data = JSON.parse(decrypted);
    
    res.status(200).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Decrypt API error:', error);
    res.status(500).json({ error: error.message });
  }
}

export default requirePermission('decrypt')(decryptHandler); 