
// Configuração do Ollama
// A chave foi fornecida explicitamente. Se estiver rodando localmente sem auth, ela pode ser ignorada pelo servidor,
// mas se houver um proxy (como Ngrok ou Auth Proxy), ela será usada.
const OLLAMA_API_KEY = '8058ec808e194d4db20bbe4df231948e.ISAM64WnkYNpSKinCdIVPQap';

// URL Padrão do Ollama. 
// Nota: Para funcionar no navegador, o Ollama deve ser iniciado com: OLLAMA_ORIGINS="*" ollama serve
const OLLAMA_BASE_URL = 'http://localhost:11434';
const MODEL_NAME = 'mistral'; // O usuário especificou Mistral 7B

interface AiResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

/**
 * Envia um prompt para o modelo Mistral rodando no Ollama.
 * Aplica automaticamente a formatação de instrução [INST].
 */
export async function generateAiResponse(
  systemInstruction: string, 
  userPrompt: string,
  temperature: number = 0.7
): Promise<string> {
  
  // Formatação específica para Mistral 7B Instruct para garantir obediência
  // Formato: <s>[INST] System Instruction + User Prompt [/INST]
  const fullPrompt = `<s>[INST] ${systemInstruction}\n\n${userPrompt} [/INST]`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Enviamos a chave como Bearer Token caso haja um proxy de segurança na frente do Ollama
        'Authorization': `Bearer ${OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: fullPrompt,
        stream: false, // Simplifica o tratamento no frontend (espera resposta completa)
        options: {
          temperature: temperature,
          top_p: 0.9,
          // num_ctx: 4096 // Aumentar se os documentos forem muito grandes
        }
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama Error Raw:', errorText);
        throw new Error(`Erro na API do Ollama: ${response.statusText}`);
    }

    const data: AiResponse = await response.json();
    return data.response.trim();

  } catch (error) {
    console.error("Falha na conexão com IA:", error);
    // Mensagem amigável para depuração
    throw new Error(
      "Não foi possível conectar ao Ollama. Verifique se ele está rodando (ollama serve) e se o modelo 'mistral' está baixado."
    );
  }
}
