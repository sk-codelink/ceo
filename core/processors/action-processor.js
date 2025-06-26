import { getTruthResponder } from '../../lib/truth-enforcer.js';
import { getChatOptimizer } from '../../lib/chat-optimizer.js';
import { generateExpertResponse, generateExpertCode } from '../../lib/expert-service.js';
import { getDebateResponder } from '../../lib/debate-responder.js';
import { getSecurityManager, getRBACManager } from '../../lib/security.js';
import { EvoStorm } from './swarm-engine.js';

/**
 * Action Processor - Executes the specific business logic for each action
 * This is the WORKER of our system - it does the actual processing
 */
export class ActionProcessor {
  constructor() {
    this.timestamp = () => new Date().toISOString();
  }

  /**
   * Main processing method - executes the chosen action
   * @param {string} action - The action to execute
   * @param {object} payload - The data for the action
   * @param {object} req - Request object for headers/auth
   * @returns {Promise<object>} - Processed result
   */
  async processAction(action, payload, req) {
    try {
      console.log(`[ActionProcessor] Processing: ${action}`);
      
      switch (action) {
        case 'ping':
          return await this.handlePing(payload, req);
        case 'ask_truth':
          return await this.handleAskTruth(payload, req);
        case 'truth_stats':
          return await this.handleTruthStats(payload, req);
        case 'expert_query':
          return await this.handleExpertQuery(payload, req);
        case 'generate_code':
          return await this.handleGenerateCode(payload, req);
        case 'generate_tool':
          return await this.handleGenerateTool(payload, req);
        case 'debate':
          return await this.handleDebate(payload, req);
        case 'theological_query':
          return await this.handleTheologicalQuery(payload, req);
        case 'swarm':
          return await this.handleSwarm(payload, req);
        case 'creator_response':
          return await this.handleCreatorResponse(payload, req);
        case 'auth_login':
          return await this.handleAuthLogin(payload, req);
        case 'encrypt':
          return await this.handleEncrypt(payload, req);
        case 'decrypt':
          return await this.handleDecrypt(payload, req);
        case 'generate_data':
          return await this.handleGenerateData(payload, req);
        case 'optimize':
          return await this.handleOptimize(payload, req);
        case 'enhance_prompt':
          return await this.handleEnhancePrompt(payload, req);
        case 'general_llm':
          return await this.handleGeneralLLM(payload, req);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`[ActionProcessor] Error in ${action}:`, error);
      throw error;
    }
  }

  // ==========================================
  // HEALTH & PING
  // ==========================================
  async handlePing(payload, req) {
    return {
      status: "ok",
      timestamp: this.timestamp(),
      environment: "vercel", 
      services: {
        chatOptimizer: !!process.env.ANTHROPIC_API_KEY,
        evoSwarm: true,
        security: true,
        expertService: true
      },
      version: "4.0.0",
      action: 'ping'
    };
  }

  // ==========================================
  // TRUTH ENFORCEMENT
  // ==========================================
  async handleAskTruth(payload, req) {
    if (!payload?.question) {
      throw new Error('Question is required for ask_truth');
    }
    
    const truthResponder = getTruthResponder();
    const truthResult = truthResponder.answer(payload.question);
    
    // If knowledge base doesn't have answer, fallback to general LLM
    if (!truthResult.grounded || truthResult.confidence < 0.5 || 
        truthResult.answer.includes("I don't know")) {
      
      console.log(`[AskTruth] Fallback to General LLM for: "${payload.question}"`);
      
      // Use general LLM with context that it's a fallback from ask_truth
      const generalLLMResult = await this.handleGeneralLLM({
        question: payload.question,
        fallback_from: 'ask_truth'
      }, req);
      
      return {
        answer: generalLLMResult.response,
        confidence: 0.8,
        sources: ['general_llm_fallback'],
        grounded: false,
        fallback_used: true,
        original_truth_confidence: truthResult.confidence,
        action: 'ask_truth',
        timestamp: this.timestamp()
      };
    }
    
    // Return original truth result if it has good answer
    return {
      ...truthResult,
      action: 'ask_truth',
      timestamp: this.timestamp()
    };
  }

  async handleTruthStats(payload, req) {
    const truthResponder = getTruthResponder();
    return {
      ...truthResponder.getStats(),
      action: 'truth_stats',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // EXPERT SERVICES
  // ==========================================
  async handleExpertQuery(payload, req) {
    if (!payload?.requestText) {
      throw new Error('RequestText is required for expert_query');
    }
    
    const expertReply = await generateExpertResponse(
      payload.requestText,
      payload.domain || 'general',
      payload.format || 'report'
    );
    
    return {
      expertReply,
      domain: payload.domain || 'general',
      format: payload.format || 'report',
      action: 'expert_query',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // CODE GENERATION
  // ==========================================
  async handleGenerateCode(payload, req) {
    if (!payload?.requestText) {
      throw new Error('RequestText is required for generate_code');
    }
    
    const userTier = req.headers['x-user-tier'] || 'free';
    
    const code = await generateExpertCode(
      payload.requestText,
      payload.language || 'javascript',
      payload.framework || ''
    );
    
    let optimizedVersion = null;
    if (userTier === 'paid') {
      const chatOptimizer = getChatOptimizer();
      optimizedVersion = await chatOptimizer.ask(
        `Review and optimize this code:\n${code}`,
        userTier
      );
    }
    
    return {
      code,
      optimizedVersion,
      language: payload.language || 'javascript',
      framework: payload.framework || '',
      tier: userTier,
      action: 'generate_code',
      timestamp: this.timestamp()
    };
  }

  async handleGenerateTool(payload, req) {
    if (!payload?.requestText) {
      throw new Error('RequestText is required for generate_tool');
    }
    
    const toolCode = await generateExpertCode(
      `Create a complete tool/module for: ${payload.requestText}`,
      'javascript',
      ''
    );
    
    return {
      toolCode,
      request: payload.requestText,
      toolName: payload.toolName || 'GeneratedTool',
      action: 'generate_tool',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // DEBATE SYSTEM
  // ==========================================
  async handleDebate(payload, req) {
    if (!payload?.topic) {
      throw new Error('Topic is required for debate');
    }
    
    const userTier = req.headers['x-user-tier'] || 'free';
    
    // First check for grounded response
    const truthResponder = getTruthResponder();
    const groundedResponse = truthResponder.answer(payload.topic);
    
    if (groundedResponse.grounded) {
      return {
        reply: groundedResponse.answer,
        sources: groundedResponse.sources,
        grounded: true,
        confidence: groundedResponse.confidence,
        action: 'debate',
        timestamp: this.timestamp()
      };
    }
    
    // Then try the debate responder
    const debateResponder = getDebateResponder();
    const debateResponse = debateResponder.answer(payload.topic);
    
    // If generic response, enhance with ChatOptimizer
    if (debateResponse.includes('[Generic debate response would go here]')) {
      const chatOptimizer = getChatOptimizer();
      const enhancedResponse = await chatOptimizer.ask(
        `Provide a thoughtful debate response for: ${payload.topic}`,
        userTier
      );
      
      return {
        reply: enhancedResponse,
        source: 'chat-optimizer',
        tier: userTier,
        grounded: false,
        action: 'debate',
        timestamp: this.timestamp()
      };
    }
    
    return {
      reply: debateResponse,
      source: 'debate-responder',
      grounded: true,
      enhanced: true,
      action: 'debate',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // THEOLOGICAL QUERIES
  // ==========================================
  async handleTheologicalQuery(payload, req) {
    if (!payload?.passage) {
      throw new Error('Passage is required for theological_query');
    }
    
    const interpretation = await generateExpertResponse(
      `Provide theological analysis of: ${payload.passage}`,
      'theology',
      'detailed analysis'
    );
    
    return {
      interpretation,
      passage: payload.passage,
      analysisType: 'theological',
      action: 'theological_query',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // SWARM PROCESSING
  // ==========================================
  async handleSwarm(payload, req) {
    if (!payload?.task) {
      throw new Error('Task is required for swarm');
    }
    
    const userTier = req.headers['x-user-tier'] || 'free';
    const maxAgents = parseInt(process.env.SWARM_MAX_AGENTS) || 5;
    
    const evoStorm = new EvoStorm(userTier);
    const swarmResponses = await evoStorm.respond(payload.task);
    
    return {
      task: payload.task,
      payload: payload.payload || {},
      swarmResponses,
      activatedModules: evoStorm.activatedModules,
      tier: userTier,
      maxAgents,
      action: 'swarm',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // CREATOR RESPONSE
  // ==========================================
  async handleCreatorResponse(payload, req) {
    if (!payload?.subject) {
      throw new Error('Subject is required for creator_response');
    }
    
    const debater = getDebateResponder();
    const response = debater.creatorResponse(
      payload.subject,
      payload.preferredName || "Jesus Christ"
    );
    
    return {
      response,
      subject: payload.subject,
      preferredName: payload.preferredName || "Jesus Christ",
      action: 'creator_response',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async handleAuthLogin(payload, req) {
    if (!payload?.userId) {
      throw new Error('userId is required for auth_login');
    }
    
    const rbac = getRBACManager();
    const token = rbac.generateToken(payload.userId, payload.role || 'user');
    
    return {
      token,
      userId: payload.userId,
      role: payload.role || 'user',
      expiresIn: '24h',
      action: 'auth_login',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // SECURITY (ADMIN ONLY)
  // ==========================================
  async handleEncrypt(payload, req) {
    if (!payload?.data) {
      throw new Error('Data is required for encrypt');
    }
    
    // Check admin permission
    const rbac = getRBACManager();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!rbac.verifyToken(token) || !rbac.hasPermission(token, 'encrypt')) {
      throw new Error('Admin permission required for encryption');
    }
    
    const security = getSecurityManager();
    const result = security.encrypt(JSON.stringify(payload.data));
    
    return {
      success: true,
      encrypted: result.encrypted,
      metadata: {
        keyId: result.key.substring(0, 8) + '...',
        algorithm: 'AES-256-GCM',
        timestamp: this.timestamp()
      },
      action: 'encrypt'
    };
  }

  async handleDecrypt(payload, req) {
    if (!payload?.encrypted || !payload?.key || !payload?.iv || !payload?.tag) {
      throw new Error('All encryption parameters are required for decrypt');
    }
    
    // Check admin permission
    const rbac = getRBACManager();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!rbac.verifyToken(token) || !rbac.hasPermission(token, 'decrypt')) {
      throw new Error('Admin permission required for decryption');
    }
    
    const security = getSecurityManager();
    const decrypted = security.decrypt(payload.encrypted, payload.key, payload.iv, payload.tag);
    const data = JSON.parse(decrypted);
    
    return {
      success: true,
      data,
      action: 'decrypt',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // DATA PROCESSING
  // ==========================================
  async handleGenerateData(payload, req) {
    if (!payload?.data) {
      throw new Error('Data is required for generate_data');
    }
    
    const userTier = req.headers['x-user-tier'] || 'free';
    const prompt = `Optimize the following data: ${JSON.stringify(payload.data)}`;
    const optimizer = getChatOptimizer();
    const response = await optimizer.ask(prompt, userTier);
    
    return {
      completion: response,
      tier: userTier,
      optimized: true,
      action: 'generate_data',
      timestamp: this.timestamp()
    };
  }

  async handleOptimize(payload, req) {
    if (!payload?.data) {
      throw new Error('Data is required for optimize');
    }
    
    const userTier = req.headers['x-user-tier'] || 'free';
    const prompt = `Analyze and optimize: ${JSON.stringify(payload.data)}`;
    const optimizer = getChatOptimizer();
    const response = await optimizer.ask(prompt, userTier);
    
    return {
      completion: response,
      tier: userTier,
      analysis: true,
      action: 'optimize',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // PROMPT ENHANCEMENT
  // ==========================================
  async handleEnhancePrompt(payload, req) {
    if (!payload?.input?.trim()) {
      throw new Error('Input is required for enhance_prompt');
    }
    
    const systemInstruction = `You are a prompt enhancer. A user gives you a vague request like 'make a game' or 'build an app', and you rewrite it as a highly specific software development prompt. Be precise. Mention platform, tools, and key features.`;
    const chatOptimizer = getChatOptimizer();
    const enhanced = await chatOptimizer.ask(
      `${systemInstruction}\n\nUser request: ${payload.input.trim()}`,
      'paid'
    );
    
    return {
      enhanced_prompt: enhanced,
      original_input: payload.input.trim(),
      enhancement_type: 'software_development',
      action: 'enhance_prompt',
      timestamp: this.timestamp()
    };
  }

  // ==========================================
  // GENERAL LLM
  // ==========================================
  async handleGeneralLLM(payload, req) {
    if (!payload?.question && !payload?.prompt) {
      throw new Error('Question or prompt is required for general_llm');
    }
    
    const userQuery = payload.question || payload.prompt;
    const tier = req.headers['x-user-tier'] || payload.tier || 'free';
    const optimizer = getChatOptimizer();
    
    const contextPrefix = payload.fallback_from ?
      `Previous attempt with '${payload.fallback_from}' action was not sufficient. Please provide a comprehensive answer to: ` :
      '';
    
    const response = await optimizer.ask(`${contextPrefix}${userQuery}`, tier);
    
    return {
      response,
      query: userQuery,
      tier,
      is_fallback: !!payload.fallback_from,
      action: 'general_llm',
      timestamp: this.timestamp()
    };
  }
} 