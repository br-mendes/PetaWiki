
import { SystemSettings, User } from '../types';

interface EmailResult {
  success: boolean;
  message?: string;
  id?: string;
}

/**
 * Envia um e-mail usando a API Route interna (/api/send-email).
 */
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<EmailResult> {
  try {
    // Chama o endpoint server-side criado em api/send-email.ts
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html: htmlContent
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('Falha no envio de e-mail:', data);
      return { 
          success: false, 
          message: data.error?.message || data.error || 'Erro desconhecido no envio.' 
      };
    }

    const emailId = data?.result?.data?.id;
    console.log('E-mail enviado com sucesso. ID:', emailId);
    return { 
        success: true, 
        message: 'E-mail enviado com sucesso!',
        id: emailId // Retorna o ID real (UUID) para validação
    };

  } catch (error: any) {
    console.error('Erro de rede ao enviar e-mail:', error);
    return { 
      success: false, 
      message: 'Erro de conexão com o servidor de e-mail.' 
    };
  }
}

/**
 * Template de E-mail Base
 */
const getBaseHtml = (content: string, settings: SystemSettings) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; border: 1px solid #ddd; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
    .logo { max-height: 60px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
    .footer { margin-top: 30px; font-size: 12px; text-align: center; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${settings.logoCollapsedUrl}" alt="Logo" class="logo" />
      <h2 style="margin: 10px 0 0 0; color: #2563eb;">${settings.appName || 'Peta Wiki'}</h2>
    </div>
    ${content}
    <div class="footer">
      <p>Este é um e-mail automático. Por favor, não responda.</p>
      <p>&copy; ${new Date().getFullYear()} ${settings.appName || 'Peta Wiki Corp'}. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Envia e-mail de boas-vindas com link para definir senha
 */
export const sendWelcomeEmail = async (user: Partial<User>, settings: SystemSettings): Promise<EmailResult> => {
  if (!user.email || !user.name) return { success: false, message: 'Dados de usuário incompletos.' };

  try {
    const response = await fetch('/api/password-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        action: 'setup',
        name: user.name,
        department: user.department,
        role: user.role,
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.error || 'Falha ao enviar e-mail.' };
    }
    return { success: true, message: 'E-mail enviado com sucesso!', id: data.id };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Erro de conexão com o servidor de e-mail.' };
  }
};

/**
 * Envia e-mail de recuperação de senha
 */
export const sendPasswordResetEmail = async (email: string, settings: SystemSettings): Promise<EmailResult> => {
  try {
    const response = await fetch('/api/password-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, action: 'reset' })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, message: data.error || 'Falha ao enviar e-mail.' };
    }

    return { success: true, message: 'Se este e-mail estiver cadastrado, você receberá um link de redefinição.', id: data.id };
  } catch (e: any) {
    return { success: false, message: e?.message || 'Erro de conexão com o servidor de e-mail.' };
  }
};
