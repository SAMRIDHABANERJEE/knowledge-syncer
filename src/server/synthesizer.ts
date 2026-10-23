/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

// Extract YouTube ID from ANY valid YouTube link format
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. Direct 11-character video ID check
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Comprehensive Regex patterns
  const patterns = [
    // Standard watch?v=, embed, shorts, live, etc.
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/i,
    // Query param v=
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
    // youtu.be/ID
    /youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    // shorts/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/i,
    // live/ID
    /\/live\/([a-zA-Z0-9_-]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }

  // 3. Fallback: URL Object parsing
  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (urlObj.hostname.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v && v.length === 11) return v;

      const pathSegments = urlObj.pathname.split('/').filter(Boolean);
      for (const seg of pathSegments) {
        if (seg.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(seg)) {
          return seg;
        }
      }
    } else if (urlObj.hostname.includes('youtu.be')) {
      const seg = urlObj.pathname.replace(/^\//, '').split(/[?#&]/)[0];
      if (seg.length === 11) return seg;
    }
  } catch {
    // Ignore URL parse error
  }

  return null;
}

// Fetch YouTube oEmbed metadata
export async function fetchYouTubeMetadata(videoId: string) {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data: any = await res.json();
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

// Lazy Gemini AI Client
export function getAiClient(): GoogleGenAI {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.KNOWLEDGE_SYNCER || '';
  if (!geminiApiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured in environment variables. In Vercel, go to Project Settings > Environment Variables, add GEMINI_API_KEY with your key from https://aistudio.google.com/app/apikey, and trigger a Redeploy.'
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

// Core Synthesis Function
export async function synthesizeVideo({
  url,
  style = 'comprehensive',
  customFocus = '',
  targetAudience = 'all-levels',
}: {
  url: string;
  style?: string;
  customFocus?: string;
  targetAudience?: string;
}) {
  if (!url) {
    throw new Error('YouTube URL or Video ID is required.');
  }

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error(
      `Could not recognize YouTube Video ID from "${url}". Please ensure it is a valid YouTube link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).`
    );
  }

  const ai = getAiClient();
  const metadata = await fetchYouTubeMetadata(videoId);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

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

  return {
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
}

// Core Chat Function
export async function chatDocument({
  documentContext,
  question,
  chatHistory = [],
}: {
  documentContext: any;
  question: string;
  chatHistory?: Array<{ role: string; content: string }>;
}) {
  if (!question || !documentContext) {
    throw new Error('Question and document context are required.');
  }

  const ai = getAiClient();

  const systemInstruction = `You are AutoDoc AI's intelligent study companion.
The user is studying a YouTube video document titled "${documentContext.title}" by "${documentContext.author}".
Here is the extracted document context:
- Core Takeaway: ${documentContext.oneSentenceTakeaway}
- Executive Summary: ${documentContext.executiveSummary}
- Chapters: ${JSON.stringify(documentContext.chapters?.map((c: any) => ({ timestamp: c.timestamp, title: c.title, summary: c.summary })))}
- Glossary: ${JSON.stringify(documentContext.glossary)}
- Action Plan: ${JSON.stringify(documentContext.actionPlan)}

Answer the user's question clearly, pedagogically, and accurately based on the video documentation. Cite relevant timestamps (e.g. [03:45]) when referring to specific chapters. Keep answers structured, insightful, and encouraging.`;

  const formattedHistory = chatHistory
    .slice(-6)
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
  const prompt = `${formattedHistory ? `Recent Conversation:\n${formattedHistory}\n\n` : ''}User Question: ${question}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.7,
    },
  });

  return { reply: response.text };
}
