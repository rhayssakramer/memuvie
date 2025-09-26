// Execute este arquivo no console do navegador para verificar o conteúdo do localStorage
try {
  const posts = JSON.parse(localStorage.getItem('posts') || '[]');
  console.log('Número de posts:', posts.length);

  if (posts.length > 0) {
    console.log('Primeiro post:', posts[0]);

    // Verificar URLs de imagens
    posts.forEach((post, index) => {
      if (post.photo) {
        console.log(`Post ${index} - URL da foto:`, post.photo);
        // Tentar carregar a imagem para testar
        const img = new Image();
        img.onload = () => console.log(`Imagem ${index} carregada com sucesso`);
        img.onerror = () => console.error(`Erro ao carregar imagem ${index}`);
        img.src = post.photo;
      }
    });
  } else {
    console.log('Nenhum post encontrado no localStorage');
  }
} catch (error) {
  console.error('Erro ao analisar posts:', error);
}
