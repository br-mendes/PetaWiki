import { SupportedLanguage } from '../types';

const LIBRE_TRANSLATE_URL = 'http://localhost:5000/translate';

export const LANGUAGES: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
];

/**
 * Sanitizes content to avoid sending sensitive PII patterns (simple regex approach).
 */
const sanitizeContent = (html: string): string => {
  return html
    .replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, '[EMAIL_REDACTED]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE_REDACTED]');
};

/**
 * Simulates translation if API is offline.
 */
const mockTranslate = (text: string, targetLang: SupportedLanguage): string => {
  const prefix = `[${targetLang.toUpperCase()}] `;
  // Naive replacement just to show change in UI
  return text.replace(/<[^>]*>|[^<]+/g, (match) => {
    if (match.startsWith('<')) return match; // Keep tags
    if (match.trim().length === 0) return match; // Keep whitespace
    return prefix + match.trim() + ' ';
  });
};

/**
 * Translates HTML content using LibreTranslate.
 */
export const translateDocument = async (
  title: string,
  contentHtml: string,
  targetLang: SupportedLanguage
): Promise<{ title: string; content: string }> => {
  
  const sanitizedContent = sanitizeContent(contentHtml);

  try {
    // Attempt 1: Title
    const titleRes = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      body: JSON.stringify({ q: title, source: 'auto', target: targetLang, format: 'text' }),
      headers: { 'Content-Type': 'application/json' },
    });

    // Attempt 2: Content (HTML)
    const contentRes = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      body: JSON.stringify({ q: sanitizedContent, source: 'auto', target: targetLang, format: 'html' }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!titleRes.ok || !contentRes.ok) throw new Error('LibreTranslate API Error');

    const titleData = await titleRes.json();
    const contentData = await contentRes.json();

    return {
      title: titleData.translatedText,
      content: contentData.translatedText
    };

  } catch (error) {
    console.warn("LibreTranslate offline or unreachable. Using Mock fallback.", error);
    
    // Fallback: Mock translation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: `[${targetLang.toUpperCase()}] ${title}`,
          content: mockTranslate(contentHtml, targetLang)
        });
      }, 1000); // Simulate network delay
    });
  }
};
