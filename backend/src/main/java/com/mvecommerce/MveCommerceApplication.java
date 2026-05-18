package com.mvecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.mvecommerce.config.DatabaseUrlNormalizer;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class MveCommerceApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));
        DatabaseUrlNormalizer.applyToSystemProperties();
        SpringApplication.run(MveCommerceApplication.class, args);
    }
}
