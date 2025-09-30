package cha_revelacao.controller;

import cha_revelacao.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file);
        Map<String, String> response = Map.of("url", url);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-video")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadVideo(file);
        Map<String, String> response = Map.of("url", url);
        return ResponseEntity.ok(response);
    }
}
