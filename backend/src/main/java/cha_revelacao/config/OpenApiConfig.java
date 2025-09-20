package cha_revelacao.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    private static final Logger log = LoggerFactory.getLogger(OpenApiConfig.class);
    private static final String SECURITY_SCHEME_NAME = "bearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        try {
            log.info("Inicializando OpenAPI specification");
            OpenAPI openAPI = new OpenAPI()
                    .info(new Info()
                            .title("API Chá Revelação")
                            .version("1.0.0")
                            .description("API para gerenciamento de usuários, eventos e votos em um sistema de chá revelação (palpite do sexo do bebê).")
                            .contact(new Contact().name("Equipe").email("suporte@revelacao.local"))
                            .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")))
                    .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                    .components(new Components().addSecuritySchemes(SECURITY_SCHEME_NAME,
                            new SecurityScheme()
                                    .name(SECURITY_SCHEME_NAME)
                                    .type(SecurityScheme.Type.HTTP)
                                    .scheme("bearer")
                                    .bearerFormat("JWT")
                                    .description("Informe o token JWT obtido no login. Ex: Bearer eyJhbGciOi...")));
            log.info("OpenAPI carregado com sucesso");
            return openAPI;
        } catch (Exception ex) {
            log.error("Falha ao montar OpenAPI: {}", ex.getMessage(), ex);
            // Fallback mínimo para evitar 500 e permitir investigação
            return new OpenAPI().info(new Info().title("API (Fallback)").version("unknown"));
        }
    }
}
