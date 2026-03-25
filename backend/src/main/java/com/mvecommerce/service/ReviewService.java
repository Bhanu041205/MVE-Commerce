package com.mvecommerce.service;

import com.mvecommerce.dto.CreateReviewRequest;
import com.mvecommerce.dto.ReviewDTO;
import com.mvecommerce.entity.Product;
import com.mvecommerce.entity.Review;
import com.mvecommerce.entity.User;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.ResourceNotFoundException;
import com.mvecommerce.repository.OrderItemRepository;
import com.mvecommerce.repository.ProductRepository;
import com.mvecommerce.repository.ReviewRepository;
import com.mvecommerce.repository.UserRepository;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final SecurityUtil securityUtil;

    @Transactional(readOnly = true)
    public List<ReviewDTO> getProductReviews(Long productId) {
        ensureProductExists(productId);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReviewDTO getMyReviewForProduct(Long productId) {
        Long userId = requireCurrentUserId();
        ensureProductExists(productId);

        Review review = reviewRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        return toDTO(review);
    }

    public ReviewDTO createReview(Long productId, CreateReviewRequest request) {
        Long userId = requireCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!orderItemRepository.hasDeliveredPurchase(userId, productId)) {
            throw new BadRequestException("You can review only delivered products you purchased");
        }

        reviewRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(existing -> {
                    throw new BadRequestException("You have already reviewed this product");
                });

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(normalizeComment(request.getComment()))
                .build();

        Review savedReview = reviewRepository.save(review);
        recalculateProductRating(product);
        return toDTO(savedReview);
    }

    public ReviewDTO updateReview(Long reviewId, CreateReviewRequest request) {
        Long userId = requireCurrentUserId();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only update your own review");
        }

        review.setRating(request.getRating());
        review.setComment(normalizeComment(request.getComment()));

        Review updated = reviewRepository.save(review);
        recalculateProductRating(updated.getProduct());
        return toDTO(updated);
    }

    public void deleteReview(Long reviewId) {
        Long userId = requireCurrentUserId();
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own review");
        }

        Product product = review.getProduct();
        reviewRepository.delete(review);
        recalculateProductRating(product);
    }

    private void recalculateProductRating(Product product) {
        Double avg = reviewRepository.getAverageRatingForProduct(product.getId());
        int count = reviewRepository.countByProductId(product.getId());

        BigDecimal averageRating = BigDecimal.valueOf(avg == null ? 0.0 : avg)
                .setScale(2, RoundingMode.HALF_UP);

        product.setRating(averageRating);
        product.setReviewCount(count);
        productRepository.save(product);
    }

    private Long requireCurrentUserId() {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            throw new BadRequestException("Unauthorized access");
        }
        return userId;
    }

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }
    }

    private String normalizeComment(String comment) {
        return StringUtils.hasText(comment) ? comment.trim() : null;
    }

    private ReviewDTO toDTO(Review review) {
        String fullName = (StringUtils.hasText(review.getUser().getFirstName())
                || StringUtils.hasText(review.getUser().getLastName()))
                ? ((review.getUser().getFirstName() == null ? "" : review.getUser().getFirstName()) + " "
                + (review.getUser().getLastName() == null ? "" : review.getUser().getLastName())).trim()
                : review.getUser().getEmail();

        return ReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .userName(fullName)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
