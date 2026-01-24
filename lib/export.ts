
import { Document, User, SystemSettings } from '../types';
import html2pdf from 'html2pdf.js';

/**
 * Checks if the user has permission to export the specific document.
 */
export const canExportDocument = (user: User, doc: Document): boolean => {
  if (user.role === 'ADMIN') return true;
  if (doc.status === 'PUBLISHED') return true; // Reader & Editor can export published
  if (user.role === 'EDITOR' && doc.authorId === user.id) return true; // Editor can export own drafts
  return false;
};

/**
 * Converts HTML content to basic Markdown (Client-side implementation).
 */
export const generateMarkdown = (doc: Document, user: User): void => {
  const frontmatter = `---
titulo: "${doc.title}"
autor: "${user.name}"
data: "${new Date(doc.updatedAt).toISOString()}"
status: "${doc.status}"
tags: [${doc.tags.join(', ')}]
categoria: "${doc.categoryPath}"
gerado_por: "Peta Wiki"
---

`;

  // Simple HTML to MD conversion (basic)
  let markdown = doc.content
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
  const a = document.createElement('a');
  a.href = url;
  a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Generates a DOCX compatible file (MIME application/msword with HTML content).
 * This preserves layout, images, and tables much better than raw XML generation on client-side.
 */
export const generateDOCX = (doc: Document, user: User, settings?: SystemSettings): void => {
  const appName = settings?.appName || 'Peta Wiki';
  // Prefer expanded logo for documents, fallback to collapsed
  const logoUrl = settings?.logoExpandedUrl || settings?.logoCollapsedUrl || '';

  // Microsoft Word HTML format wrapper with Print Layout View configuration
  const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${doc.title}</title>
    <style>
      /* Page Setup for A4 */
      @page {
        size: 21cm 29.7cm;
        margin: 2cm 2cm 2cm 2cm;
        mso-page-orientation: portrait;
      }
      body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #333; line-height: 1.5; }
      
      /* Header & Footer Simulation in Flow */
      .doc-header { text-align: right; font-size: 9pt; color: #888; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 30px; }
      .doc-footer { margin-top: 50px; padding-top: 10px; border-top: 1px solid #ddd; text-align: center; font-size: 8pt; color: #888; }
      
      /* Content Styling */
      h1 { font-size: 24pt; color: #2563eb; margin-top: 0; margin-bottom: 12px; font-weight: bold; }
      h2 { font-size: 18pt; color: #1e40af; margin-top: 24px; margin-bottom: 10px; font-weight: bold; }
      h3 { font-size: 14pt; color: #1e3a8a; margin-top: 20px; margin-bottom: 8px; font-weight: bold; }
      p { margin-bottom: 12px; text-align: justify; }
      a { color: #2563eb; text-decoration: underline; }
      
      /* Metadata Box */
      .meta-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; margin-bottom: 30px; border-radius: 4px; font-size: 10pt; }
      .meta-row { margin-bottom: 4px; }
      .meta-label { font-weight: bold; color: #475569; margin-right: 5px; }
      
      /* Tables */
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      td, th { border: 1px solid #cbd5e1; padding: 8px; font-size: 10pt; }
      th { background-color: #f1f5f9; text-align: left; }
      
      img { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>
    <div class="doc-header">
       ${appName} - Documentação Corporativa
    </div>

    <!-- Logo Section -->
    ${logoUrl ? `<div style="margin-bottom: 25px;"><img src="${logoUrl}" height="60" alt="Logo" /></div>` : ''}

    <!-- Metadata -->
    <div class="meta-box">
      <div class="meta-row"><span class="meta-label">Documento:</span> ${doc.title}</div>
      <div class="meta-row"><span class="meta-label">Categoria:</span> ${doc.categoryPath || 'Geral'}</div>
      <div class="meta-row"><span class="meta-label">Autor:</span> ${user.name} (${user.department || 'Geral'})</div>
      <div class="meta-row"><span class="meta-label">Data:</span> ${new Date(doc.updatedAt).toLocaleDateString()}</div>
    </div>

    <!-- Main Content -->
    <h1>${doc.title}</h1>
    
    ${doc.content}

    <div class="doc-footer">
      Gerado por ${appName} em ${new Date().toLocaleString()}
    </div>
  </body></html>`;

  // Create Blob with Word MIME type
  const blob = new Blob(['\ufeff', preHtml], {
      type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  // .doc extension ensures it opens correctly in Word as HTML-XML
  link.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.doc`; 
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates a branded PDF using html2pdf.js with improved layout matching the DOCX style.
 */
export const generatePDF = (doc: Document, user: User, settings?: SystemSettings): void => {
  const appName = settings?.appName || 'Peta Wiki';
  const logoUrl = settings?.logoExpandedUrl || settings?.logoCollapsedUrl;

  // Temporary container for PDF content
  const container = document.createElement('div');
  container.className = 'pdf-export-container';
  container.style.width = '100%'; 
  
  // HTML Content Construction
  const content = `
    <style>
      .pdf-wrapper {
        font-family: 'Helvetica', 'Arial', sans-serif;
        padding: 0 40px; /* Side padding only, top/bottom handled by pdf margins */
        color: #333;
        font-size: 12px;
        line-height: 1.6;
      }
      h1 { font-size: 24px; color: #2563eb; margin-bottom: 20px; font-weight: bold; border-bottom: 2px solid #eff6ff; padding-bottom: 10px; }
      h2 { font-size: 18px; color: #1e40af; margin-top: 25px; margin-bottom: 10px; font-weight: bold; }
      h3 { font-size: 16px; color: #1e3a8a; margin-top: 20px; margin-bottom: 8px; font-weight: bold; }
      p { margin-bottom: 12px; text-align: justify; }
      ul, ol { margin-bottom: 12px; padding-left: 20px; }
      li { margin-bottom: 5px; }
      
      .meta-box { 
        background-color: #f8fafc; 
        border: 1px solid #e2e8f0; 
        padding: 15px; 
        margin-bottom: 30px; 
        border-radius: 6px; 
        font-size: 11px;
      }
      .meta-row { margin-bottom: 5px; }
      .meta-label { font-weight: bold; color: #475569; margin-right: 5px; }
      
      table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
      th { background-color: #f1f5f9; text-align: left; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; }
      td { border: 1px solid #cbd5e1; padding: 8px; }
      
      img { max-width: 100%; height: auto; border-radius: 4px; }
      blockquote { border-left: 4px solid #3b82f6; padding-left: 15px; margin: 15px 0; color: #64748b; font-style: italic; }
      
      .watermark {
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 80px; color: rgba(200, 0, 0, 0.05); font-weight: bold; pointer-events: none; z-index: -1;
        border: 5px solid rgba(200,0,0,0.05); padding: 20px;
      }
    </style>

    <div class="pdf-wrapper">
      ${doc.status !== 'PUBLISHED' ? '<div class="watermark">RASCUNHO</div>' : ''}
      
      <!-- Top Logo -->
      ${logoUrl ? `<div style="margin-bottom: 25px;"><img src="${logoUrl}" style="height: 50px; object-fit: contain;" crossorigin="anonymous" /></div>` : ''}

      <!-- Meta Box (Same as DOCX) -->
      <div class="meta-box">
        <div class="meta-row"><span class="meta-label">Documento:</span> ${doc.title}</div>
        <div class="meta-row"><span class="meta-label">Categoria:</span> ${doc.categoryPath || 'Geral'}</div>
        <div class="meta-row"><span class="meta-label">Autor:</span> ${user.name} (${user.department || 'Geral'})</div>
        <div class="meta-row"><span class="meta-label">Data:</span> ${new Date(doc.updatedAt).toLocaleDateString()}</div>
      </div>

      <h1>${doc.title}</h1>
      
      <div>
        ${doc.content}
      </div>
    </div>
  `;

  container.innerHTML = content;
  document.body.appendChild(container);

  const opt = {
    margin:       [20, 0, 20, 0], // Top/Bottom margins for Header/Footer space
    filename:     `${doc.title.toLowerCase().replace(/\s+/g, '-')}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).toPdf().get('pdf').then((pdf: any) => {
    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Add Headers and Footers to every page
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      // Header Line
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.line(15, 15, pageWidth - 15, 15);
      
      // Header Text
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${appName} - Documentação Corporativa`, pageWidth - 15, 12, { align: 'right' });

      // Footer Line
      pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Footer Text
      const footerLeft = `Gerado por ${appName}`;
      const footerRight = `Página ${i} de ${totalPages}`;
      
      pdf.text(footerLeft, 15, pageHeight - 10);
      pdf.text(footerRight, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }
  }).save().then(() => {
    document.body.removeChild(container);
  });
};
