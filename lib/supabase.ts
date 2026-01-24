
import { createClient } from '@supabase/supabase-js';

// Configuração Real de Produção
// Nota: Em um ambiente Vercel ideal, estas variáveis deveriam estar em process.env.VITE_SUPABASE_URL
const supabaseUrl = 'https://zjsewlyxvznwdtgmknpw.supabase.co';

// ATENÇÃO: Usando apenas a ANON PUBLIC KEY para segurança no cliente.
// Nunca use a Service Role Key no frontend.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpqc2V3bHl4dnpud2R0Z21rbnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNzQyNDIsImV4cCI6MjA4NDc1MDI0Mn0.M_fGPQY5kyCOB-D8ju_ow72tzVpNOWKr3XKKIg_P4Kw';

export const supabase = createClient(supabaseUrl, supabaseKey);
