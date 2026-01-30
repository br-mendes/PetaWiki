
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';
import { applyCors } from './_cors';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

if (!supabaseUrl || !supabaseKey || !WEBHOOK_SECRET) {
  throw new Error('Missing env: VITE_SUPABASE_URL/SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_WEBHOOK_SECRET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ... mantenha o resto

async function getRawBody(req: any): Promise<string> {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.body && typeof req.body === 'object') {
    try {
      return JSON.stringify(req.body);
    } catch {
      // fall through
    }
  }

  let data = '';
  for await (const chunk of req) {
    data += chunk;
  }
  return data;
}

export default async function handler(req: any, res: any) {
  // This endpoint is called server-to-server; CORS is not required, but
  // handling OPTIONS avoids noisy preflight failures in misconfigured clients.
  if (applyCors(req, res, { methods: ['POST', 'OPTIONS'] })) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = req.body;
  const headers = req.headers;

  // 1. Verificar Assinatura (Segurança)
  const wh = new Webhook(WEBHOOK_SECRET);
  let msg: any;

  try {
    const svixId = headers['svix-id'];
    const svixTimestamp = headers['svix-timestamp'];
    const svixSignature = headers['svix-signature'];

    if (!svixId || !svixTimestamp || !svixSignature) {
      return res.status(400).json({ error: 'Missing Svix signature headers' });
    }

    const raw = await getRawBody(req);
    msg = wh.verify(raw, {
      'svix-id': String(svixId),
      'svix-timestamp': String(svixTimestamp),
      'svix-signature': String(svixSignature),
    } as any);
  } catch (err) {
    console.error('Webhook verification failed', err);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // 2. Processar Evento
  const eventType = msg.type; // ex: 'email.sent'
  const emailId = msg.data?.email_id;
  const recipient = msg.data?.to?.[0];

  console.log(`Recebido evento Resend: ${eventType} para ${recipient}`);

  // 3. Salvar no Supabase
  try {
    const { error } = await supabase.from('email_logs').insert({
      event_type: eventType,
      email_id: emailId,
      recipient: recipient,
      payload: msg,
      created_at: new Date().toISOString()
    });

    if (error) throw error;

    return res.status(200).json({ received: true });
  } catch (e: any) {
    console.error('Erro ao salvar log:', e);
    return res.status(500).json({ error: e.message });
  }
}
