package cha_revelacao.controller;

import cha_revelacao.dto.response.ApiResponse;
import cha_revelacao.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class FileController {
    
    private final FileStorageService fileStorageService;
    
    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    
    @PostMapping("/file")
    public ResponseEntity<ApiResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        if (authentication == null) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Não autenticado"));
        }
        
        String fileUrl = fileStorageService.storeFile(file);
        
        Map<String, String> data = new HashMap<>();
        data.put("fileUrl", fileUrl);
        
        return ResponseEntity.ok(new ApiResponse(true, "Arquivo enviado com sucesso", data));
    }
    
    @PostMapping("/base64")
    public ResponseEntity<ApiResponse> uploadBase64(
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        
        if (authentication == null) {
            return ResponseEntity.status(401).body(new ApiResponse(false, "Não autenticado"));
        }
        
        String base64Data = payload.get("base64Data");
        String fileName = payload.get("fileName");
        
        if (base64Data == null || base64Data.isEmpty()) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Dados Base64 não fornecidos"));
        }
        
        String fileUrl = fileStorageService.storeBase64Image(base64Data, fileName);
        
        Map<String, String> data = new HashMap<>();
        data.put("fileUrl", fileUrl);
        
        return ResponseEntity.ok(new ApiResponse(true, "Imagem enviada com sucesso", data));
    }
}