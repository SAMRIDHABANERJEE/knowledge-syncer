/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google Gemini Client initializer to prevent cold-start crashes
function getAiClient(): GoogleGenAI {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.KNOWLEDGE_SYNCER || '';
  if (!geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment variables. If deployed on Vercel, go to Settings > Environment Variables, add GEMINI_API_KEY with your key from Google AI Studio, and trigger a Redeploy.'
    );
  }
  return new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // Direct ID check (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

// Fetch YouTube oEmbed metadata
async function fetchYouTubeMetadata(videoId: string) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'YouTube Educational Video',
        author: data.author_name || 'YouTube Creator',
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  } catch (err) {
    console.warn('oEmbed fetch warning:', err);
  }
  return {
    title: 'YouTube Knowledge Video',
    author: 'Video Educator',
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

// Express Router for API Endpoints (Supports both /api/path and /path on Vercel)
const router = express.Router();

// Health & Diagnostic Info
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

// Synthesize YouTube Video
router.post('/synthesize', async (req, res) => {
  try {
    const ai = getAiClient();

    const { url, style = 'comprehensive', customFocus = '', targetAudience = 'all-levels' } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL or Video ID is required.' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube link or ID format.' });
    }

    const metadata = await fetchYouTubeMetadata(videoId);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Prompt Gemini with autonomous search grounding & structuring
    const styleInstructions: Record<string, string> = {
      comprehensive: 'Create an in-depth, structured masterclass documentation covering all phases, technical nuances, and practical applications.',
      executive: 'Create a high-impact, C-suite executive briefing focused on strategic insights, business/tech ROI, and immediate key decisions.',
      feynman: 'Use the Feynman Technique: explain complex principles using intuitive analogies, zero jargon, and first-principles mental models.',
      technical_cheat_sheet: 'Create an engineer-grade technical cheat sheet with architecture patterns, step-by-step algorithms, pitfalls, and code/design formulas.',
    };

    const chosenStyleInstruction = styleInstructions[style] || styleInstructions.comprehensive;

    const systemInstruction = `You are AutoDoc AI, an autonomous open-source multi-stage knowledge extraction engine.
Your mission: Given a YouTube video link (URL: ${videoUrl}, ID: ${videoId}, known title: "${metadata.title}", creator: "${metadata.author}"), synthesize an authoritative, publication-quality documentation report.
Style requirement: ${chosenStyleInstruction}
${customFocus ? `Special Focus: ${customFocus}` : ''}
Target Audience: ${targetAudience}

You must extract and synthesize:
1. Exact or inferred video topic, verified title and author.
2. One punchy single-sentence core takeaway.
3. Executive Summary (3-4 deeply insightful paragraphs).
4. 5-7 Key Takeaways (bulleted, highly actionable).
5. 4-7 Chronological Chapters with realistic timestamps (e.g. "00:00", "04:15", "09:30"), chapter title, comprehensive summary, and 3-4 bullet key points.
6. 4-8 Technical or domain glossary terms with clear definitions.
7. 4-6 Step Action Plan / Implementation Playbook (step number, title, description, concrete deliverable).
8. 5 Multiple-Choice Quiz Questions for gamified self-testing: Each must have a clear question, 4 distinct options, correctIndex (0-3), and detailed explanation of why the answer is correct.
9. 5-8 High-yield Flashcards for spaced-repetition study (front concept/question, back clear answer).
10. Mindmap in ASCII structured tree format showing the hierarchical concepts.
11. Estimated reading time in minutes (integer between 5 and 25) and difficulty level ("Beginner", "Intermediate", or "Advanced").

Always respond with clean, valid JSON matching the requested schema.`;

    const promptText = `Analyze and synthesize this YouTube video:
URL: ${videoUrl}
Video ID: ${videoId}
Metadata Hint Title: "${metadata.title}"
Metadata Hint Author: "${metadata.author}"

Provide a rich, exhaustive, and pedagogically sound documentation payload.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            category: { type: Type.STRING },
            difficultyLevel: { type: Type.STRING },
            readTimeMinutes: { type: Type.INTEGER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            oneSentenceTakeaway: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  title: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['timestamp', 'title', 'summary', 'keyPoints'],
              },
            },
            glossary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            actionPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deliverable: { type: Type.STRING },
                },
                required: ['step', 'title', 'description'],
              },
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
            flashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
            mindmapAscii: { type: Type.STRING },
          },
          required: [
            'title',
            'author',
            'oneSentenceTakeaway',
            'executiveSummary',
            'keyTakeaways',
            'chapters',
            'glossary',
            'actionPlan',
            'quiz',
            'flashcards',
            'mindmapAscii',
          ],
        },
      },
    });

    const rawJson = response.text || '{}';
    const parsed = JSON.parse(rawJson);

    // Merge metadata guarantees
    const finalDocument = {
      id: `doc_${videoId}_${Date.now()}`,
      videoId,
      videoUrl,
      title: parsed.title || metadata.title,
      author: parsed.author || metadata.author,
      thumbnail: metadata.thumbnail,
      tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : ['Education', 'AI', 'Masterclass'],
      style,
      createdAt: new Date().toISOString(),
      oneSentenceTakeaway: parsed.oneSentenceTakeaway || 'Key synthesis of the presented ideas.',
      executiveSummary: parsed.executiveSummary || '',
      keyTakeaways: parsed.keyTakeaways || [],
      chapters: (parsed.chapters || []).map((ch: any) => ({
        timestamp: ch.timestamp || '00:00',
        title: ch.title || 'Topic Overview',
        summary: ch.summary || '',
        keyPoints: ch.keyPoints || [],
      })),
      glossary: parsed.glossary || [],
      actionPlan: parsed.actionPlan || [],
      quiz: (parsed.quiz || []).map((q: any, idx: number) => ({
        id: q.id || `q_${idx + 1}`,
        question: q.question,
        options: q.options || [],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || 'Refer to the video synthesis sections above.',
      })),
      flashcards: (parsed.flashcards || []).map((fc: any, idx: number) => ({
        id: fc.id || `fc_${idx + 1}`,
        front: fc.front,
        back: fc.back,
        category: fc.category || 'Core Concept',
      })),
      mindmapAscii: parsed.mindmapAscii || '',
      readTimeMinutes: parsed.readTimeMinutes || 12,
      difficultyLevel: parsed.difficultyLevel || 'Intermediate',
      category: parsed.category || 'Technology & Science',
    };

    return res.json(finalDocument);
  } catch (error: any) {
    console.error('Synthesis error:', error);
    let errMsg = error?.message || 'Failed to synthesize YouTube video. Please verify the URL.';
    if (
      errMsg.includes('API_KEY_INVALID') ||
      errMsg.includes('API key not valid') ||
      errMsg.includes('API_KEY') ||
      errMsg.includes('403') ||
      errMsg.includes('400')
    ) {
      errMsg =
        'Unauthorized or invalid Gemini API Key. Please verify that GEMINI_API_KEY in your Vercel Project Settings > Environment Variables is active and that your deployment has been redeployed.';
    }
    return res.status(500).json({ error: errMsg });
  }
});

// Grounded Q&A Chat with the Document
router.post('/chat-document', async (req, res) => {
  try {
    const ai = getAiClient();

    const { documentContext, question, chatHistory = [] } = req.body;
    if (!question || !documentContext) {
      return res.status(400).json({ error: 'Question and document context are required.' });
    }

    const systemInstruction = `You are AutoDoc AI's intelligent study companion.
The user is studying a YouTube video document titled "${documentContext.title}" by "${documentContext.author}".
Here is the extracted document context:
- Core Takeaway: ${documentContext.oneSentenceTakeaway}
- Executive Summary: ${documentContext.executiveSummary}
- Chapters: ${JSON.stringify(documentContext.chapters?.map((c: any) => ({ timestamp: c.timestamp, title: c.title, summary: c.summary })))}
- Glossary: ${JSON.stringify(documentContext.glossary)}
- Action Plan: ${JSON.stringify(documentContext.actionPlan)}

Answer the user's question clearly, pedagogically, and accurately based on the video documentation. Cite relevant timestamps (e.g. [03:45]) when referring to specific chapters. Keep answers structured, insightful, and encouraging.`;

    const formattedHistory = chatHistory.slice(-6).map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
    const prompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ''}User Question: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate study answer.' });
  }
});

// Readme Content
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

// Mount router on both '/api' and '/' so Vercel rewrites work seamlessly
app.use('/api', router);
app.use('/', router);

// Global Error Handler to guarantee JSON response
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: err?.message || 'Internal Server Error',
  });
});

// Vite Middleware for Full-stack Dev or Static Serve for Prod
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

// Only auto-start listening when executed directly (not when imported as a Vercel serverless function)
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
