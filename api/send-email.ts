import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'itsm@petacorp.com.br';

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SUPABASE server env (VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
}
if (!resendKey) {
  throw new Error('Missing RESEND_API_KEY');
}

const sb = createClient(supabaseUrl, serviceKey);
const resend = new Resend(resendKey);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing fields: to, subject, html' });
  }

  // Nome do remetente = appName do painel Admin (system_settings.settings.appName)
  const { data: settingsRow, error: settingsErr } = await sb
    .from('system_settings')
    .select('settings')
    .single();

  if (settingsErr) {
    return res.status(500).json({ error: settingsErr.message });
  }

  const appName = settingsRow?.settings?.appName || settingsRow?.settings?.landingTitle || 'Peta Wiki';

  try {
    const result = await resend.emails.send({
      from: `${appName} <${fromEmail}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    return res.status(200).json({ success: true, result });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
}