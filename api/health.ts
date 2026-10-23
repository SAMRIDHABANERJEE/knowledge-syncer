/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.KNOWLEDGE_SYNCER);
  return res.status(200).json({
    status: 'ok',
    engine: 'AutoDoc-AI-Autonomous-Engine',
    version: '2.4.0',
    model: 'gemini-3.8-flash',
    hasApiKey: hasKey,
    runtime: 'vercel-serverless',
  });
}
