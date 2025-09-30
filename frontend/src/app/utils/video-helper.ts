/**
 * Utilitário para ajudar com URLs de vídeo do Cloudinary
 */

/**
 * Formata uma URL do Cloudinary para garantir que os vídeos sejam exibidos corretamente
 * @param url URL original do Cloudinary
 * @returns URL formatada
 */
export function formatCloudinaryUrl(url: string | null): string | null {
  if (!url) return null;

  // CORREÇÃO DE EMERGÊNCIA: Apenas retorna a URL original para restaurar o funcionamento
  // Mais tarde podemos implementar melhorias de streaming
  return url;

  /* Comentando o código que estava causando problemas:
  // Verifica se é uma URL do Cloudinary
  if (url.includes('cloudinary.com')) {
    // Adiciona parâmetros para melhor streaming de vídeo se necessário
    if (url.includes('/video/upload/')) {
      // Verifica se a URL já tem parâmetros
      const hasParams = url.includes('?');

      // Adiciona parâmetros para streaming adaptativo se for um vídeo
      return `${url}${hasParams ? '&' : '?'}resource_type=video`;
    }
  }

  // Retorna a URL original se não precisar de alterações
  return url;
  */
}
