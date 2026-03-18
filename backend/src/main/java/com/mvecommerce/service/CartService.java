package com.mvecommerce.service;

import com.mvecommerce.dto.CartItemDTO;
import com.mvecommerce.dto.AddToCartRequest;
import com.mvecommerce.entity.CartItem;
import com.mvecommerce.entity.Product;
import com.mvecommerce.entity.User;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.CartItemRepository;
import com.mvecommerce.repository.ProductRepository;
import com.mvecommerce.repository.UserRepository;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final ModelMapper modelMapper;

    public CartItemDTO addToCart(AddToCartRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getIsActive()) {
            throw new BadRequestException("Product is not available");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock available");
        }

        CartItem existingItem = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId())
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
            return convertToDTO(existingItem);
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity())
                .build();

        CartItem savedCartItem = cartItemRepository.save(cartItem);
        return convertToDTO(savedCartItem);
    }

    @Transactional(readOnly = true)
    public List<CartItemDTO> getCart() {
        Long userId = securityUtil.getCurrentUserId();
        return cartItemRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void removeFromCart(Long cartItemId) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        cartItemRepository.delete(cartItem);
    }

    public CartItemDTO updateCartItem(Long cartItemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        Long userId = securityUtil.getCurrentUserId();
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access");
        }

        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than 0");
        }

        if (cartItem.getProduct().getStock() < quantity) {
            throw new BadRequestException("Insufficient stock available");
        }

        cartItem.setQuantity(quantity);
        CartItem updatedCartItem = cartItemRepository.save(cartItem);
        return convertToDTO(updatedCartItem);
    }

    public void clearCart() {
        Long userId = securityUtil.getCurrentUserId();
        cartItemRepository.deleteByUserId(userId);
    }

    private CartItemDTO convertToDTO(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setQuantity(cartItem.getQuantity());
        
        if (cartItem.getProduct() != null) {
            dto.setProduct(modelMapper.map(cartItem.getProduct(), 
                    com.mvecommerce.dto.ProductDTO.class));
        }
        
        return dto;
    }
}
