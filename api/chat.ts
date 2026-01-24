
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, systemInstruction, temperature = 0.7 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Inicializa o cliente Gemini com a chave de ambiente
    // Certifique-se de que a variável API_KEY está definida no seu ambiente Vercel (.env)
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Usa o modelo recomendado para tarefas de texto rápidas e sugestões
    const modelId = 'gemini-3-flash-preview';

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
      }
    });

    return res.status(200).json({
      success: true,
      response: response.text,
      model: modelId
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
