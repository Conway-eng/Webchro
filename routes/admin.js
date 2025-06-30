const axios = require('axios');
const RENDER_API_KEY = 'YOUR_RENDER_API_KEY';

async function createWhatsappBotOnRender(botName, repoUrl, envVars) {
  const response = await axios.post(
    'https://api.render.com/v1/services',
    {
      name: botName,
      repo: { url: repoUrl },
      type: 'web', // or 'background' if it's not a web service
      branch: 'main', // or the branch your bot code is on
      envVars: Object.entries(envVars).map(([key, value]) => ({ key, value })),
      plan: 'starter', // or another Render plan
      region: 'oregon', // or 'frankfurt'
      buildCommand: 'npm install', // adjust as needed
      startCommand: 'npm start' // adjust as needed
    },
    {
      headers: {
        'Authorization': `Bearer ${RENDER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data; // contains the service ID and details
}
