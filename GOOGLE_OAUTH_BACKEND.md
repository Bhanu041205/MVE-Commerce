# Google OAuth Backend Implementation Guide

## Overview
The frontend now sends a Google ID token to the backend's `POST /auth/google-login` endpoint. The backend needs to:
1. Verify the Google token with Google's servers
2. Extract user information (email, name, etc.)
3. Create a new user if they don't exist
4. Return JWT token and user data

## Backend Implementation Steps

### 1. Add Google OAuth Dependencies (Maven - pom.xml)

```xml
<!-- Google OAuth -->
<dependency>
    <groupId>com.google.auth</groupId>
    <artifactId>google-auth-library-oauth2-http</artifactId>
    <version>1.11.0</version>
</dependency>

<!-- Or if using Spring Boot's built-in OAuth -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-client</artifactId>
</dependency>
```

### 2. Create a Google OAuth Controller Endpoint

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class GoogleAuthController {
    
    private final GoogleAuthService googleAuthService;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    
    @PostMapping("/google-login")
    public ResponseEntity<?> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        try {
            // Verify and extract user info from Google token
            GoogleUserInfo userInfo = googleAuthService.verifyGoogleToken(request.getToken());
            
            // Check if user exists
            User user = userRepository.findByEmail(userInfo.getEmail())
                .orElseGet(() -> {
                    // Create new user if doesn't exist
                    User newUser = new User();
                    newUser.setEmail(userInfo.getEmail());
                    newUser.setFirstName(userInfo.getGivenName());
                    newUser.setLastName(userInfo.getFamilyName());
                    newUser.setRole(UserRole.CUSTOMER);
                    newUser.setActive(true);
                    // Don't set password for OAuth users
                    return userRepository.save(newUser);
                });
            
            // Generate JWT token
            String token = tokenProvider.generateToken(user);
            
            return ResponseEntity.ok(new AuthResponse(
                token,
                new UserDTO(user)
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid Google token"));
        }
    }
}
```

### 3. Create Google Auth Service

```java
@Service
@RequiredArgsConstructor
public class GoogleAuthService {
    
    @Value("${google.client.id}")
    private String googleClientId;
    
    public GoogleUserInfo verifyGoogleToken(String idToken) throws GeneralSecurityException, IOException {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            new GsonFactory())
            .setAudience(Collections.singletonList(googleClientId))
            .build();
        
        GoogleIdToken idTokenObj = verifier.verify(idToken);
        
        if (idTokenObj != null) {
            Payload payload = idTokenObj.getPayload();
            
            GoogleUserInfo userInfo = new GoogleUserInfo();
            userInfo.setEmail((String) payload.get("email"));
            userInfo.setGivenName((String) payload.get("given_name"));
            userInfo.setFamilyName((String) payload.get("family_name"));
            userInfo.setProfilePicture((String) payload.get("picture"));
            userInfo.setEmailVerified((Boolean) payload.getEmailVerified());
            
            return userInfo;
        } else {
            throw new Exception("Invalid ID token");
        }
    }
}
```

### 4. Create DTOs

```java
// Google Login Request
public class GoogleLoginRequest {
    private String token; // Google ID Token
    // getters and setters
}

// Google User Info
public class GoogleUserInfo {
    private String email;
    private String givenName;
    private String familyName;
    private String profilePicture;
    private Boolean emailVerified;
    // getters and setters
}

// Auth Response
public class AuthResponse {
    private String token;
    private UserDTO user;
    
    public AuthResponse(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
    // getters and setters
}
```

### 5. Add Configuration to application.yml

```yaml
# application.yml
google:
  client:
    id: 771392493938-je3umc8cr1uc4prshlaj1fttu2gu4enn.apps.googleusercontent.com
    secret: YOUR_GOOGLE_CLIENT_SECRET (from Google Cloud Console)
```

### 6. Update Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/api/auth/google-login").permitAll() // Allow public access
                .antMatchers("/api/auth/register").permitAll()
                .antMatchers("/api/auth/login").permitAll()
                // ... other configurations
}
```

## How It Works (Frontend Flow)

1. **User clicks "Continue with Google"** on Login/Register page
2. **Google Sign-In SDK shows account chooser** with all Google accounts
3. **User selects an account** and signs in
4. **Frontend receives Google ID Token** (JWT)
5. **Frontend sends token to backend**: `POST /auth/google-login`
6. **Backend verifies token** with Google's API
7. **Backend creates/updates user** in database
8. **Backend returns JWT token + user data** to frontend
9. **Frontend stores token** and redirects to home/dashboard

## Troubleshooting

### "Invalid Client ID" Error
- Check `google.client.id` in `application.yml`
- Ensure Client ID matches the one in `.env` file

### "Sign-In Popup Blocked"
- User might have disabled popups
- Google Sign-In uses OAuth 2.0 flow which should open in same window

### Token Verification Failing
- Ensure Google Client ID is correct
- Check that token hasn't expired (Google tokens expire in 1 hour)
- Verify `google-auth-library-oauth2-http` dependency is correct version

## Testing

1. Start backend: `mvn spring-boot:run`
2. Start frontend: `npm start`
3. Go to login page
4. Click "Continue with Google"
5. Select a Google account
6. Should redirect to home page after successful login

---

**Frontend Setup**: ✅ Complete
**Backend Setup**: Needs implementation (follow above steps)
**Google Cloud Setup**: ✅ Complete (Client ID configured)

Date: February 22, 2026
