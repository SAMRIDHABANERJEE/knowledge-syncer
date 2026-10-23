/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { chatDocument } from '../src/server/synthesizer';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const result = await chatDocument(payload);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel chat error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to chat with document.' });
  }
}
