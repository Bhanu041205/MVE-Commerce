package com.mvecommerce.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes Neon/Render {@code DATABASE_URL} values for Spring Boot.
 * Accepts {@code postgresql://} or {@code postgres://} and converts to {@code jdbc:postgresql://}.
 * When credentials are embedded in the URL, they are applied to datasource username/password.
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
        String jdbcUrl = toJdbcUrl(databaseUrl.trim());
        properties.put("spring.datasource.url", jdbcUrl);

        parseCredentials(jdbcUrl).ifPresent(credentials -> {
            properties.put("spring.datasource.username", credentials.username());
            properties.put("spring.datasource.password", credentials.password());
        });

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE, properties));
    }

    static String toJdbcUrl(String url) {
        if (url.startsWith("jdbc:postgresql://") || url.startsWith("jdbc:postgres://")) {
            return url.startsWith("jdbc:postgres://")
                    ? "jdbc:postgresql://" + url.substring("jdbc:postgres://".length())
                    : url;
        }
        if (url.startsWith("postgresql://")) {
            return "jdbc:" + url;
        }
        if (url.startsWith("postgres://")) {
            return "jdbc:postgresql://" + url.substring("postgres://".length());
        }
        return url;
    }

    private static java.util.Optional<Credentials> parseCredentials(String jdbcUrl) {
        try {
            String withoutJdbc = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring("jdbc:".length()) : jdbcUrl;
            URI uri = URI.create(withoutJdbc.replaceFirst("^postgresql:", "http"));
            String userInfo = uri.getUserInfo();
            if (userInfo == null || userInfo.isBlank() || !userInfo.contains(":")) {
                return java.util.Optional.empty();
            }
            int separator = userInfo.indexOf(':');
            String username = userInfo.substring(0, separator);
            String password = userInfo.substring(separator + 1);
            return java.util.Optional.of(new Credentials(username, password));
        } catch (Exception ignored) {
            return java.util.Optional.empty();
        }
    }

    private record Credentials(String username, String password) {
    }
}
