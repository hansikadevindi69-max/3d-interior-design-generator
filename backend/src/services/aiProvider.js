const config = require('../config');
const { generateDesignScene } = require('./designGenerator');

/**
 * Pluggable AI provider layer. When an external provider (OpenAI, Stability
 * AI, ...) is configured with an API key, this module can be extended to
 * call out to it for enhanced prompt interpretation or image generation.
 * Without credentials (the default for local development and CI), the
 * "mock" provider is used, which deterministically derives the design scene
 * from the prompt using designGenerator.js - keeping the whole pipeline
 * fully functional and testable offline.
 */
function getActiveProvider() {
  if (config.aiProvider === 'openai' && config.openaiApiKey) return 'openai';
  if (config.aiProvider === 'stability' && config.stabilityApiKey) return 'stability';
  return 'mock';
}

async function generateDesign({ analysis, prompt }) {
  const provider = getActiveProvider();

  // Both external providers currently reuse the same deterministic scene
  // builder to plan furniture/lighting layouts, and would additionally
  // call out to the respective image-generation API for photorealistic
  // renders once credentials are provided. That network call is
  // intentionally not made here to keep the API usable without keys.
  const scene = generateDesignScene({ analysis, prompt });

  return { provider, scene };
}

module.exports = {
  getActiveProvider,
  generateDesign,
};
