import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";
import { applyCors } from "./_cors";

type LinkAction = "reset" | "setup";

function getRequestOrigin(req: any): string {
  const proto = (req.headers?.["x-forwarded-proto"] || "https") as string;
  const host = (req.headers?.["x-forwarded-host"] || req.headers?.host || "") as string;
  if (!host) return "";
  return `${proto}://${host}`;
}

function hashToken(token: string): string {
  const secret = process.env.RESET_TOKEN_SECRET || "";
  return crypto
    .createHash("sha256")
    .update(`${token}:${secret}`)
    .digest("hex");
}

function buildEmailHtml(params: {
  action: LinkAction;
  appName: string;
  logoUrl?: string | null;
  toEmail: string;
  link: string;
  name?: string;
  department?: string;
  role?: string;
}): string {
  const title = params.action === "setup" ? "Defina sua senha" : "Redefina sua senha";
  const intro =
    params.action === "setup"
      ? `Sua conta no <strong>${params.appName}</strong> foi criada. Para começar, defina sua senha de acesso.`
      : `Recebemos uma solicitacao para redefinir a senha da conta <strong>${params.toEmail}</strong>.`;

  const accountDetails =
    params.action === "setup"
      ? `
        <p style="margin: 16px 0 0 0;">Dados da conta:</p>
        <ul>
          ${params.name ? `<li><strong>Nome:</strong> ${params.name}</li>` : ""}
          ${params.department ? `<li><strong>Departamento:</strong> ${params.department}</li>` : ""}
          ${params.role ? `<li><strong>Funcao:</strong> ${params.role}</li>` : ""}
          <li><strong>Login:</strong> ${params.toEmail}</li>
        </ul>
      `
      : "";

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f9fafb; padding: 20px; }
      .container { max-width: 640px; margin: 0 auto; background: #ffffff; padding: 28px; border-radius: 12px; border: 1px solid #e5e7eb; }
      .header { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; margin-bottom: 18px; }
      .logo { width: 40px; height: 40px; object-fit: contain; border-radius: 10px; background: #ffffff; border: 1px solid #e5e7eb; }
      .app { font-size: 18px; font-weight: 700; color: #111827; }
      .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 18px; text-decoration: none; border-radius: 10px; font-weight: 700; }
      .muted { color: #6b7280; font-size: 12px; }
      ul { margin: 10px 0; padding-left: 18px; }
      li { margin: 4px 0; }
      code { word-break: break-all; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        ${params.logoUrl ? `<img class="logo" src="${params.logoUrl}" alt="Logo" />` : ""}
        <div class="app">${params.appName}</div>
      </div>
      <h2 style="margin: 0 0 8px 0;">${title}</h2>
      <p style="margin: 0 0 14px 0;">${intro}</p>
      <p style="margin: 0 0 14px 0; text-align: center;">
        <a class="btn" href="${params.link}">${title}</a>
      </p>
      <p class="muted" style="margin: 0 0 6px 0;">Se o botao nao funcionar, copie e cole este link no navegador:</p>
      <p class="muted" style="margin: 0 0 0 0;"><code>${params.link}</code></p>
      ${accountDetails}
      <p class="muted" style="margin-top: 18px;">Este link expira automaticamente.</p>
    </div>
  </body>
</html>
  `.trim();
}

export default async function handler(req: any, res: any) {
  if (applyCors(req, res, { methods: ["POST", "OPTIONS"] })) return;
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM || "no-reply@petawiki.local";

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: "Missing SUPABASE server env" });
  }
  if (!resendKey) {
    return res.status(500).json({ error: "Missing RESEND_API_KEY" });
  }

  const { email, action, name, department, role } = req.body || {};

  const normalizedAction: LinkAction = action === "setup" || action === "setup-password" ? "setup" : "reset";

  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Missing field: email" });
  }

  const toEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  const sb = createClient(supabaseUrl, serviceKey);
  const resend = new Resend(resendKey);

  // Avoid leaking whether the user exists.
  const { data: userRow } = await sb.from("users").select("id").eq("email", toEmail).maybeSingle();
  if (!userRow) {
    return res.status(200).json({ success: true });
  }

  // Rate limit (best-effort): 1 request/minute per email+action.
  try {
    const { data: recent } = await sb
      .from("password_resets")
      .select("created_at")
      .eq("email", toEmail)
      .eq("action", normalizedAction)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1);

    const createdAt = recent?.[0]?.created_at ? new Date(recent[0].created_at).getTime() : 0;
    if (createdAt && Date.now() - createdAt < 60_000) {
      return res.status(200).json({ success: true });
    }
  } catch {
    // If the table doesn't exist yet, let it fail below with a clearer error.
  }

  // Invalidate previous unused tokens for this email+action.
  await sb
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("email", toEmail)
    .eq("action", normalizedAction)
    .is("used_at", null);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { error: insertErr } = await sb.from("password_resets").insert({
    email: toEmail,
    action: normalizedAction,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_ip: req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || null,
    created_user_agent: req.headers?.["user-agent"] || null,
  });

  if (insertErr) {
    return res.status(500).json({ error: insertErr.message });
  }

  const { data: settingsRow } = await sb.from("system_settings").select("settings").single();
  const appName = settingsRow?.settings?.appName || settingsRow?.settings?.landingTitle || "Peta Wiki";
  const logoUrl = settingsRow?.settings?.logoCollapsedUrl || null;

  const baseUrl = process.env.APP_URL || getRequestOrigin(req);
  if (!baseUrl) {
    return res.status(500).json({ error: "Missing APP_URL (cannot build link)" });
  }

  const uiAction = normalizedAction === "setup" ? "setup-password" : "reset-password";
  const link = `${baseUrl}?action=${encodeURIComponent(uiAction)}&email=${encodeURIComponent(toEmail)}&token=${encodeURIComponent(rawToken)}`;

  const subject =
    normalizedAction === "setup"
      ? `Bem-vindo ao ${appName} - Defina sua senha`
      : `Redefinicao de senha - ${appName}`;

  const html = buildEmailHtml({
    action: normalizedAction,
    appName,
    logoUrl,
    toEmail,
    link,
    name,
    department,
    role,
  });

  try {
    const result = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: [toEmail],
      subject,
      html,
    });

    return res.status(200).json({ success: true, id: result?.data?.id || null });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || "Failed to send email" });
  }
}
