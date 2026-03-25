package com.mvecommerce.config;

import com.mvecommerce.entity.Category;
import com.mvecommerce.entity.Product;
import com.mvecommerce.entity.User;
import com.mvecommerce.repository.CategoryRepository;
import com.mvecommerce.repository.ProductRepository;
import com.mvecommerce.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@AllArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        // Fix cart_items schema: drop cart_id NOT NULL constraint if it exists
        // The CartItem entity uses user_id directly, not cart_id
        try {
            entityManager.createNativeQuery(
                "ALTER TABLE cart_items ALTER COLUMN cart_id DROP NOT NULL"
            ).executeUpdate();
            log.info("Dropped NOT NULL constraint on cart_items.cart_id");
        } catch (Exception e) {
            log.debug("cart_items.cart_id constraint already fixed or column doesn't exist");
        }

        // Fix addresses table: drop NOT NULL constraints on columns from old schema
        // that don't exist in the Address entity (full_name, street, is_active)
        fixColumnConstraint("addresses", "full_name");
        fixColumnConstraint("addresses", "street");
        fixColumnConstraint("addresses", "is_active");

        // Fix orders table: drop NOT NULL constraints on columns from old schema
        fixColumnConstraint("orders", "total_items");

        // Fix order_items table: drop NOT NULL constraints on columns from old schema
        fixColumnConstraint("order_items", "product_name");
        fixColumnConstraint("order_items", "price");

        // Create default admin if not exists
        if (!userRepository.existsByEmail("admin@mvecommerce.com")) {
            User admin = User.builder()
                    .email("admin@mvecommerce.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .phone("0000000000")
                    .role(User.UserRole.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@mvecommerce.com / admin123");
        } else {
            log.info("Admin user already exists");
            // Ensure default admin remains usable in local/dev environments.
            userRepository.findByEmail("admin@mvecommerce.com").ifPresent(existingAdmin -> {
                boolean passwordMatches = passwordEncoder.matches("admin123", existingAdmin.getPassword());
                boolean isInactive = Boolean.FALSE.equals(existingAdmin.getIsActive());

                if (!passwordMatches || isInactive) {
                    existingAdmin.setPassword(passwordEncoder.encode("admin123"));
                    existingAdmin.setIsActive(true);
                    userRepository.save(existingAdmin);
                    log.warn("Default admin credentials were reset to admin@mvecommerce.com / admin123");
                }
            });
        }

        ensureGrainsCatalog();
    }

    private void fixColumnConstraint(String table, String column) {
        try {
            entityManager.createNativeQuery(
                "ALTER TABLE " + table + " ALTER COLUMN " + column + " DROP NOT NULL"
            ).executeUpdate();
            log.info("Dropped NOT NULL constraint on {}.{}", table, column);
        } catch (Exception e) {
            log.debug("{}.{} constraint already fixed or column doesn't exist", table, column);
        }
    }

    private void ensureGrainsCatalog() {
        Category grainsCategory = categoryRepository.findByNameIgnoreCase("Grains")
                .orElseGet(() -> {
                    Category created = Category.builder()
                            .name("Grains")
                            .description("Daily essentials including rice, wheat, millets and cereals")
                            .imageUrl("/sketches/cat-dals.svg")
                            .isActive(true)
                            .build();
                    log.info("Created default category: Grains");
                    return categoryRepository.save(created);
                });

        List<ProductSeed> grainProducts = List.of(
                new ProductSeed("Basmati Rice", "Premium long grain basmati rice, 5kg bag", "/sketches/toor-dal.svg", 12.99, 300),
                new ProductSeed("Whole Wheat", "Clean whole wheat grains for flour milling, 5kg bag", "/sketches/chana-dal.svg", 8.49, 320),
                new ProductSeed("Pearl Millet (Bajra)", "Traditional pearl millet high in iron, 1kg", "/sketches/urad-dal.svg", 3.49, 260),
                new ProductSeed("Finger Millet (Ragi)", "Calcium-rich ragi for healthy meals, 1kg", "/sketches/masoor-dal.svg", 3.79, 250),
                new ProductSeed("Sorghum (Jowar)", "Wholesome sorghum grain for rotis and porridge, 1kg", "/sketches/toor-dal.svg", 3.69, 240),
                new ProductSeed("Brown Rice", "Whole grain brown rice rich in fiber, 2kg bag", "/sketches/masoor-dal.svg", 6.99, 260),
                new ProductSeed("Foxtail Millet", "Gluten-free foxtail millet, 1kg", "/sketches/lobia.svg", 5.49, 210)
        );

        int added = 0;
        for (ProductSeed seed : grainProducts) {
            boolean exists = productRepository.existsByNameAndCategoryId(seed.name, grainsCategory.getId());
            if (exists) {
                continue;
            }

            Product product = Product.builder()
                    .name(seed.name)
                    .description(seed.description)
                    .price(BigDecimal.valueOf(seed.price))
                    .stock(seed.stock)
                    .imageUrl(seed.imageUrl)
                    .discount(BigDecimal.ZERO)
                    .category(grainsCategory)
                    .isActive(true)
                    .build();

            productRepository.save(product);
            added++;
        }

        if (added > 0) {
            log.info("Added {} default grain products", added);
        }
    }

    private record ProductSeed(String name, String description, String imageUrl, double price, int stock) {
    }
}
