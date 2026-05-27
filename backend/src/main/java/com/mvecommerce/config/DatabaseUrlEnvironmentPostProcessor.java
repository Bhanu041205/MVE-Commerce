package com.mvecommerce.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes Neon/Render {@code DATABASE_URL} values for Spring Boot.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE = "databaseUrlNormalizer";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String databaseUrl = environment.getProperty("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        Map<String, Object> properties = new HashMap<>();
        String jdbcUrl = DatabaseUrlNormalizer.toJdbcUrl(databaseUrl.trim());
        
        // Clean the JDBC URL (removes channel_binding and other problematic params)
        String cleanUrl = DatabaseUrlNormalizer.cleanJdbcUrl(jdbcUrl);
        properties.put("spring.datasource.url", cleanUrl);
        
        // Try to extract credentials if embedded in URL (for compatibility)
        DatabaseUrlNormalizer.parseCredentials(cleanUrl).ifPresent(credentials -> {
            properties.put("spring.datasource.username", credentials.username());
            properties.put("spring.datasource.password", credentials.password());
        });

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE, properties));
    }
}
