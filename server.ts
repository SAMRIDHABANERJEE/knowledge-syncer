/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { synthesizeVideo, chatDocument } from './src/server/synthesizer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Express Router for API Endpoints
const router = express.Router();

router.get('/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.KNOWLEDGE_SYNCER);
  res.json({
    status: 'ok',
    engine: 'AutoDoc-AI-Autonomous-Engine',
    version: '2.4.0',
    model: 'gemini-3.8-flash',
    hasApiKey: hasKey,
    features: ['youtube-oembed', 'structured-pdf', 'gamified-xp-system', 'interactive-quiz', 'mindmaps'],
  });
});

router.post('/synthesize', async (req, res) => {
  try {
    const result = await synthesizeVideo(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error('Synthesis error:', error);
    let errMsg = error?.message || 'Failed to synthesize YouTube video.';
    if (
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid') ||
      errMsg.includes('API_KEY')
    ) {
      errMsg =
        'Unauthorized or invalid Gemini API Key. Please verify GEMINI_API_KEY in your environment variables.';
    }
    return res.status(500).json({ error: errMsg });
  }
});

router.post('/chat-document', async (req, res) => {
  try {
    const result = await chatDocument(req.body);
    return res.json(result);
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate study answer.' });
  }
});

router.get('/readme', (_req, res) => {
  try {
    const readmePath = path.resolve(__dirname, 'README.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf-8');
      return res.json({ content });
    }
    return res.json({
      content: '# AutoDoc AI — Autonomous YouTube Knowledge Engine\n\nFull documentation is available in the repository.',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.use('/api', router);
app.use('/', router);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err?.message || 'Internal Server Error',
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoDoc AI Engine running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
