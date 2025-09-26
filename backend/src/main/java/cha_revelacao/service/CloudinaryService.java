package cha_revelacao.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import cha_revelacao.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload de um arquivo (imagem ou vídeo) para o Cloudinary
     * @param file Arquivo a ser enviado
     * @param resourceType "image" ou "video"
     * @return URL do arquivo no Cloudinary
     */
    public String uploadFile(MultipartFile file, String resourceType) {
        try {
            if (file.isEmpty()) {
                throw new BusinessException("Não é possível fazer upload de um arquivo vazio");
            }
            
            String publicId = "memuvie/" + UUID.randomUUID().toString();
            
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", resourceType,
                    "overwrite", true
                )
            );
            
            return (String) uploadResult.get("secure_url");
        } catch (IOException ex) {
            throw new BusinessException("Falha ao fazer upload para o Cloudinary: " + ex.getMessage());
        }
    }

    /**
     * Upload de uma imagem para o Cloudinary
     * @param file Arquivo de imagem
     * @return URL da imagem no Cloudinary
     */
    public String uploadImage(MultipartFile file) {
        return uploadFile(file, "image");
    }

    /**
     * Upload de um vídeo para o Cloudinary
     * @param file Arquivo de vídeo
     * @return URL do vídeo no Cloudinary
     */
    public String uploadVideo(MultipartFile file) {
        return uploadFile(file, "video");
    }

    /**
     * Upload de uma imagem codificada em Base64 para o Cloudinary
     * @param base64Image String de imagem em Base64
     * @return URL da imagem no Cloudinary
     */
    public String uploadBase64Image(String base64Image) {
        try {
            if (base64Image == null || base64Image.isEmpty()) {
                throw new BusinessException("Não é possível fazer upload de uma imagem Base64 vazia");
            }
            
            // Remover o prefixo "data:image/jpeg;base64," se houver
            String imageData = base64Image;
            if (base64Image.contains(",")) {
                imageData = base64Image.split(",")[1];
            }
            
            String publicId = "memuvie/" + UUID.randomUUID().toString();
            
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                "data:image/jpeg;base64," + imageData,
                ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "image",
                    "overwrite", true
                )
            );
            
            return (String) uploadResult.get("secure_url");
        } catch (IOException ex) {
            throw new BusinessException("Falha ao fazer upload para o Cloudinary: " + ex.getMessage());
        }
    }

    /**
     * Exclui um arquivo do Cloudinary
     * @param publicId ID público do arquivo (extraído da URL)
     * @param resourceType "image" ou "video"
     * @return Resultado da operação de exclusão
     */
    public Map<?, ?> deleteFile(String publicId, String resourceType) {
        try {
            return cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap("resource_type", resourceType)
            );
        } catch (IOException ex) {
            throw new BusinessException("Falha ao excluir arquivo do Cloudinary: " + ex.getMessage());
        }
    }

    /**
     * Extrai o ID público do Cloudinary a partir da URL
     * @param cloudinaryUrl URL do Cloudinary
     * @return ID público
     */
    public String extractPublicIdFromUrl(String cloudinaryUrl) {
        if (cloudinaryUrl == null || cloudinaryUrl.isEmpty()) {
            return null;
        }
        
        // Formato de URL do Cloudinary: https://res.cloudinary.com/cloud-name/image|video/upload/v1234567890/public-id
        try {
            String[] parts = cloudinaryUrl.split("/upload/");
            if (parts.length < 2) return null;
            
            String publicIdWithVersion = parts[1];
            // Remover possíveis parâmetros de URL
            if (publicIdWithVersion.contains("?")) {
                publicIdWithVersion = publicIdWithVersion.substring(0, publicIdWithVersion.indexOf("?"));
            }
            
            // Se tem versão (v12345678), remova
            if (publicIdWithVersion.contains("/")) {
                String[] versionParts = publicIdWithVersion.split("/", 2);
                if (versionParts.length > 1 && versionParts[0].startsWith("v")) {
                    return versionParts[1];
                }
            }
            
            return publicIdWithVersion;
        } catch (Exception e) {
            return null;
        }
    }
}