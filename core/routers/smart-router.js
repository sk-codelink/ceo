import { getChatOptimizer } from '../../lib/chat-optimizer.js';

/**
 * Smart Router - Decides which action to take based on user input
 * This is the BRAIN of our system - it analyzes user questions and routes them
 */
export class SmartRouter {
  constructor() {
    this.chatOptimizer = getChatOptimizer();
    
    // Available actions with descriptions
    this.availableActions = {
      'ping': 'Health check requests, system status',
      'ask_truth': 'Simple factual questions, definitions, basic information',
      'truth_stats': 'Statistics about knowledge base',
      'expert_query': 'Complex technical questions, detailed analysis, professional explanations',
      'enhance_prompt': 'Vague requests like "make a game", "build an app" that need clarification',
      'generate_code': 'Requests for code, programming, scripts, functions',
      'generate_tool': 'Complex tool/module generation requests',
      'debate': 'Questions asking for arguments, pros/cons, different perspectives',
      'theological_query': 'Religious, spiritual, philosophical questions',
      'swarm': 'Complex multi-agent tasks requiring multiple perspectives',
      'creator_response': 'Questions about who created something',
      'auth_login': 'Authentication/login requests',
      'encrypt': 'Encryption requests (admin only)',
      'decrypt': 'Decryption requests (admin only)',
      'generate_data': 'Data optimization requests',
      'optimize': 'Data analysis and optimization',
      'general_llm': 'Everything else, complex discussions, creative tasks, casual conversation'
    };
  }

  /**
   * Main routing method - determines best action for user input
   * @param {string} userInput - The user's question/request
   * @returns {Promise<{action: string, confidence: number, reasoning: string}>}
   */
  async routeUserInput(userInput) {
    try {
      // Handle direct action requests (legacy support)
      if (userInput.startsWith('[DIRECT_ACTION:')) {
        return this.handleDirectAction(userInput);
      }

      const routingPrompt = this.buildRoutingPrompt(userInput);
      const response = await this.chatOptimizer.ask(routingPrompt, 'free');
      
      return this.parseRoutingResponse(response, userInput);
    } catch (error) {
      console.error('Smart Router Error:', error);
      return {
        action: 'general_llm',
        confidence: 0.5,
        reasoning: 'Fallback due to routing error - using general LLM'
      };
    }
  }

  /**
   * Handle direct action requests (legacy format)
   * @param {string} userInput 
   * @returns {object}
   */
  handleDirectAction(userInput) {
    const match = userInput.match(/\[DIRECT_ACTION:([^\]]+)\]/);
    if (match) {
      const requestedAction = match[1];
      if (this.availableActions[requestedAction]) {
        return {
          action: requestedAction,
          confidence: 1.0,
          reasoning: 'Direct action specified by user'
        };
      }
    }
    
    return {
      action: 'general_llm',
      confidence: 0.8,
      reasoning: 'Invalid direct action, using general LLM'
    };
  }

  /**
   * Builds the routing prompt for LLM
   * @param {string} userInput 
   * @returns {string}
   */
  buildRoutingPrompt(userInput) {
    const actionsList = Object.entries(this.availableActions)
      .map(([action, description]) => `- ${action}: ${description}`)
      .join('\n');

    return `You are an intelligent API router. Analyze the user's input and determine the BEST action to handle their request.

AVAILABLE ACTIONS:
${actionsList}

USER INPUT: "${userInput}"

SMART ROUTING RULES:
1. GENERAL_LLM for:
   - Simple greetings, casual conversation
   - Current/real-time information (today's date, current time, weather, news)
   - Creative requests, storytelling, opinions
   - Questions that need conversational responses
   - Dynamic information that changes over time

2. ASK_TRUTH only for:
   - Static factual definitions ("what is photosynthesis", "define democracy")
   - Historical facts that don't change
   - Scientific concepts and explanations
   - NOT for current/dynamic information

3. GENERATE_CODE for: Programming, scripts, functions, code requests
4. EXPERT_QUERY for: Complex technical analysis, detailed professional explanations  
5. DEBATE for: Arguments, pros/cons, different perspectives
6. When in doubt → use 'general_llm' (it's the safest choice)

EXAMPLES:
- "what is date today?" → general_llm (real-time info)
- "what is photosynthesis?" → ask_truth (static fact)
- "what time is it?" → general_llm (real-time info)
- "what is democracy?" → ask_truth (static definition)

Please respond in this exact JSON format:
{
  "action": "chosen_action_name",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this action was chosen"
}

IMPORTANT: Prefer 'general_llm' for any ambiguous or conversational requests.`;
  }

  /**
   * Parses the LLM routing response
   * @param {string} response 
   * @param {string} userInput 
   * @returns {object}
   */
  parseRoutingResponse(response, userInput) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate the action exists
        if (this.availableActions[parsed.action]) {
          return {
            action: parsed.action,
            confidence: parsed.confidence || 0.8,
            reasoning: parsed.reasoning || 'Auto-routed by AI'
          };
        }
      }
      
      // Fallback: simple keyword matching
      return this.fallbackRouting(userInput);
      
    } catch (error) {
      console.error('Routing parse error:', error);
      return this.fallbackRouting(userInput);
    }
  }

  /**
   * Simple fallback routing using keywords
   * @param {string} userInput 
   * @returns {object}
   */
  fallbackRouting(userInput) {
    const input = userInput.toLowerCase();
    
    // PRIORITY 1: Real-time/dynamic information should go to general_llm
    const realTimeKeywords = ['today', 'now', 'current', 'currently', 'this week', 'this month', 'this year', 'time', 'date today', 'what time'];
    if (realTimeKeywords.some(keyword => input.includes(keyword))) {
      return {
        action: 'general_llm',
        confidence: 0.9,
        reasoning: `Real-time information request detected: "${realTimeKeywords.find(k => input.includes(k))}" - using general LLM for dynamic content`
      };
    }

    // PRIORITY 2: Specific action routing
    const routingMap = {
      'ping': ['ping', 'health', 'status', 'alive', 'working'],
      'generate_code': ['code', 'function', 'script', 'programming', 'javascript', 'python', 'create function', 'write code', 'build app', 'make function'],
      'debate': ['argue', 'debate', 'pros', 'cons', 'versus', 'vs', 'against', 'why better', 'compare'],
      'expert_query': ['analyze', 'detailed analysis', 'technical explanation', 'professional', 'expert opinion', 'research'],
      'theological_query': ['god', 'jesus', 'bible', 'prayer', 'faith', 'religious', 'christ', 'islam', 'spiritual'],
      // ask_truth: Only for STATIC factual definitions (not dynamic info)
      'ask_truth': ['define', 'definition of', 'meaning of', 'explain concept', 'what does mean', 'scientific definition']
    };

    for (const [action, keywords] of Object.entries(routingMap)) {
      if (keywords.some(keyword => input.includes(keyword))) {
        return {
          action,
          confidence: 0.8,
          reasoning: `Keyword-based routing: matched "${keywords.find(k => input.includes(k))}" for ${action}`
        };
      }
    }

    // SPECIAL CASE: "what is" questions - need context awareness
    if (input.includes('what is')) {
      // Check if it's asking for static definition vs dynamic info
      const staticFactPatterns = [
        'what is photosynthesis', 'what is democracy', 'what is gravity', 
        'what is machine learning', 'what is javascript', 'what is python',
        'what is capitalism', 'what is socialism'
      ];
      
      if (staticFactPatterns.some(pattern => input.includes(pattern.replace('what is ', '')))) {
        return {
          action: 'ask_truth',
          confidence: 0.8,
          reasoning: 'Static factual definition request - using ask_truth for knowledge base lookup'
        };
      }
      
      // All other "what is" questions go to general_llm
      return {
        action: 'general_llm',
        confidence: 0.8,
        reasoning: 'General "what is" question - using general_llm for conversational response'
      };
    }

    // ALWAYS fallback to general_llm for unmatched inputs
    return {
      action: 'general_llm',
      confidence: 0.7,
      reasoning: 'No specific pattern matched, using general_llm for natural conversation'
    };
  }

  /**
   * Convert user input to appropriate payload for the chosen action
   * @param {string} userInput 
   * @param {string} action 
   * @returns {object}
   */
  buildPayloadForAction(userInput, action) {
    // Clean the userInput from direct action prefix if present
    const cleanInput = userInput.startsWith('[DIRECT_ACTION:') 
      ? userInput.replace(/\[DIRECT_ACTION:[^\]]+\]\s*/, '')
      : userInput;

    const payloadMap = {
      'ping': {},
      'ask_truth': { question: cleanInput },
      'truth_stats': {},
      'expert_query': { requestText: cleanInput, domain: 'general', format: 'report' },
      'enhance_prompt': { input: cleanInput },
      'generate_code': { requestText: cleanInput, language: 'javascript' },
      'generate_tool': { requestText: cleanInput },
      'debate': { topic: cleanInput },
      'theological_query': { passage: cleanInput },
      'swarm': { task: cleanInput, payload: {} },
      'creator_response': { subject: cleanInput },
      'generate_data': { data: cleanInput },
      'optimize': { data: cleanInput },
      'general_llm': { question: cleanInput }
    };

    return payloadMap[action] || { question: cleanInput };
  }
} 