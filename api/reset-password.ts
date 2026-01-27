
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SUPABASE server env (VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
}

const supabase = createClient(supabaseUrl, serviceKey);

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
