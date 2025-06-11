/**
 * Security utilities for input validation and sanitization
 */

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter based on IP/session
 */
export function checkRateLimit(identifier: string = 'default'): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters and patterns
  return input
    .trim()
    .slice(0, 1000) // Limit length
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\0/g, ''); // Remove null bytes
}

/**
 * Validate input content for harmful patterns
 */
export function validateInput(input: string): { isValid: boolean; reason?: string } {
  if (!input || input.trim().length === 0) {
    return { isValid: false, reason: 'Input cannot be empty' };
  }

  if (input.length > 1000) {
    return { isValid: false, reason: 'Input too long (max 1000 characters)' };
  }

  // Check for potential prompt injection patterns
  const suspiciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /forget\s+everything/i,
    /system\s*:/i,
    /assistant\s*:/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|.*?\|>/i,
    /```.*?system.*?```/is
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, reason: 'Input contains potentially harmful content' };
    }
  }

  return { isValid: true };
}

/**
 * Content filter for inappropriate content
 */
export function filterContent(input: string): { isAllowed: boolean; reason?: string } {
  const prohibitedPatterns = [
    /\b(hate|violence|harm|kill|death|suicide)\b/i,
    /\b(sexual|explicit|nsfw)\b/i,
    /\b(illegal|drugs|weapons)\b/i
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.test(input)) {
      return { isAllowed: false, reason: 'Content violates usage policy' };
    }
  }

  return { isAllowed: true };
}

/**
 * Generate a simple session identifier for rate limiting
 */
export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Secure error message that doesn't leak sensitive information
 */
export function createSecureErrorMessage(error: unknown, userMessage: string = 'An error occurred'): string {
  // Log the actual error for debugging (server-side only)
  console.error('Security filtered error:', error);
  
  // Return generic message to user
  return userMessage;
}