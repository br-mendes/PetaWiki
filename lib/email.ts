
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

    console.log('E-mail enviado com sucesso. ID:', data.data?.id);
    return { 
        success: true, 
        message: 'E-mail enviado com sucesso!',
        id: data.data?.id // Retorna o ID real (UUID) para validação
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

  const setupLink = `${window.location.origin}?action=setup-password&email=${encodeURIComponent(user.email)}`;
  
  const content = `
    <h3>Bem-vindo(a), ${user.name}!</h3>
    <p>Sua conta na <strong>${settings.appName || 'Peta Wiki'}</strong> foi criada com sucesso.</p>
    <p>Você agora tem acesso à nossa base de conhecimento corporativa. Para começar, por favor, defina sua senha segura clicando no botão abaixo:</p>
    <div style="text-align: center;">
      <a href="${setupLink}" class="button">Definir Minha Senha</a>
    </div>
    <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
    <p style="font-size: 12px; color: #666; word-break: break-all;">${setupLink}</p>
    <p>Seus dados de acesso:</p>
    <ul>
      <li><strong>Login:</strong> ${user.email}</li>
      <li><strong>Departamento:</strong> ${user.department || 'Geral'}</li>
      <li><strong>Função:</strong> ${user.role}</li>
    </ul>
  `;

  return sendEmail(user.email, `Bem-vindo ao ${settings.appName || 'Peta Wiki'} - Defina sua senha`, getBaseHtml(content, settings));
};

/**
 * Envia e-mail de recuperação de senha
 */
export const sendPasswordResetEmail = async (email: string, settings: SystemSettings): Promise<EmailResult> => {
  const resetLink = `${window.location.origin}?action=reset-password&email=${encodeURIComponent(email)}&token=${Date.now()}`;

  const content = `
    <h3>Solicitação de Redefinição de Senha</h3>
    <p>Recebemos uma solicitação para redefinir a senha associada ao e-mail <strong>${email}</strong>.</p>
    <p>Se foi você quem solicitou, clique no botão abaixo para criar uma nova senha:</p>
    <div style="text-align: center;">
      <a href="${resetLink}" class="button">Redefinir Senha</a>
    </div>
    <p style="margin-top: 20px;">Se você não solicitou esta alteração, pode ignorar este e-mail com segurança. Sua senha atual permanecerá inalterada.</p>
  `;

  return sendEmail(email, `Redefinição de Senha - ${settings.appName || 'Peta Wiki'}`, getBaseHtml(content, settings));
};
