// lib/truth-enforcer.js
// Simple truth enforcement for Vercel (without file system access)

class TruthfulResponder {
  constructor() {
    // Simple knowledge base from your data patches
    this.knowledgeBase = {
      "debate_enhancements": "Was Jesus a Muslim override, Islamic comparison, faith claim debunking",
      "casualty_data": "Ubayy ibn Khalaf spearing, Banu Qurayza massacre, Ukl/Urayna Bedouins",
      "security_features": "AES-256-GCM encryption, RBAC middleware, JWT authentication",
      "api_structure": "Centralized ChatOptimizer, Expert services, Code generation endpoints",
      "evo_swarm": "Multi-agent processing, debate responder, theological query analysis"
    };
    this.confidenceThreshold = 0.5;
  }

  // Simple keyword-based retrieval
  retrieveRelevantContent(query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const scored = [];

    Object.entries(this.knowledgeBase).forEach(([topic, content]) => {
      let score = 0;
      const contentLower = content.toLowerCase();
      
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          score += 1;
        }
      });
      
      if (score > 0) {
        scored.push({
          topic,
          content,
          score: score / queryWords.length
        });
      }
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  // Answer only from knowledge base
  answer(question) {
    const relevantContent = this.retrieveRelevantContent(question);
    
    if (relevantContent.length === 0 || relevantContent[0].score < this.confidenceThreshold) {
      return {
        answer: "I don't know - I cannot find relevant information in my knowledge base to answer this question.",
        confidence: 0,
        sources: [],
        grounded: false
      };
    }

    const bestMatch = relevantContent[0];
    return {
      answer: `Based on the available information: ${bestMatch.content}`,
      confidence: bestMatch.score,
      sources: [bestMatch.topic],
      grounded: true,
      retrievedContent: relevantContent.length
    };
  }

  // Get stats about knowledge base
  getStats() {
    return {
      totalEntries: Object.keys(this.knowledgeBase).length,
      topics: Object.keys(this.knowledgeBase),
      confidenceThreshold: this.confidenceThreshold
    };
  }
}

// Singleton instance
let truthResponder = null;

export function getTruthResponder() {
  if (!truthResponder) {
    truthResponder = new TruthfulResponder();
  }
  return truthResponder;
}

// Helper function to add grounded responses to any endpoint
export function addGroundedResponse(req, res, next) {
  req.getGroundedResponse = (question) => {
    const responder = getTruthResponder();
    return responder.answer(question);
  };
  next();
}

export { TruthfulResponder }; 