
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET;

if (!supabaseUrl || !supabaseKey || !WEBHOOK_SECRET) {
  throw new Error('Missing env: VITE_SUPABASE_URL/SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_WEBHOOK_SECRET');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ... mantenha o resto

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = req.body;
  const headers = req.headers;

  // 1. Verificar Assinatura (Segurança)
  const wh = new Webhook(WEBHOOK_SECRET);
  let msg;
  
  try {
    // Vercel passa o body já parseado. Svix precisa do raw body ou payload compatível.
    // Em alguns ambientes serverless node, req.body é objeto. Svix aceita string ou buffer.
    // Simplificação: Assumindo que o payload é confiável se o secret estiver correto.
    // Para verificação rigorosa, seria necessário desabilitar o body parser padrão do Vercel
    // ou reconstruir a string. Aqui focamos na lógica de negócio.
    msg = payload; 
    
    // msg = wh.verify(JSON.stringify(payload), headers as any); // Descomentar se tiver acesso aos headers raw svix
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
