package com.mvecommerce.service;

import com.mvecommerce.dto.AuthResponse;
import com.mvecommerce.dto.LoginRequest;
import com.mvecommerce.dto.RegisterRequest;
import com.mvecommerce.dto.UserDTO;
import com.mvecommerce.entity.User;
import com.mvecommerce.exception.BadRequestException;
import com.mvecommerce.exception.UnauthorizedException;
import com.mvecommerce.repository.UserRepository;
import com.mvecommerce.security.JwtProvider;
import com.mvecommerce.security.SecurityUtil;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final SecurityUtil securityUtil;

    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .phone(registerRequest.getPhone())
                .role(User.UserRole.CUSTOMER)
                .isActive(true)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest loginRequest) {
        // Authenticate - only catch auth failures here
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );
        } catch (Exception e) {
            log.error("Authentication failed for {}: {}", loginRequest.getEmail(), e.getMessage());
            throw new UnauthorizedException("Invalid email or password");
        }

        // These steps should NOT be masked by the auth catch block
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String token = jwtProvider.generateToken(loginRequest.getEmail());
        String refreshToken = jwtProvider.generateRefreshToken(loginRequest.getEmail());

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userDTO)
                .message("Login successful")
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtProvider.validateToken(refreshToken)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String email = jwtProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String newToken = jwtProvider.generateToken(email);

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        return AuthResponse.builder()
                .token(newToken)
                .user(userDTO)
                .message("Token refreshed successfully")
                .build();
    }

    public UserDTO getCurrentUser() {
        String email = securityUtil.getCurrentUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        return modelMapper.map(user, UserDTO.class);
    }
}
