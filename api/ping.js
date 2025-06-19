export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: "vercel",
      services: {
        chatOptimizer: !!process.env.ANTHROPIC_API_KEY,
        evoSwarm: true,
        security: true,
        expertService: true
      },
      version: "1.0.0"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
  