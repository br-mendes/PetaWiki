
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
  
  // Combinação simples de System + User para o modelo
  const fullPrompt = `${systemInstruction}\n\n${userPrompt}`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3', // Modelo atualizado conforme solicitação
        prompt: fullPrompt,
        options: {
          temperature: temperature,
        }
      })
    });

    const data: AiResponse = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.error || `Erro na API de IA: ${response.statusText}`);
    }

    return data.response.trim();

  } catch (error: any) {
    console.error("Falha na conexão com IA:", error);
    throw new Error(error.message || "Não foi possível gerar a resposta da IA. Tente novamente mais tarde.");
  }
}
