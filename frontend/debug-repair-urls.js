/**
 * Este script ajuda a verificar e reparar URLs de imagens no localStorage
 *
 * Execute este script no console do navegador para verificar as URLs
 * das imagens armazenadas e repará-las se necessário.
 */

(function() {
  console.log('🔍 Verificando URLs de imagens no localStorage...');

  try {
    // Obter posts
    const postsRaw = localStorage.getItem('posts');
    if (!postsRaw) {
      console.log('❌ Nenhum post encontrado no localStorage');
      return;
    }

    const posts = JSON.parse(postsRaw);
    console.log(`✅ ${posts.length} posts encontrados no localStorage`);

    // Verificar URLs de imagens
    let problemaFound = false;
    let problematicPhotos = 0;

    posts.forEach((post, index) => {
      console.group(`Post #${index + 1}`);
      console.log('ID:', post.id);
      console.log('Usuário:', post.userName);
      console.log('Data:', new Date(post.date).toLocaleString());

      if (post.photo) {
        console.log('URL da foto:', post.photo);

        // Verificar se a URL da foto é válida
        if (typeof post.photo !== 'string' || !post.photo.startsWith('http')) {
          console.error('❌ URL de foto inválida!');
          problemaFound = true;
          problematicPhotos++;

          // Se a foto for um objeto, tentar extrair a URL
          if (typeof post.photo === 'object' && post.photo !== null) {
            const urlFromObject = post.photo.url || post.photo.secure_url;
            if (urlFromObject && typeof urlFromObject === 'string') {
              console.log('🔧 URL encontrada no objeto:', urlFromObject);
              post.photo = urlFromObject;
              console.log('✅ URL corrigida!');
            }
          }
        }
      }

      if (post.video) {
        console.log('URL do vídeo:', post.video);

        // Verificar se a URL do vídeo é válida
        if (typeof post.video !== 'string' || !post.video.startsWith('http')) {
          console.error('❌ URL de vídeo inválida!');
          problemaFound = true;

          // Se o vídeo for um objeto, tentar extrair a URL
          if (typeof post.video === 'object' && post.video !== null) {
            const urlFromObject = post.video.url || post.video.secure_url;
            if (urlFromObject && typeof urlFromObject === 'string') {
              console.log('🔧 URL encontrada no objeto:', urlFromObject);
              post.video = urlFromObject;
              console.log('✅ URL corrigida!');
            }
          }
        }
      }

      console.groupEnd();
    });

    if (problemaFound) {
      console.log(`🔧 ${problematicPhotos} posts com problemas de URL encontrados. Salvando correções...`);
      localStorage.setItem('posts', JSON.stringify(posts));
      console.log('✅ Correções salvas! Recarregue a página para ver as alterações.');
    } else {
      console.log('✅ Todas as URLs parecem estar corretas!');
    }

  } catch (error) {
    console.error('❌ Erro ao processar posts:', error);
  }
})();
