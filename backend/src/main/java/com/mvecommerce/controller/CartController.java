package com.mvecommerce.controller;

import com.mvecommerce.dto.CartItemDTO;
import com.mvecommerce.dto.AddToCartRequest;
import com.mvecommerce.service.CartService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@AllArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@PreAuthorize("hasRole('CUSTOMER')")
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartItemDTO> addToCart(@RequestBody AddToCartRequest request) {
        CartItemDTO cartItem = cartService.addToCart(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartItem);
    }

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart() {
        List<CartItemDTO> cartItems = cartService.getCart();
        return ResponseEntity.ok(cartItems);
    }

    @DeleteMapping("/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        CartItemDTO cartItem = cartService.updateCartItem(cartItemId, quantity);
        return ResponseEntity.ok(cartItem);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
