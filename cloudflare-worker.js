/**
 * MAVERICK GAMING — Cloudflare Worker API Proxy
 *
 * Deploy this to Cloudflare Workers (free tier supports up to 100k req/day).
 * Steps:
 *   1. Go to https://workers.cloudflare.com/ and create a new Worker
 *   2. Paste this entire file into the editor
 *   3. In Settings → Variables, add a Secret called ANTHROPIC_API_KEY
 *      with your actual Anthropic API key as the value
 *   4. Deploy. Your worker URL will look like:
 *      https://maverick-chat.YOUR-SUBDOMAIN.workers.dev
 *   5. In script.js, set PROXY_URL to that URL (or your custom domain)
 *
 * Alternatively: use Vercel (see proxy/vercel-function.js)
 */

export default {
  async fetch(request, env) {
    // Only allow POST from your own domain
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = [
      'https://maverickgaming.com',
      'https://www.maverickgaming.com',
      // Add your staging/preview URL here during development:
      // 'http://localhost:3000',
    ];

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();

      // Validate the request has the expected shape
      if (!body.messages || !Array.isArray(body.messages)) {
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Cap tokens to prevent runaway costs
      body.max_tokens = Math.min(body.max_tokens || 300, 500);
      body.model = 'claude-sonnet-4-6'; // Always use a fixed model

      // Forward to Anthropic with the secret key (never exposed to browser)
      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      const data = await anthropicResponse.json();

      return new Response(JSON.stringify(data), {
        status: anthropicResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'Proxy error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
