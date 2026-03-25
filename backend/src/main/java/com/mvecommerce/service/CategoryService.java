package com.mvecommerce.service;

import com.mvecommerce.dto.CategoryDTO;
import com.mvecommerce.entity.Category;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.CategoryRepository;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategoriesAdmin() {
        return categoryRepository.findAll()
                .stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return modelMapper.map(category, CategoryDTO.class);
    }

    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        String normalizedName = categoryDTO.getName() != null ? categoryDTO.getName().trim() : "";
        if (normalizedName.isEmpty()) {
            throw new BadRequestException("Category name is required");
        }

        if (categoryRepository.existsByName(normalizedName)) {
            throw new BadRequestException("Category with this name already exists");
        }

        Category category = Category.builder()
                .name(normalizedName)
                .description(categoryDTO.getDescription())
                .imageUrl(categoryDTO.getImageUrl() != null && !categoryDTO.getImageUrl().isEmpty()
                        ? categoryDTO.getImageUrl()
                        : "https://via.placeholder.com/300?text=Category")
                .isActive(true)
                .build();

        Category savedCategory = categoryRepository.save(category);
        return modelMapper.map(savedCategory, CategoryDTO.class);
    }

    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        category.setName(categoryDTO.getName() != null ? categoryDTO.getName() : category.getName());
        category.setDescription(categoryDTO.getDescription() != null ? categoryDTO.getDescription() : category.getDescription());
        category.setImageUrl(categoryDTO.getImageUrl() != null ? categoryDTO.getImageUrl() : category.getImageUrl());
        category.setIsActive(categoryDTO.getIsActive() != null ? categoryDTO.getIsActive() : category.getIsActive());

        Category updatedCategory = categoryRepository.save(category);
        return modelMapper.map(updatedCategory, CategoryDTO.class);
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(category);
    }

    public void toggleCategoryActive(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
    }
}
