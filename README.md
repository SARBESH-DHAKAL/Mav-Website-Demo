# API Proxy Setup

The Anthropic API key must NEVER be placed in client-side JavaScript.
This folder contains two ready-to-deploy proxy options.

## Option A: Cloudflare Worker (recommended — free, fast)
1. Go to https://workers.cloudflare.com/
2. Create a new Worker and paste `cloudflare-worker.js`
3. Under Settings → Variables → Secrets, add `ANTHROPIC_API_KEY`
4. Deploy and copy your worker URL
5. In `script.js`, change `PROXY_URL` to your worker URL

## Option B: Vercel Serverless Function
1. Copy `vercel-function.js` to `/api/chat.js` in your project root
2. In Vercel → Settings → Environment Variables, add `ANTHROPIC_API_KEY`
3. Deploy — the default `PROXY_URL = '/api/chat'` in script.js already works

## CORS
Update the `allowedOrigins` array in the proxy to match your production domain.
