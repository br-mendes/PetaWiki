
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { applyCors } from './_cors';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing SUPABASE server env (VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)');
}

const supabase = createClient(supabaseUrl, serviceKey);

export default async function handler(req: any, res: any) {
  if (applyCors(req, res, { methods: ['POST', 'OPTIONS'] })) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, password, token, action } = req.body || {};

  if (!email || !password || !token) {
    return res.status(400).json({ error: 'Email, token e nova senha são obrigatórios.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedAction = action === 'setup-password' ? 'setup' : 'reset';

  const secret = process.env.RESET_TOKEN_SECRET || '';
  const tokenHash = crypto
    .createHash('sha256')
    .update(`${String(token)}:${secret}`)
    .digest('hex');

  try {
    // Validate token against password_resets
    const { data: tokenRow, error: tokenErr } = await supabase
      .from('password_resets')
      .select('id, expires_at, used_at')
      .eq('email', normalizedEmail)
      .eq('action', normalizedAction)
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (tokenErr) throw tokenErr;

    if (!tokenRow || tokenRow.used_at) {
      return res.status(400).json({ error: 'Token inválido.' });
    }

    if (tokenRow.expires_at && new Date(tokenRow.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Token expirado.' });
    }

    // Atualiza a senha usando a chave de serviço (ignora RLS)
    const { data, error } = await supabase
      .from('users')
      .update({ password: password })
      .eq('email', normalizedEmail)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Mark token as used
    await supabase
      .from('password_resets')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRow.id);

    return res.status(200).json({ success: true, message: 'Senha atualizada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return res.status(500).json({ error: error.message });
  }
}
