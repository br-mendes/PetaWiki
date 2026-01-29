type CorsOptions = {
  methods?: string[];
  allowedOrigins?: string[];
};

function parseAllowedOrigins(): string[] {
  const raw = process.env.CORS_ALLOWED_ORIGINS || "";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const appUrl = (process.env.APP_URL || "").trim();
  const fromAppUrl = appUrl ? [appUrl] : [];

  return Array.from(new Set([...fromEnv, ...fromAppUrl]));
}

export function applyCors(req: any, res: any, opts: CorsOptions = {}): boolean {
  const origin = (req.headers?.origin || "") as string;
  const methods = (opts.methods && opts.methods.length > 0 ? opts.methods : ["POST"]).join(",");
  const allowedOrigins = (opts.allowedOrigins && opts.allowedOrigins.length > 0 ? opts.allowedOrigins : parseAllowedOrigins());

  // Only set CORS headers when there's an Origin header.
  if (origin) {
    const isAllowed = allowedOrigins.length === 0 ? true : allowedOrigins.includes(origin);
    if (isAllowed) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", methods);
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
