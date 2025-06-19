import { getRBACManager } from '../../lib/security.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, role = 'user' } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const rbac = getRBACManager();
    const token = rbac.generateToken(userId, role);
    
    res.status(200).json({ 
      token,
      userId,
      role,
      expiresIn: '24h',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({ error: error.message });
  }
} 