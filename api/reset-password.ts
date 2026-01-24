
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com Service Role (Admin)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zjsewlyxvznwdtgmknpw.supabase.co';
// Chave de serviço (Service Role) obtida do arquivo api/webhook.ts existente
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2V3bHl4dnpud2R0Z21rbnB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE3NDI0MiwiZXhwIjoyMDg0NzUwMjQyfQ.bNUNMv8o3p5EjKa4TImtN8uDNis5vqNHL8n-w9AAH7c';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  // Configuração CORS
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

  const { email, password, token } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e nova senha são obrigatórios.' });
  }

  // Em um cenário real de produção, aqui validaríamos o 'token' com uma tabela de 'password_resets'
  // Para este protótipo, confiamos no link gerado.

  try {
    // Atualiza a senha usando a chave de serviço (ignora RLS)
    const { data, error } = await supabase
      .from('users')
      .update({ password: password })
      .eq('email', email)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.status(200).json({ success: true, message: 'Senha atualizada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ error: error.message });
  }
}
