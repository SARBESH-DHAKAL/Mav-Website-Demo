/**
 * MAVERICK GAMING — Vercel Serverless Function Proxy
 *
 * Alternative to Cloudflare Worker for Vercel deployments.
 * Steps:
 *   1. Move this file to /api/chat.js in your project root
 *   2. In Vercel dashboard → Settings → Environment Variables,
 *      add ANTHROPIC_API_KEY with your actual key
 *   3. Deploy. script.js already points to /api/chat by default.
 */

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://maverickgaming.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = req.body;
    body.max_tokens = Math.min(body.max_tokens || 300, 500);
    body.model = 'claude-sonnet-4-6';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch {
    res.status(500).json({ error: 'Proxy error' });
  }
}
