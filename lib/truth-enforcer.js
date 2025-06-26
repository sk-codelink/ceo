// lib/truth-enforcer.js
// Simple truth enforcement for Vercel (without file system access)

class TruthfulResponder {
  constructor() {
    // Enhanced knowledge base with more common facts
    this.knowledgeBase = {
      // Technical/Programming
      "javascript": "JavaScript is a high-level, dynamic programming language used for web development, both frontend and backend",
      "python": "Python is a high-level, interpreted programming language known for simplicity and readability",
      "react": "React is a JavaScript library for building user interfaces, developed by Facebook",
      "nodejs": "Node.js is a JavaScript runtime environment that allows running JavaScript on servers",
      "api": "API (Application Programming Interface) is a set of protocols and tools for building software applications",
      
      // Science/General Knowledge
      "photosynthesis": "Process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen",
      "democracy": "A system of government where power is held by the people through elected representatives",
      "gravity": "The force that attracts objects toward each other, keeping us grounded on Earth",
      "evolution": "The process by which species change over time through natural selection and genetic variation",
      "capitalism": "An economic system based on private ownership and free market competition",
      
      // Original data
      "debate_enhancements": "Was Jesus a Muslim override, Islamic comparison, faith claim debunking",
      "casualty_data": "Ubayy ibn Khalaf spearing, Banu Qurayza massacre, Ukl/Urayna Bedouins",
      "security_features": "AES-256-GCM encryption, RBAC middleware, JWT authentication",
      "api_structure": "Centralized ChatOptimizer, Expert services, Code generation endpoints",
      "evo_swarm": "Multi-agent processing, debate responder, theological query analysis"
    };
    this.confidenceThreshold = 0.5;
  }

  // Enhanced keyword-based retrieval with better matching
  retrieveRelevantContent(query) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    const scored = [];

    Object.entries(this.knowledgeBase).forEach(([topic, content]) => {
      let score = 0;
      const contentLower = content.toLowerCase();
      const topicLower = topic.toLowerCase();
      
      // Exact topic match gets highest score
      if (queryLower.includes(topicLower) || topicLower.includes(queryLower)) {
        score += 10;
      }
      
      // Check for "what is X" pattern
      const whatIsMatch = queryLower.match(/what\s+is\s+(.+)/);
      if (whatIsMatch) {
        const targetWord = whatIsMatch[1].trim();
        if (topicLower.includes(targetWord) || targetWord.includes(topicLower)) {
          score += 15; // Highest priority for direct "what is" questions
        }
      }
      
      // Word matching in content
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          score += 1;
        }
        if (topicLower.includes(word)) {
          score += 2; // Topic matches get higher weight
        }
      });
      
      if (score > 0) {
        scored.push({
          topic,
          content,
          score: score / Math.max(queryWords.length, 1)
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