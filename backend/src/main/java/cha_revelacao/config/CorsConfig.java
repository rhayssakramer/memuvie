package cha_revelacao.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Value("${app.frontend.url:https://memuvie-frontend.onrender.com}")
    private String frontendUrl;

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciais
        config.setAllowCredentials(true);
        
        // Permitir requisições do frontend Angular - Desenvolvimento e Produção
        config.addAllowedOrigin("http://localhost:4200"); // Desenvolvimento local
        config.addAllowedOrigin("https://memuvie-frontend.onrender.com"); // Produção Render
        config.addAllowedOrigin(frontendUrl); // URL configurável via properties
        
        // Permitir patterns para subdomínios do Render
        config.addAllowedOriginPattern("https://*.onrender.com");
        config.addAllowedOriginPattern("http://localhost:*");
        
        // Permitir todos os métodos HTTP necessários
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS");
        config.addAllowedMethod("PATCH");
        
        // Permitir todos os headers
        config.addAllowedHeader("*");
        
        // Expor headers necessários para autenticação
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        config.addExposedHeader("Content-Length");
        config.addExposedHeader("X-Requested-With");
        
        // Configurar cache do preflight (OPTIONS)
        config.setMaxAge(3600L);
        
        // Aplicar esta configuração a todos os endpoints da API
        source.registerCorsConfiguration("/api/**", config);
        
        return new CorsFilter(source);
    }
}