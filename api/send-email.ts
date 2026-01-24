
import { Resend } from 'resend';

// Chave fornecida no código original
const resend = new Resend('re_6fMYtT9F_AHdtPaNyqFRNixYtNCyRwrRv');

export default async function handler(req: any, res: any) {
  // CORS Headers para permitir chamadas do frontend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, subject, html } = req.body;

  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Envio real via Resend SDK
    const data = await resend.emails.send({
      from: 'Peta Wiki <onboarding@resend.dev>', // Sender padrão para contas de teste
      to: [to],
      subject: subject,
      html: html,
    });

    if (data.error) {
        return res.status(400).json({ error: data.error });
    }

    // Retorna os dados, incluindo o ID (UUID)
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Resend Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
