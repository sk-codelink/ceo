import { getChatOptimizer } from '../../lib/chat-optimizer.js';

/**
 * Response Formatter - Formats the final response for users using LLM
 * This is the PRESENTER of our system - it makes responses user-friendly
 */
export class ResponseFormatter {
  constructor() {
    this.chatOptimizer = getChatOptimizer();
  }

  /**
   * Main formatting method - converts raw action results into user-friendly responses
   * @param {object} actionResult - Raw result from ActionProcessor
   * @param {string} userInput - Original user input
   * @param {object} routingInfo - Info from SmartRouter
   * @param {object} req - Request object for user preferences
   * @returns {Promise<object>} - Formatted response
   */
  async formatResponse(actionResult, userInput, routingInfo, req) {
    try {
      const userTier = req.headers['x-user-tier'] || 'free';
      
      // Determine if we need LLM formatting
      const needsFormatting = this.shouldFormatWithLLM(routingInfo.action, actionResult);
      
      if (!needsFormatting) {
        // Return structured response without LLM formatting
        return this.buildStructuredResponse(actionResult, userInput, routingInfo);
      }
      
      // Use LLM to create user-friendly response
      const formattedResponse = await this.formatWithLLM(actionResult, userInput, routingInfo, userTier);
      
      return {
        success: true,
        response: formattedResponse,
        meta: {
          action: routingInfo.action,
          processed_at: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('[ResponseFormatter] Error:', error);
      return this.buildErrorResponse(error, userInput, routingInfo);
    }
  }

  /**
   * Determines if response needs LLM formatting based on action type
   * @param {string} action 
   * @param {object} result 
   * @returns {boolean}
   */
  shouldFormatWithLLM(action, result) {
    // Actions that should use LLM formatting for better user experience
    const llmFormattingActions = [
      'ask_truth',
      'expert_query', 
      'debate',
      'theological_query',
      'swarm',
      'general_llm'
    ];
    
    // Actions that should return structured data as-is
    const structuredActions = [
      'ping',
      'auth_login',
      'encrypt',
      'decrypt',
      'truth_stats'
    ];
    
    if (structuredActions.includes(action)) {
      return false;
    }
    
    if (llmFormattingActions.includes(action)) {
      return true;
    }
    
    // For generate_code, only format if there's an error or optimization
    if (action === 'generate_code') {
      return !result.code || result.optimizedVersion;
    }
    
    return true; // Default to formatting
  }

  /**
   * Uses LLM to format the response in a user-friendly way
   * @param {object} actionResult 
   * @param {string} userInput 
   * @param {object} routingInfo 
   * @param {string} userTier 
   * @returns {Promise<string>}
   */
  async formatWithLLM(actionResult, userInput, routingInfo, userTier) {
    const formattingPrompt = this.buildFormattingPrompt(actionResult, userInput, routingInfo);
    
    try {
      const formattedResponse = await this.chatOptimizer.ask(formattingPrompt, userTier);
      return formattedResponse;
    } catch (error) {
      console.error('[ResponseFormatter] LLM formatting failed:', error);
      return this.fallbackFormatting(actionResult, userInput);
    }
  }

  /**
   * Builds the LLM prompt for response formatting
   * @param {object} actionResult 
   * @param {string} userInput 
   * @param {object} routingInfo 
   * @returns {string}
   */
  buildFormattingPrompt(actionResult, userInput, routingInfo) {
    const actionGuides = {
      'ask_truth': 'Present the factual information clearly. If sources are provided, mention them. If confidence is low, acknowledge uncertainty.',
      'expert_query': 'Present the expert analysis in a professional but accessible way. Structure the response with clear sections if it\'s complex.',
      'debate': 'Present the debate response in a balanced way. If multiple perspectives are provided, structure them clearly.',
      'theological_query': 'Present the theological analysis respectfully and thoughtfully. Include relevant context.',
      'swarm': 'Synthesize the multi-agent responses into a coherent answer. Highlight different perspectives if available.',
      'general_llm': 'Present the response naturally and conversationally.'
    };

    const actionGuide = actionGuides[routingInfo.action] || 'Present the information clearly and helpfully.';
    
    return `You are a helpful AI assistant. Answer the user's question directly and concisely.

USER QUESTION: "${userInput}"

RELEVANT INFO: ${this.extractKeyContent(actionResult)}

GUIDELINES:
- ${actionGuide}
- Be conversational and natural
- No technical jargon or metadata
- Keep response focused and short
- Use simple language

Provide a clear, direct answer:`;
  }

  /**
   * Extracts key content from actionResult for cleaner formatting
   * @param {object} actionResult 
   * @returns {string}
   */
  extractKeyContent(actionResult) {
    // Extract only the essential content, not the entire object
    if (actionResult.response) return actionResult.response;
    if (actionResult.reply) return actionResult.reply;
    if (actionResult.answer) return actionResult.answer;
    if (actionResult.expertReply) return actionResult.expertReply;
    if (actionResult.completion) return actionResult.completion;
    if (actionResult.interpretation) return actionResult.interpretation;
    if (actionResult.message) return actionResult.message;
    if (actionResult.code) return `Code: ${actionResult.code.substring(0, 200)}...`;
    
    return JSON.stringify(actionResult).substring(0, 300) + "...";
  }

  /**
   * Fallback formatting when LLM fails
   * @param {object} actionResult 
   * @param {string} userInput 
   * @returns {string}
   */
  fallbackFormatting(actionResult, userInput) {
    // Extract the most relevant content from the result
    if (actionResult.response) {
      return actionResult.response;
    }
    
    if (actionResult.reply) {
      return actionResult.reply;
    }
    
    if (actionResult.answer) {
      return actionResult.answer;
    }
    
    if (actionResult.expertReply) {
      return actionResult.expertReply;
    }
    
    if (actionResult.completion) {
      return actionResult.completion;
    }
    
    if (actionResult.interpretation) {
      return actionResult.interpretation;
    }
    
    if (actionResult.code) {
      return `Here's the generated code:\n\n\`\`\`\n${actionResult.code}\n\`\`\``;
    }
    
    return `I processed your request "${userInput}" but encountered an issue with formatting the response. Here's the raw result: ${JSON.stringify(actionResult)}`;
  }

  /**
   * Builds structured response without LLM formatting
   * @param {object} actionResult 
   * @param {string} userInput 
   * @param {object} routingInfo 
   * @returns {object}
   */
  buildStructuredResponse(actionResult, userInput, routingInfo) {
    return {
      success: true,
      data: actionResult,
      action: routingInfo.action
    };
  }

  /**
   * Builds error response
   * @param {Error} error 
   * @param {string} userInput 
   * @param {object} routingInfo 
   * @returns {object}
   */
  buildErrorResponse(error, userInput, routingInfo) {
    return {
      success: false,
      error: error.message,
      action: routingInfo?.action || 'unknown'
    };
  }

  /**
   * Simple response formatting for quick actions
   * @param {string} message 
   * @param {string} userInput 
   * @returns {object}
   */
  buildSimpleResponse(message, userInput) {
    return {
      success: true,
      response: message
    };
  }
} 