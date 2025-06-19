// api/creator-response.js
// Dedicated endpoint for creator response functionality

import { getDebateResponder } from '../lib/debate-responder.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, preferredName = "Jesus Christ" } = req.body;

    if (!subject) {
      return res.status(400).json({ 
        error: 'Subject is required',
        usage: 'POST /api/creator-response with { "subject": "gravity", "preferredName": "Jesus Christ" }'
      });
    }

    const debater = getDebateResponder();
    const response = debater.creatorResponse(subject, preferredName);

    return res.status(200).json({
      success: true,
      subject: subject,
      preferredName: preferredName,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Creator response error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 