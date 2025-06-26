// ==============================================================================
// CLEAN MAIN.JS - ORCHESTRATOR ONLY (4-Step Flow)
// INPUT → ROUTER → PROCESSOR → RESPONSE FORMATTER  
// ==============================================================================

import { SmartRouter } from '../core/routers/smart-router.js';
import { ActionProcessor } from '../core/processors/action-processor.js';
import { ResponseFormatter } from '../core/handlers/response-formatter.js';

/**
 * Main API Handler - Clean orchestration of the 4-step flow
 * 
 * FLOW:
 * 1. INPUT: Take user input
 * 2. ROUTER: AI decides which action to take
 * 3. PROCESSOR: Execute the business logic 
 * 4. RESPONSE: LLM formats final user response
 */
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-tier');
    return res.status(200).end();
  }

  // Only allow POST requests (except for ping)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed_methods: ['POST', 'GET'] 
    });
  }

  try {
    console.log(`[MainAPI] ${req.method} request received`);
    
    // ===================================================================
    // STEP 1: INPUT - Extract user input from request
    // ===================================================================
    const userInput = extractUserInput(req);
    if (!userInput) {
      return res.status(400).json({
        error: 'User input is required',
        formats: {
          simple: '{ "question": "your question here" }',
          advanced: '{ "action": "specific_action", "payload": {...} }'
        }
      });
    }

    console.log(`[MainAPI] User Input: "${userInput}"`);

    // Initialize our core components
    const router = new SmartRouter();
    const processor = new ActionProcessor();
    const formatter = new ResponseFormatter();

    // ===================================================================
    // STEP 2: ROUTER - AI decides which action to take
    // ===================================================================
    console.log('[MainAPI] Step 2: Routing user input...');
    const routingInfo = await router.routeUserInput(userInput);
    
    console.log(`[MainAPI] Routing Result: ${routingInfo.action} (confidence: ${routingInfo.confidence})`);
    console.log(`[MainAPI] Reasoning: ${routingInfo.reasoning}`);

    // Build payload for the chosen action
    const payload = router.buildPayloadForAction(userInput, routingInfo.action);

    // ===================================================================
    // STEP 3: PROCESSOR - Execute the business logic
    // ===================================================================
    console.log('[MainAPI] Step 3: Processing action...');
    const actionResult = await processor.processAction(routingInfo.action, payload, req);
    
    console.log(`[MainAPI] Action processed successfully: ${routingInfo.action}`);

    // ===================================================================
    // STEP 4: RESPONSE - LLM formats final user response  
    // ===================================================================
    console.log('[MainAPI] Step 4: Formatting response...');
    const finalResponse = await formatter.formatResponse(actionResult, userInput, routingInfo, req);
    
    console.log('[MainAPI] Response formatted successfully');

    // Send the final response
    res.status(200).json(finalResponse);

  } catch (error) {
    console.error('[MainAPI] Error in processing pipeline:', error);
    
    // Enhanced error response
    res.status(500).json({
      success: false,
      error: error.message,
      debug_info: {
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString()
      },
      api_version: '4.0'
    });
  }
}

/**
 * Extract user input from various request formats
 * @param {object} req - Express request object
 * @returns {string|null} - User input or null if not found
 */
function extractUserInput(req) {
  // Handle GET requests (simple queries)
  if (req.method === 'GET') {
    if (req.query?.q) return req.query.q;
    if (req.query?.question) return req.query.question;
    if (req.query?.query) return req.query.query;
    
    // Default ping for GET without parameters
    return 'ping';
  }

  // Handle POST requests
  const body = req.body || {};
  
  // Direct action specification (legacy support)
  if (body.action && body.payload) {
    // For direct actions, we'll let the router handle it differently
    return `[DIRECT_ACTION:${body.action}] ${JSON.stringify(body.payload)}`;
  }
  
  // Simple question format (preferred)
  if (body.question) return body.question;
  if (body.query) return body.query;
  if (body.input) return body.input;
  if (body.prompt) return body.prompt;
  if (body.message) return body.message;
  
  // If body is just a string
  if (typeof body === 'string') return body;
  
  return null;
}

/**
 * Health check endpoint (can be called directly)
 */
export async function ping() {
  return {
    status: 'ok',
    message: 'Clean API v4.0 is running!',
    architecture: '4-step flow: Input → Router → Processor → Response',
    timestamp: new Date().toISOString()
  };
} 