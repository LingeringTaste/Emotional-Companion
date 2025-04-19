/**
 * This script helps deploy the Emotional Companion app to Azure App Service
 * Prerequisites:
 * - Azure CLI installed and logged in
 * - Node.js and npm installed
 * - Azure subscription
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
let config = {
  resourceGroup: '',
  location: '',
  app
}; 