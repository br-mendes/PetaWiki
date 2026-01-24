
/**
 * Utilitário para processamento de imagens no client-side.
 */

export const compressImage = async (file: File, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular novas dimensões mantendo proporção
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Falha ao criar contexto do canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Verifica se o arquivo original suporta transparência
        const isTransparentType = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif';
        
        // Se suportar transparência, usamos PNG para garantir a preservação do fundo transparente.
        // Nota: image/png ignora o parâmetro de qualidade no toDataURL, a compressão vem do redimensionamento.
        // Se o original for JPG, usamos image/jpeg com compressão de qualidade.
        const outputType = isTransparentType ? 'image/png' : 'image/jpeg';
        
        // Converter para Base64
        const compressedBase64 = canvas.toDataURL(outputType, quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
