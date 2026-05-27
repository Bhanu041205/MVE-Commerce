package com.mvecommerce.config;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Converts Render/Neon {@code DATABASE_URL} into Spring datasource properties.
 */
public final class DatabaseUrlNormalizer {

    private DatabaseUrlNormalizer() {
    }

    public static void applyToSystemProperties() {
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl == null || databaseUrl.isBlank()) {
            databaseUrl = System.getProperty("DATABASE_URL");
        }
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return;
        }

        String jdbcUrl = toJdbcUrl(databaseUrl.trim());
        
        // Clean the JDBC URL (removes channel_binding and other problematic params)
        String cleanUrl = cleanJdbcUrl(jdbcUrl);
        System.setProperty("spring.datasource.url", cleanUrl);
        
        // Try to extract credentials if embedded in URL (for compatibility)
        parseCredentials(cleanUrl).ifPresent(credentials -> {
            System.setProperty("spring.datasource.username", credentials.username());
            System.setProperty("spring.datasource.password", credentials.password());
        });
    }

    public static String toJdbcUrl(String url) {
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

    /**
     * Strips credentials and problematic parameters from JDBC URL.
     * Credentials should be set separately via username/password properties.
     */
    public static String cleanJdbcUrl(String jdbcUrl) {
        try {
            if (!jdbcUrl.startsWith("jdbc:postgresql://")) {
                return jdbcUrl;
            }

            // Remove channel_binding parameter which causes driver issues
            String cleaned = jdbcUrl.replaceAll("\\&?channel_binding=[^\\&]*", "");
            
            // Clean up any dangling ? or &
            cleaned = cleaned.replaceAll("\\?\\s*$", "");
            cleaned = cleaned.replaceAll("\\&\\s*$", "");
            
            return cleaned;
        } catch (Exception e) {
            // If anything fails, return original URL
            return jdbcUrl;
        }
    }

    static Optional<Credentials> parseCredentials(String jdbcUrl) {
        try {
            String withoutJdbc = jdbcUrl.startsWith("jdbc:") ? jdbcUrl.substring("jdbc:".length()) : jdbcUrl;
            if (!withoutJdbc.startsWith("postgresql://")) {
                return Optional.empty();
            }

            String remainder = withoutJdbc.substring("postgresql://".length());
            int atIndex = remainder.lastIndexOf('@');
            if (atIndex <= 0) {
                return Optional.empty();
            }

            String userInfo = remainder.substring(0, atIndex);
            int colonIndex = userInfo.indexOf(':');
            if (colonIndex <= 0) {
                return Optional.empty();
            }

            String username = decode(userInfo.substring(0, colonIndex));
            String password = decode(userInfo.substring(colonIndex + 1));
            return Optional.of(new Credentials(username, password));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    record Credentials(String username, String password) {
    }
}
