# Emotional Companion

An interactive voice-based AI companion web application that allows users to have conversations with different characters through speech recognition and synthesis.

## Features

- **Voice-based input**: Speak to your companion and get real-time responses
- **Multiple characters**: Choose from various characters like Gundam, Ultraman, Detective Conan, and more
- **Real-time processing**: Low-latency responses with interruptible voice playback
- **Azure-powered**: Built using Azure OpenAI services and Azure Speech services

## Prerequisites

- Node.js (v14+) and npm
- Azure account with the following services:
  - Azure OpenAI service with GPT-4o model deployed
  - Azure Speech service

## ⚠️ SECURITY NOTICE

**CRITICAL**: This application currently has security vulnerabilities that need immediate attention. Please read the [Security Report](SECURITY_REPORT.md) and [Implementation Guide](SECURITY_IMPLEMENTATION_GUIDE.md) before deploying to production.

### Key Security Issues:
- API keys exposed in client-side code
- Missing input validation and rate limiting
- Outdated dependencies with known vulnerabilities

### Quick Security Fix:
1. Implement the secure backend template in `/backend-template/`
2. Move all API keys to server-side environment variables
3. Update dependencies: `npm install`

## Configuration

⚠️ **IMPORTANT**: The current configuration exposes API keys in the browser. For production use, implement the secure backend template.

Create a `.env` file in the root of the project with the following variables: 