package cha_revelacao.service;

import cha_revelacao.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${upload.path}")
    private String uploadPath;
    
    /**
     * Armazena um arquivo e retorna o URL relativo do arquivo armazenado.
     */
    public String storeFile(MultipartFile file) {
        try {
            // Verificar se o arquivo é válido
            if (file.isEmpty()) {
                throw new BusinessException("Não é possível armazenar um arquivo vazio");
            }
            
            // Criar diretórios se não existirem
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            // Gerar nome de arquivo único
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            
            // Salvar o arquivo
            Path targetLocation = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation);
            
            // Retornar o caminho relativo para acesso via HTTP
            return "/uploads/memuvie/" + filename;
        } catch (IOException ex) {
            throw new BusinessException("Erro ao armazenar o arquivo: " + ex.getMessage());
        }
    }
    
    /**
     * Armazena uma imagem codificada em Base64 e retorna o URL relativo da imagem armazenada.
     */
    public String storeBase64Image(String base64Image, String fileName) {
        try {
            // Verificar se a string Base64 é válida
            if (base64Image == null || base64Image.isEmpty()) {
                throw new BusinessException("Não é possível armazenar uma imagem Base64 vazia");
            }
            
            // Remover o prefixo "data:image/jpeg;base64," se houver
            String imageData = base64Image;
            if (base64Image.contains(",")) {
                imageData = base64Image.split(",")[1];
            }
            
            // Decodificar a string Base64 para bytes
            byte[] imageBytes = java.util.Base64.getDecoder().decode(imageData);
            
            // Criar diretórios se não existirem
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            // Gerar nome de arquivo único
            String extension = ".jpg"; // Assume JPEG por padrão
            if (fileName != null && fileName.contains(".")) {
                extension = fileName.substring(fileName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            
            // Salvar o arquivo
            Path targetLocation = uploadDir.resolve(filename);
            Files.write(targetLocation, imageBytes);
            
            // Retornar o caminho relativo para acesso via HTTP
            return "/uploads/memuvie/" + filename;
        } catch (IOException ex) {
            throw new BusinessException("Erro ao armazenar a imagem Base64: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            throw new BusinessException("Dados Base64 inválidos: " + ex.getMessage());
        }
    }
    
    /**
     * Exclui um arquivo do armazenamento.
     */
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return;
            }
            
            // Extrair o nome do arquivo do URL
            String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            
            // Caminho completo do arquivo
            Path filePath = Paths.get(uploadPath).resolve(filename);
            
            // Excluir o arquivo se existir
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException ex) {
            throw new BusinessException("Erro ao excluir o arquivo: " + ex.getMessage());
        }
    }
}