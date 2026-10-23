/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.KNOWLEDGE_SYNCER);
  return res.status(200).json({
    status: 'ok',
    message: 'AutoDoc AI Serverless API Ready',
    hasApiKey: hasKey,
  });
}
