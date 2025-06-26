import { getDebateResponder } from '../../lib/debate-responder.js';
import { getChatOptimizer } from '../../lib/chat-optimizer.js';

/**
 * Swarm Router - Determines which modules to activate based on topic
 */
export class SwarmRouter {
  constructor(tier = "free") {
    this.tier = tier;
    this.maxAgents = {
      "free": 1,
      "pro": 3, 
      "enterprise": 999
    }[tier.toLowerCase()] || 1;
  }

  shouldActivate(moduleName, topic) {
    const topicLower = topic.toLowerCase();
    const relevanceMap = {
      "prophecy": ["prophecy", "fulfill", "prediction"],
      "jesus": ["jesus", "teach", "christ"],
      "endtimes": ["end", "gog", "tribulation", "apocalypse"],
      "archaeology": ["archaeology", "scroll", "evidence", "historical"],
      "debate": ["islam", "muhammad", "atheist", "religion"],
      "philosophy": ["philosophy", "ethics", "morality"],
      "science": ["science", "physics", "biology", "technology"]
    };
    
    const keywords = relevanceMap[moduleName] || [];
    return keywords.some(word => topicLower.includes(word));
  }
}

/**
 * EvoStorm - Multi-agent processing system
 */
export class EvoStorm {
  constructor(tier = "free") {
    this.modules = {
      "debate": () => getDebateResponder(),
      "prophecy": () => ({ answer: (topic) => `Prophecy analysis for: ${topic}` }),
      "endtimes": () => ({ evaluate: () => [`End times analysis completed`] }),
      "jesus": () => ({ getTeachings: (topic) => [`Jesus's teaching on ${topic}`] }),
      "archaeology": () => ({ summarize: () => "Archaeological evidence summary" }),
      "philosophy": () => ({ analyze: (topic) => `Philosophical analysis of: ${topic}` }),
      "science": () => ({ explain: (topic) => `Scientific explanation of: ${topic}` })
    };

    this.router = new SwarmRouter(tier);
    this.activatedModules = [];
  }

  async respond(topic) {
    const responses = {};
    let activatedCount = 0;

    for (const [name, moduleFactory] of Object.entries(this.modules)) {
      if (activatedCount >= this.router.maxAgents) {
        break;
      }

      if (this.router.shouldActivate(name, topic)) {
        try {
          const module = moduleFactory();
          
          if (module && typeof module.answer === 'function') {
            responses[name] = module.answer(topic);
          } else if (module && typeof module.analyze === 'function') {
            responses[name] = module.analyze(topic);
          } else if (module && typeof module.explain === 'function') {
            responses[name] = module.explain(topic);
          } else if (module && typeof module.summarize === 'function') {
            responses[name] = module.summarize();
          } else if (module && typeof module.evaluate === 'function') {
            responses[name] = module.evaluate();
          } else if (module && typeof module.getTeachings === 'function') {
            responses[name] = module.getTeachings(topic);
          } else {
            responses[name] = `[No suitable handler for ${name}]`;
          }

          this.activatedModules.push(name);
          activatedCount++;

        } catch (error) {
          responses[name] = `[Error in ${name}]: ${error.message}`;
        }
      }
    }

    // Enhanced fallback with ChatOptimizer
    if (Object.keys(responses).length === 0) {
      const chatOptimizer = getChatOptimizer();
      const fallbackResponse = await chatOptimizer.ask(
        `Analyze this topic comprehensively: ${topic}`,
        'free'
      );
      
      responses['general'] = fallbackResponse;
      this.activatedModules.push('general');
    }

    console.log(`[Swarm Log] Topic: '${topic}' | Tier: ${this.router.tier} | Activated: [${this.activatedModules.join(', ')}]`);

    return responses;
  }
} 