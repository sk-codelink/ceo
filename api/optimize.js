export default async function handler(req, res) {
    // forward your “optimize this data” job to Claude
    const bodyPrompt = `
  Human: Optimize the following data for me:
  ${JSON.stringify(req.body.data)}
  
  Assistant:`;
  
    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-4-opus",
        prompt: bodyPrompt,
        max_tokens_to_sample: 300,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    res.status(200).json(data);
  }
  