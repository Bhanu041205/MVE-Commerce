package com.mvecommerce.service;

import com.mvecommerce.dto.ProductDTO;
import com.mvecommerce.entity.Category;
import com.mvecommerce.entity.Product;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.CategoryRepository;
import com.mvecommerce.repository.ProductRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    // Customer Methods
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product is not available");
        }
        
        return convertToDTO(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable)
                .map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable)
                .map(this::convertToDTO);
    }

    // Admin Methods
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProductsAdmin(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public ProductDTO createProduct(ProductDTO productDTO) {
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
                .name(productDTO.getName())
                .description(productDTO.getDescription())
                .price(productDTO.getPrice())
                .stock(productDTO.getStock())
                .imageUrl(productDTO.getImageUrl() != null && !productDTO.getImageUrl().isEmpty() 
                        ? productDTO.getImageUrl() 
                        : "")
                .images(productDTO.getImages())
                .discount(productDTO.getDiscount() != null ? productDTO.getDiscount() : java.math.BigDecimal.ZERO)
                .category(category)
                .isActive(productDTO.getIsActive() != null ? productDTO.getIsActive() : true)
                .build();

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (productDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        product.setName(productDTO.getName() != null ? productDTO.getName() : product.getName());
        product.setDescription(productDTO.getDescription() != null ? productDTO.getDescription() : product.getDescription());
        product.setPrice(productDTO.getPrice() != null ? productDTO.getPrice() : product.getPrice());
        product.setStock(productDTO.getStock() != null ? productDTO.getStock() : product.getStock());
        product.setImageUrl(productDTO.getImageUrl() != null ? productDTO.getImageUrl() : product.getImageUrl());
        product.setImages(productDTO.getImages() != null ? productDTO.getImages() : product.getImages());
        product.setDiscount(productDTO.getDiscount() != null ? productDTO.getDiscount() : product.getDiscount());
        product.setIsActive(productDTO.getIsActive() != null ? productDTO.getIsActive() : product.getIsActive());

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        productRepository.delete(product);
    }

    public void toggleProductActive(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setIsActive(!product.getIsActive());
        productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getLowStockProducts(Integer threshold) {
        return productRepository.findByStockLessThan(threshold)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = modelMapper.map(product, ProductDTO.class);
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        return dto;
    }
}
