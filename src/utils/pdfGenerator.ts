/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { SynthesizedDocument } from '../types';

export function generatePdfDocument(docData: SynthesizedDocument, theme: string = 'academic'): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Theme palettes
  const palettes: Record<string, { primary: [number, number, number]; accent: [number, number, number]; lightBg: [number, number, number]; text: [number, number, number]; muted: [number, number, number] }> = {
    academic: {
      primary: [30, 41, 59], // slate-800
      accent: [79, 70, 229], // indigo-600
      lightBg: [248, 250, 252], // slate-50
      text: [15, 23, 42], // slate-900
      muted: [100, 116, 139], // slate-500
    },
    cyber: {
      primary: [15, 23, 42],
      accent: [14, 165, 233], // sky-500
      lightBg: [240, 249, 255],
      text: [15, 23, 42],
      muted: [71, 85, 105],
    },
    notion: {
      primary: [24, 24, 27], // zinc-900
      accent: [16, 185, 129], // emerald-500
      lightBg: [244, 244, 245],
      text: [24, 24, 27],
      muted: [113, 113, 122],
    },
    parchment: {
      primary: [68, 64, 60], // stone-700
      accent: [217, 119, 6], // amber-600
      lightBg: [254, 252, 232],
      text: [41, 37, 36],
      muted: [120, 113, 108],
    },
  };

  const colors = palettes[theme] || palettes.academic;

  // Helper to check page break
  function ensureSpace(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin;
      drawPageBorder();
    }
  }

  function drawPageBorder() {
    // Subtle top accent line
    doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, margin - 4, pageWidth - margin, margin - 4);
  }

  // --- PAGE 1: COVER HEADER ---
  drawPageBorder();

  // Badge pill
  doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.roundedRect(margin, y, 46, 7, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AUTODOC AI ENGINE', margin + 3.5, y + 4.8);

  // Category & Difficulty Pill
  doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
  doc.setDrawColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.setLineWidth(0.2);
  doc.roundedRect(margin + 50, y, 42, 7, 2, 2, 'FD');
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${docData.difficultyLevel} • ${docData.readTimeMinutes} min read`, margin + 53, y + 4.8);

  y += 13;

  // Main Document Title
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(docData.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7.5 + 2;

  // Author & Metadata
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
  doc.text(`Original Video: ${docData.author} | YouTube Link: ${docData.videoUrl}`, margin, y);
  y += 5;
  doc.text(`Synthesized: ${new Date(docData.createdAt).toLocaleDateString()} | Style: ${docData.style.replace('_', ' ').toUpperCase()}`, margin, y);
  y += 9;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // --- SECTION: CORE TAKEAWAY CALLOUT BOX ---
  ensureSpace(28);
  const takeawayLines = doc.splitTextToSize(`"${docData.oneSentenceTakeaway}"`, contentWidth - 16);
  const boxHeight = Math.max(22, takeawayLines.length * 5 + 14);

  doc.setFillColor(colors.lightBg[0], colors.lightBg[1], colors.lightBg[2]);
  doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
  doc.text('CORE THESIS / ONE-SENTENCE TAKEAWAY', margin + 6, y + 6);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.text(takeawayLines, margin + 6, y + 12);

  y += boxHeight + 8;

  // --- SECTION: EXECUTIVE SUMMARY ---
  ensureSpace(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('1. Executive Summary', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  const execLines = doc.splitTextToSize(docData.executiveSummary, contentWidth);
  for (const line of execLines) {
    ensureSpace(6);
    doc.text(line, margin, y);
    y += 4.8;
  }
  y += 6;

  // --- SECTION: KEY TAKEAWAYS ---
  ensureSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('2. Key Takeaways & Core Insights', margin, y);
  y += 6;

  for (const item of docData.keyTakeaways) {
    ensureSpace(12);
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.circle(margin + 2, y - 1, 1, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const lines = doc.splitTextToSize(item, contentWidth - 8);
    doc.text(lines, margin + 6, y);
    y += lines.length * 4.8 + 2;
  }
  y += 6;

  // --- SECTION: CHAPTER BREAKDOWN & TIMESTAMPS ---
  ensureSpace(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text('3. Timestamped Chapter Breakdown', margin, y);
  y += 6;

  for (let idx = 0; idx < docData.chapters.length; idx++) {
    const ch = docData.chapters[idx];
    ensureSpace(28);

    // Timestamp badge
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.roundedRect(margin, y, 16, 5.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(ch.timestamp, margin + 2.5, y + 4);

    // Chapter title
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(ch.title, margin + 19, y + 4.2);
    y += 7.5;

    // Summary
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    const summaryLines = doc.splitTextToSize(ch.summary, contentWidth - 4);
    for (const sLine of summaryLines) {
      ensureSpace(5);
      doc.text(sLine, margin + 4, y);
      y += 4.5;
    }

    // Key points bullets
    if (ch.keyPoints && ch.keyPoints.length > 0) {
      for (const kp of ch.keyPoints) {
        ensureSpace(8);
        doc.setFillColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.rect(margin + 5, y - 0.8, 1.2, 1.2, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        const kpLines = doc.splitTextToSize(kp, contentWidth - 12);
        doc.text(kpLines, margin + 9, y);
        y += kpLines.length * 4.2 + 1;
      }
    }

    y += 4;
  }

  // --- SECTION: TECHNICAL GLOSSARY ---
  if (docData.glossary && docData.glossary.length > 0) {
    ensureSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('4. Conceptual Glossary & Definitions', margin, y);
    y += 6;

    for (const item of docData.glossary) {
      ensureSpace(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text(`• ${item.term}: `, margin, y);

      const termWidth = doc.getTextWidth(`• ${item.term}: `);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);

      const defLines = doc.splitTextToSize(item.definition, contentWidth - termWidth);
      if (defLines.length > 0) {
        doc.text(defLines[0], margin + termWidth, y);
        if (defLines.length > 1) {
          y += 4.5;
          const remainingLines = doc.splitTextToSize(item.definition, contentWidth - 6);
          remainingLines.shift();
          for (const rem of remainingLines) {
            ensureSpace(5);
            doc.text(rem, margin + 6, y);
            y += 4.5;
          }
        }
      }
      y += 5.5;
    }
    y += 4;
  }

  // --- SECTION: IMPLEMENTATION PLAYBOOK ---
  if (docData.actionPlan && docData.actionPlan.length > 0) {
    ensureSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('5. Implementation Playbook & Action Plan', margin, y);
    y += 6;

    for (const step of docData.actionPlan) {
      ensureSpace(18);
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.roundedRect(margin, y, 7, 6, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${step.step}`, margin + 2.5, y + 4.2);

      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(step.title, margin + 10, y + 4.2);
      y += 7.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const descLines = doc.splitTextToSize(step.description, contentWidth - 8);
      doc.text(descLines, margin + 4, y);
      y += descLines.length * 4.5 + 2;

      if (step.deliverable) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text(`Deliverable: ${step.deliverable}`, margin + 4, y);
        y += 5;
      }
      y += 3;
    }
    y += 4;
  }

  // --- SECTION: SELF-ASSESSMENT QUIZ ---
  if (docData.quiz && docData.quiz.length > 0) {
    ensureSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('6. Self-Assessment Knowledge Quiz', margin, y);
    y += 6;

    docData.quiz.forEach((q, qIdx) => {
      ensureSpace(24);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      const qLines = doc.splitTextToSize(`Q${qIdx + 1}: ${q.question}`, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 4.8 + 2;

      q.options.forEach((opt, oIdx) => {
        ensureSpace(7);
        const letter = String.fromCharCode(65 + oIdx);
        const isCorrect = oIdx === q.correctIndex;
        doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(isCorrect ? colors.accent[0] : colors.text[0], isCorrect ? colors.accent[1] : colors.text[1], isCorrect ? colors.accent[2] : colors.text[2]);
        const optLines = doc.splitTextToSize(`[${letter}] ${opt}${isCorrect ? '  (Correct Answer)' : ''}`, contentWidth - 8);
        doc.text(optLines, margin + 4, y);
        y += optLines.length * 4.2 + 1;
      });

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
      const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 8);
      doc.text(expLines, margin + 4, y);
      y += expLines.length * 4 + 4;
    });
    y += 4;
  }

  // --- SECTION: MINDMAP / CONCEPT HIERARCHY ---
  if (docData.mindmapAscii) {
    ensureSpace(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text('7. Knowledge Hierarchy & Mindmap', margin, y);
    y += 6;

    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    const mmLines = doc.splitTextToSize(docData.mindmapAscii, contentWidth);
    for (const mLine of mmLines) {
      ensureSpace(4);
      doc.text(mLine, margin, y);
      y += 3.6;
    }
  }

  // --- FOOTERS & PAGE NUMBERS ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - margin + 4, pageWidth - margin, pageHeight - margin + 4);

    doc.text('AutoDoc AI Engine • Autonomous YouTube Knowledge Synthesizer', margin, pageHeight - margin + 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 18, pageHeight - margin + 8);
  }

  return doc;
}
