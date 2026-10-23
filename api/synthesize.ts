/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { synthesizeVideo } from '../src/server/synthesizer';

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await synthesizeVideo(payload);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel synthesize error:', error);
    let errMsg = error?.message || 'Failed to synthesize video.';
    if (
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid') ||
      errMsg.includes('API_KEY')
    ) {
      errMsg =
        'Unauthorized or invalid Gemini API Key. Please verify GEMINI_API_KEY in Vercel Project Settings > Environment Variables.';
    }
    return res.status(500).json({ error: errMsg });
  }
}
