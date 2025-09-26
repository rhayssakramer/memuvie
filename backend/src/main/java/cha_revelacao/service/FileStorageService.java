package cha_revelacao.service;

import cha_revelacao.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    
    private final CloudinaryService cloudinaryService;
    
    /**
     * Armazena um arquivo e retorna o URL do arquivo armazenado no Cloudinary.
     */
    public String storeFile(MultipartFile file) {
        try {
            // Verificar se o arquivo é válido
            if (file.isEmpty()) {
                throw new BusinessException("Não é possível armazenar um arquivo vazio");
            }
            
            String contentType = file.getContentType();
            if (contentType != null && contentType.startsWith("video/")) {
                return cloudinaryService.uploadVideo(file);
            } else {
                return cloudinaryService.uploadImage(file);
            }
        } catch (Exception ex) {
            throw new BusinessException("Erro ao armazenar o arquivo: " + ex.getMessage());
        }
    }
    
    /**
     * Armazena uma imagem codificada em Base64 e retorna o URL da imagem armazenada no Cloudinary.
     */
    public String storeBase64Image(String base64Image, String fileName) {
        try {
            // Verificar se a string Base64 é válida
            if (base64Image == null || base64Image.isEmpty()) {
                throw new BusinessException("Não é possível armazenar uma imagem Base64 vazia");
            }
            
            // Upload para o Cloudinary
            return cloudinaryService.uploadBase64Image(base64Image);
        } catch (Exception ex) {
            throw new BusinessException("Erro ao armazenar a imagem Base64: " + ex.getMessage());
        }
    }
    
    /**
     * Exclui um arquivo do Cloudinary.
     */
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return;
            }
            
            // Identificar o tipo de recurso
            String resourceType = "image";
            if (fileUrl.contains("/video/")) {
                resourceType = "video";
            }
            
            // Extrair o ID público da URL do Cloudinary
            String publicId = cloudinaryService.extractPublicIdFromUrl(fileUrl);
            
            if (publicId != null) {
                cloudinaryService.deleteFile(publicId, resourceType);
            }
        } catch (Exception ex) {
            throw new BusinessException("Erro ao excluir o arquivo: " + ex.getMessage());
        }
    }
}