
interface AiResponse {
  success: boolean;
  response: string;
  model: string;
  error?: string;
}

/**
 * Envia um prompt para o endpoint interno /api/chat (Serverless).
 * A chave de API agora é gerenciada de forma segura no backend (Vercel).
 */
export async function generateAiResponse(
  systemInstruction: string, 
  userPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction,
        prompt: userPrompt,
        temperature
      })
    });

    // Ler o corpo como texto primeiro para evitar falha no response.json() se o retorno não for JSON (ex: erro 504 do Vercel)
    const rawBody = await response.text();
    let data: AiResponse | null = null;

    if (rawBody) {
      try {
        data = JSON.parse(rawBody) as AiResponse;
      } catch (e) {
        console.error("Falha ao fazer parse do JSON da API:", e, rawBody);
        // Se falhar o parse, tratamos como null para cair no erro abaixo
        data = null;
      }
    }

    if (!response.ok || !data?.success) {
        const errorMsg = data?.error || `Erro na API de IA (${response.status}): ${response.statusText}`;
        throw new Error(errorMsg);
    }

    return data.response.trim();

  } catch (error: any) {
    console.error("Falha na conexão com IA:", error);
    throw new Error(error.message || "Não foi possível gerar a resposta da IA. Tente novamente mais tarde.");
  }
}
