package cha_revelacao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciais
        config.setAllowCredentials(true);
        
        // Permitir requisições do frontend Angular
        config.addAllowedOrigin("http://localhost:4200"); // Desenvolvimento local
        config.addAllowedOrigin("https://memuvie.vercel.app"); // Frontend no Vercel - Domínio Principal
        config.addAllowedOrigin("https://memuvie-git-main-rhayss-kramers-projects.vercel.app"); // Preview branch
        config.addAllowedOrigin("https://memuvie-poy49otso-rhayss-kramers-projects.vercel.app"); // Deploy específico
        config.addAllowedOriginPattern("https://memuvie*.vercel.app"); // Wildcard para deploys do Vercel
        config.addAllowedOrigin("https://memuvie.com.br"); // Produção (se houver um domínio específico)
        
        // Permitir todos os métodos HTTP
        config.addAllowedMethod("*");
        
        // Permitir todos os headers
        config.addAllowedHeader("*");
        
        // Expor headers necessários para autenticação
        config.addExposedHeader("Authorization");
        config.addExposedHeader("Content-Type");
        
        // Aplicar esta configuração a todos os endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}