
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
 * Generates a DOCX file (HTML-based) compatible with Microsoft Word.
 */
export const generateDOCX = (document: Document, user: User, settings?: SystemSettings): void => {
  // Microsoft Word HTML format wrapper
  const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head><meta charset='utf-8'><title>${document.title}</title>
  <style>
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; }
    h1 { font-size: 24pt; color: #2e74b5; margin-bottom: 12px; }
    h2 { font-size: 18pt; color: #2e74b5; margin-top: 20px; }
    h3 { font-size: 14pt; color: #1f4d78; margin-top: 16px; }
    p { margin-bottom: 10px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    td, th { border: 1px solid #999; padding: 5px; }
    ul, ol { margin-bottom: 10px; }
    .header { font-size: 9pt; color: #555; text-align: right; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 20px; }
    .footer { font-size: 9pt; color: #555; text-align: center; border-top: 1px solid #ddd; padding-top: 5px; margin-top: 30px; }
    .meta { background: #f9f9f9; padding: 15px; border: 1px solid #eee; margin-bottom: 25px; color: #444; font-size: 10pt; border-radius: 4px; }
  </style>
  </head><body>
  <div class="header">
    ${settings?.appName || 'Peta Wiki'} - Documentação Corporativa
  </div>
  `;

  const meta = `
    <div class="meta">
      <p style="margin:0;"><strong>Documento:</strong> ${document.title}</p>
      <p style="margin:0;"><strong>Categoria:</strong> ${document.categoryPath}</p>
      <p style="margin:0;"><strong>Autor:</strong> ${user.name} (${user.department || 'Geral'})</p>
      <p style="margin:0;"><strong>Data:</strong> ${new Date(document.updatedAt).toLocaleDateString()}</p>
    </div>
    <h1>${document.title}</h1>
  `;

  const postHtml = `
    <br/><br/>
    <div class="footer">
      Gerado por ${settings?.appName || 'Peta Wiki'} em ${new Date().toLocaleString()}
    </div>
    </body></html>`;

  const html = preHtml + meta + document.content + postHtml;

  const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = `${document.title.toLowerCase().replace(/\s+/g, '-')}.doc`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Generates a branded PDF using html2pdf.js with improved layout
 */
export const generatePDF = (document: Document, user: User, settings?: SystemSettings): void => {
  // Create a temporary container for the PDF structure
  const container = window.document.createElement('div');
  container.className = 'pdf-export-container';
  
  // Watermark Logic
  const isDraft = document.status !== 'PUBLISHED';
  const watermarkText = document.status === 'DRAFT' ? 'RASCUNHO' : 'EM REVISÃO';
  const watermarkHtml = isDraft 
    ? `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(200, 0, 0, 0.08); font-weight: bold; pointer-events: none; z-index: 1000; border: 5px solid rgba(200,0,0,0.08); padding: 20px; text-transform: uppercase;">
         ${watermarkText}
       </div>`
    : '';

  const logoUrl = settings?.logoExpandedUrl || settings?.logoCollapsedUrl;
  const logoHtml = logoUrl 
    ? `<img src="${logoUrl}" style="max-height: 60px; margin-bottom: 20px;" crossorigin="anonymous" />`
    : `<div class="logo" style="font-size: 30px; font-weight: bold; color: #1e3a8a; margin-bottom: 20px;">${settings?.appName || 'Peta Wiki'}</div>`;

  // Professional Document CSS
  const styles = `
    <style>
      .pdf-page { 
        padding: 40px 50px; 
        font-family: 'Helvetica', 'Arial', sans-serif; 
        color: #1f2937; 
        background: #fff;
        font-size: 12px;
        position: relative;
      }
      
      /* Typography */
      h1 { color: #1e3a8a; font-size: 26px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-top: 0; margin-bottom: 25px; line-height: 1.2; }
      h2 { color: #1f2937; font-size: 20px; margin-top: 30px; margin-bottom: 15px; font-weight: 700; }
      h3 { color: #374151; font-size: 16px; margin-top: 25px; margin-bottom: 12px; font-weight: 600; }
      p { line-height: 1.7; margin-bottom: 15px; text-align: justify; color: #374151; }
      ul, ol { margin-bottom: 15px; padding-left: 25px; color: #374151; }
      li { margin-bottom: 6px; }
      a { color: #2563eb; text-decoration: none; }
      strong { color: #111827; }
      
      /* Tables */
      table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
      th { background-color: #f8fafc; text-align: left; font-weight: 700; color: #1e293b; border-bottom: 2px solid #cbd5e1; }
      td, th { border: 1px solid #e2e8f0; padding: 10px 12px; vertical-align: top; }
      tr:nth-child(even) { background-color: #fcfcfc; }
      
      /* Visual Elements */
      blockquote { border-left: 4px solid #3b82f6; margin: 20px 0; color: #4b5563; background: #eff6ff; padding: 15px 20px; border-radius: 0 4px 4px 0; font-style: italic; }
      pre { background-color: #1e293b; color: #f8fafc; padding: 15px; border-radius: 6px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 11px; margin: 20px 0; }
      code { font-family: 'Courier New', monospace; background-color: #f1f5f9; padding: 2px 5px; rounded: 3px; color: #ef4444; font-size: 0.9em; }
      img { max-width: 100%; height: auto; border-radius: 4px; margin: 15px 0; border: 1px solid #e5e7eb; }

      /* Cover Page */
      .cover-page { 
        height: 1050px; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        text-align: center; 
        background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
        margin-bottom: 0;
      }
      
      .cover-content { z-index: 10; width: 100%; max-width: 600px; }
      .cover-title { font-size: 42px; font-weight: 800; color: #1e3a8a; margin-bottom: 10px; line-height: 1.1; letter-spacing: -0.5px; }
      .cover-subtitle { font-size: 18px; color: #64748b; margin-bottom: 60px; font-weight: 300; }
      
      .cover-meta { 
        background: white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border-radius: 12px;
        padding: 30px;
        margin-top: 40px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        text-align: left;
      }
      
      .meta-item { padding: 10px; }
      .meta-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; display: block; }
      .meta-value { font-size: 14px; color: #334155; font-weight: 500; }

      /* Headers */
      .page-header { 
        border-bottom: 2px solid #f1f5f9; 
        padding-bottom: 15px; 
        margin-bottom: 35px; 
        display: flex; 
        justify-content: space-between; 
        align-items: center; 
      }
      .page-header-info { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }

      .content-wrapper { padding-top: 10px; }
    </style>
  `;

  const coverPage = `
    <div class="pdf-page cover-page">
      ${watermarkHtml}
      <div class="cover-content">
        ${logoHtml}
        <div class="cover-title">${document.title}</div>
        <div class="cover-subtitle">${document.categoryPath || 'Base de Conhecimento'}</div>
        
        <div class="cover-meta">
          <div class="meta-item">
            <span class="meta-label">Autor</span>
            <div class="meta-value">${user.name}</div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Departamento</span>
            <div class="meta-value">${user.department || 'Geral'}</div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Última Atualização</span>
            <div class="meta-value">${new Date(document.updatedAt).toLocaleDateString()}</div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Status</span>
            <div class="meta-value" style="color: ${document.status === 'PUBLISHED' ? '#10b981' : '#f59e0b'}">${document.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}</div>
          </div>
        </div>
      </div>
      
      <div style="position: absolute; bottom: 50px; font-size: 10px; color: #cbd5e1;">
        ${settings?.appName || 'Peta Wiki'} &bull; Documento Confidencial
      </div>
    </div>
  `;

  const contentPage = `
    <div class="pdf-page">
      ${watermarkHtml}
      <div class="page-header">
        <div style="opacity: 0.7">${logoHtml}</div>
        <div class="page-header-info">${new Date().toLocaleDateString()} &bull; ID: ${document.id.substring(0,8)}</div>
      </div>
      
      <div class="content-wrapper">
        <h1>${document.title}</h1>
        ${document.content}
      </div>
    </div>
  `;

  container.innerHTML = styles + coverPage + contentPage;
  window.document.body.appendChild(container);

  const opt = {
    margin:       [10, 0, 10, 0], 
    filename:     `${document.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, letterRendering: true, scrollY: 0 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
  };

  html2pdf().set(opt).from(container).toPdf().get('pdf').then((pdf: any) => {
    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add footers starting from page 2 (skipping cover)
    for (let i = 2; i <= totalPages; i++) { 
      pdf.setPage(i);
      
      // Footer Divider
      pdf.setDrawColor(241, 245, 249); 
      pdf.setLineWidth(0.5);
      pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Footer Text
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // slate-400
      
      const leftText = `${settings?.appName || 'Peta Wiki'} - ${document.title.substring(0, 40)}${document.title.length > 40 ? '...' : ''}`;
      pdf.text(leftText, 15, pageHeight - 8);
      
      const rightText = `Página ${i} de ${totalPages}`;
      pdf.text(rightText, pageWidth - 15, pageHeight - 8, { align: 'right' });
    }
  }).save().then(() => {
    window.document.body.removeChild(container);
  });
};
