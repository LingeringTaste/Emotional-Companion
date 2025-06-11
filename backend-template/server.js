/**
 * SECURE BACKEND TEMPLATE for Emotional Companion
 * 
 * This template shows how to properly implement a secure backend
 * that handles API keys and provides secure endpoints for the frontend.
 * 
 * IMPORTANT: This is a template - implement this as a separate backend service
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.openai.azure.com", "https://*.speech.microsoft.com"],
      mediaSrc: ["'self'", "blob:"],
      fontSrc: ["'self'"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Stricter rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: 'Too many AI requests, please slow down.'
});

app.use(express.json({ limit: '10mb' }));

// Input validation middleware
const validateChatInput = [
  body('message')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .trim()
    .escape(),
  body('characterId')
    .isString()
    .isLength({ min: 1, max: 50 })
    .matches(/^[a-zA-Z0-9_-]+$/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: errors.array() 
      });
    }
    next();
  }
];

// Content filtering
function filterContent(text) {
  const prohibitedPatterns = [
    /\b(hate|violence|harm|kill|death|suicide)\b/i,
    /\b(sexual|explicit|nsfw)\b/i,
    /\b(illegal|drugs|weapons)\b/i,
    /ignore\s+previous\s+instructions/i,
    /forget\s+everything/i,
    /system\s*:/i
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }
  return true;
}

// Authentication middleware (implement based on your auth system)
function authenticate(req, res, next) {
  // TODO: Implement proper authentication
  // For now, we'll use a simple API key check
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.CLIENT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Secure chat endpoint
app.post('/api/chat', aiLimiter, authenticate, validateChatInput, async (req, res) => {
  try {
    const { message, characterId } = req.body;

    // Additional content filtering
    if (!filterContent(message)) {
      return res.status(400).json({ 
        error: 'Content violates usage policy' 
      });
    }

    // Get character prompts (implement your character system)
    const characterPrompts = getCharacterPrompts(characterId);
    if (!characterPrompts) {
      return res.status(400).json({ error: 'Invalid character' });
    }

    // Call Azure OpenAI (server-side only)
    const response = await fetch(
      `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.GPT4O_DEPLOYMENT_NAME}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: characterPrompts.en },
            { role: 'user', content: message }
          ],
          max_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          stream: false
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log for monitoring (implement proper logging)
    console.log(`Chat request from ${req.ip}: ${message.substring(0, 50)}...`);

    res.json({ 
      response: aiResponse,
      characterId: characterId 
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Helper functions
function getCharacterPrompts(characterId) {
  // TODO: Implement your character system
  const characters = {
    'gundam': {
      en: 'You are a Gundam pilot...',
      zh: '你是一个高达驾驶员...',
      es: 'Eres un piloto de Gundam...'
    }
    // Add other characters
  };
  return characters[characterId];
}

app.listen(PORT, () => {
  console.log(`Secure backend server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;