
// Execute este script com: node scripts/register-webhook.js
// Certifique-se de ter definido a chave API correta.

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) throw new Error('Missing RESEND_API_KEY');

const resend = new Resend(RESEND_API_KEY);

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://peta-wiki.vercel.app/api/webhook';

async function register() {
  console.log(`Registrando Webhook em: ${WEBHOOK_URL}...`);
  
  try {
    const { data, error } = await resend.webhooks.create({
      endpoint: WEBHOOK_URL,
      events: [
        'email.sent',
        'email.delivered',
        'email.bounced',
        'email.complained'
      ],
    });

    if (error) {
      console.error('Erro ao registrar webhook:', error);
      return;
    }

    console.log('Webhook registrado com sucesso!');
    console.log('ID:', data.id);
    console.log('Secret (Guarde isso):', data.secret);
    
  } catch (e) {
    console.error('Exceção:', e);
  }
}

register();
