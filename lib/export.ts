import { Document, User, SystemSettings } from '../types';
import html2pdf from 'html2pdf.js';

/**
 * Checks if the user has permission to export the specific document.
 */
export const canExportDocument = (user: User, document: Document): boolean => {
  if (user.role === 'ADMIN') return true;
  if (document.status === 'PUBLISHED') return true; // Reader & Editor can export published
  if (user.role === 'EDITOR' && document.authorId === user.id) return true; // Editor can export own drafts
  return false;
};

/**
 * Converts HTML content to basic Markdown (Client-side implementation).
 */
export const generateMarkdown = (document: Document, user: User): void => {
  const frontmatter = `---
titulo: "${document.title}"
autor: "${user.name}"
data: "${new Date(document.updatedAt).toISOString()}"
status: "${document.status}"
tags: [${document.tags.join(', ')}]
categoria: "${document.categoryPath}"
gerado_por: "Peta Wiki"
---

`;

  // Simple HTML to MD conversion (basic)
  let markdown = document.content
    .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
    .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '\n')
    .replace(/<li>(.*?)<\/li>/g, '- $1\n')
    .replace(/<ol>/g, '')
    .replace(/<\/ol>/g, '\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, ''); // Strip remaining tags

  const fullContent = frontmatter + markdown;
  
  // Trigger download
  const blob = new Blob([fullContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generates a branded PDF using html2pdf.js
 */
export const generatePDF = (document: Document, user: User, settings?: SystemSettings): void => {
  // Create a temporary container for the PDF structure
  const container = window.document.createElement('div');
  container.className = 'pdf-export-container';
  
  // Watermark Logic
  const isDraft = document.status !== 'PUBLISHED';
  const watermarkText = document.status === 'DRAFT' ? 'RASCUNHO' : 'EM REVISÃO';
  const watermarkHtml = isDraft 
    ? `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; color: rgba(200, 0, 0, 0.1); font-weight: bold; pointer-events: none; z-index: 1000;">
         ${watermarkText}
       </div>`
    : '';

  // Use Expanded logo preferably for PDF, fallback to Collapsed
  const logoUrl = settings?.logoExpandedUrl || settings?.logoCollapsedUrl;
  const logoHtml = logoUrl 
    ? `<img src="${logoUrl}" style="max-height: 80px; margin-bottom: 20px;" crossorigin="anonymous" />`
    : `<div class="logo">Peta Wiki</div>`;

  // Cover Page Styles
  const styles = `
    <style>
      .pdf-page { padding: 40px; font-family: sans-serif; position: relative; }
      .cover-page { height: 1100px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 10px solid #f3f4f6; }
      .logo { font-size: 40px; font-weight: bold; color: #2563eb; margin-bottom: 20px; }
      .title { font-size: 36px; font-weight: bold; margin-bottom: 20px; color: #111827; }
      .meta { color: #6b7280; font-size: 14px; margin-top: auto; padding-bottom: 50px; }
      .content-page { page-break-before: always; padding-top: 50px; }
      .footer { position: fixed; bottom: 10px; left: 0; right: 0; text-align: center; font-size: 10px; color: #9ca3af; }
      h1 { color: #1e3a8a; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
      h2 { color: #1f2937; margin-top: 20px; }
      p { line-height: 1.6; color: #374151; }
    </style>
  `;

  const coverPage = `
    <div class="pdf-page cover-page">
      ${logoHtml}
      <div class="title">${document.title}</div>
      <div style="font-size: 16px; color: #4b5563;">${document.categoryPath}</div>
      ${watermarkHtml}
      <div class="meta">
        <p><strong>Autor:</strong> ${user.name} (${user.department})</p>
        <p><strong>Exportado:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Status:</strong> ${document.status}</p>
        <p style="font-size: 10px; margin-top: 10px;">CONFIDENCIAL - USO INTERNO</p>
      </div>
    </div>
  `;

  const contentPage = `
    <div class="pdf-page content-page">
      ${document.content}
      <div class="footer">Página 1 • Gerado por ${settings?.appName || 'Peta Wiki'}</div>
    </div>
  `;

  container.innerHTML = styles + coverPage + contentPage;
  window.document.body.appendChild(container);

  const opt = {
    margin:       0,
    filename:     `${document.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate
  html2pdf().set(opt).from(container).save().then(() => {
    // Cleanup
    window.document.body.removeChild(container);
  });
};