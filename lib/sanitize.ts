import DOMPurify from "dompurify";

export function sanitizeHtml(dirtyHtml: string): string {
  if (!dirtyHtml) return "";
  // Vite app is client-rendered; keep a safe fallback for non-DOM contexts.
  if (typeof window === "undefined") return dirtyHtml;

  return DOMPurify.sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
  });
}
