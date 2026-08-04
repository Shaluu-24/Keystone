package com.zidio.keystone.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {

        Server server = new Server();
        server.setUrl("https://keystone-production-3393.up.railway.app");
        server.setDescription("Railway Production Server");

        return new OpenAPI()
                .addServersItem(server)
                .info(new Info()
                        .title("Keystone API")
                        .version("v1")
                        .description("Field Service Management Platform API"));
    }
}