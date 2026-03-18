# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for the MVE Commerce application.

## Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (top-left dropdown)
3. Search for "OAuth 2.0" in the search bar
4. Click on "OAuth consent screen"

### 2. Configure OAuth Consent Screen
1. Choose **External** user type
2. Fill in the required fields:
   - **App name**: MVE Commerce
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
3. Add scopes: `email`, `profile`
4. Add test users (your email)
5. Save and continue

### 3. Create OAuth Credentials
1. Go to **Credentials** section (left sidebar)
2. Click **Create Credentials** → **OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/`
   - `http://localhost:3000/login`
5. Copy the **Client ID**

### 4. Frontend Setup
1. Install Google OAuth library:
   ```bash
   npm install @react-oauth/google
   ```

2. Add to your `.env` file:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id_here
   ```

3. Update `src/index.js`:
   ```javascript
   import { GoogleOAuthProvider } from '@react-oauth/google';
   
   root.render(
     <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
       <App />
     </GoogleOAuthProvider>
   );
   ```

4. Update `src/utils/oauthService.js`:
   ```javascript
   import { useGoogleLogin } from '@react-oauth/google';
   
   export const handleGoogleLogin = useGoogleLogin({
     onSuccess: async (codeResponse) => {
       // Send codeResponse.access_token to backend
       await loginWithGoogle(codeResponse.access_token);
     },
     flow: 'implicit',
   });
   ```

### 5. Backend Setup
Add endpoint in backend:
```java
@PostMapping("/auth/google-login")
public ResponseEntity<AuthResponse> googleLogin(@RequestBody GoogleLoginRequest request) {
    // Verify token with Google API
    // Create or get user by email
    // Generate JWT token
    return ResponseEntity.ok(authResponse);
}
```

---

## GitHub OAuth Setup

### 1. Register OAuth Application
1. Go to GitHub → Settings → [Developer settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the details:
   - **Application name**: MVE Commerce
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Save and copy:
   - **Client ID**
   - **Client Secret** (generate if needed)

### 2. Frontend Setup
1. Add to `.env` file:
   ```
   REACT_APP_GITHUB_CLIENT_ID=your_client_id_here
   REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
   ```

2. Update `src/utils/oauthService.js`:
   ```javascript
   export const handleGitHubLogin = () => {
     const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
     const redirectUri = process.env.REACT_APP_GITHUB_REDIRECT_URI;
     window.location.href = 
       `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
   };
   ```

3. Create callback handler component `src/pages/auth/GitHubCallback.js`:
   ```javascript
   const GitHubCallback = () => {
     const navigate = useNavigate();
     
     useEffect(() => {
       const code = new URLSearchParams(window.location.search).get('code');
       if (code) {
         loginWithGitHub(code);
       }
     }, []);
     
     return <Spinner />; // Loading state
   };
   ```

4. Add route in `src/App.js`:
   ```javascript
   <Route path="/auth/github/callback" element={<GitHubCallback />} />
   ```

### 3. Backend Setup
Add endpoints:
```java
@PostMapping("/auth/github-callback")
public ResponseEntity<AuthResponse> githubCallback(@RequestBody GithubCallbackRequest request) {
    // Exchange code for access token with GitHub API
    // Get user info from GitHub
    // Create or get user
    // Generate JWT token
    return ResponseEntity.ok(authResponse);
}
```

---

## Backend Implementation Example

### User Entity Update
```java
@Entity
public class User {
    // ... existing fields ...
    
    @Column(name = "google_id")
    private String googleId;
    
    @Column(name = "github_id")
    private String githubId;
    
    @Column(name = "oauth_provider")
    private String oauthProvider; // GOOGLE, GITHUB, LOCAL
}
```

### OAuth Service
```java
@Service
public class OAuthService {
    
    public User authenticateWithGoogle(String token) {
        // Verify token with Google API
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
            .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
            .build();
        
        GoogleIdToken idToken = verifier.verify(token);
        GoogleIdToken.Payload payload = idToken.getPayload();
        
        String userId = payload.getSubject();
        String email = payload.getEmail();
        
        User user = userRepository.findByEmail(email)
            .orElse(new User());
        
        user.setEmail(email);
        user.setGoogleId(userId);
        user.setOauthProvider("GOOGLE");
        
        return userRepository.save(user);
    }
}
```

---

## Production Deployment

### Update URLs for Production:
1. **Google OAuth**: Add production domain to authorized URIs
2. **GitHub OAuth**: Update callback URL to production domain
3. **Environment variables**: Update to production values

Example for AWS/Heroku:
```
REACT_APP_GOOGLE_CLIENT_ID=prod_client_id
REACT_APP_GITHUB_CLIENT_ID=prod_client_id
REACT_APP_GITHUB_REDIRECT_URI=https://yourdomain.com/auth/github/callback
```

---

## Testing

### Test OAuth Locally:
1. Start frontend: `npm start`
2. Click "Google" or "GitHub" button
3. You should be redirected to the OAuth provider
4. After authorization, redirect back to your app
5. Check browser console for errors
6. Verify JWT token is stored in localStorage

### Troubleshooting:
- **Redirect URI mismatch**: Ensure URIs match exactly in OAuth settings
- **CORS errors**: Check backend CORS configuration
- **Token verification failed**: Verify client IDs in environment variables
- **User not found**: Check email retrieval from OAuth provider

---

## Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [Java JWT Library](https://github.com/jwtk/jjwt)

---

## Next Steps

1. Implement Google OAuth (follow steps above)
2. Implement GitHub OAuth (follow steps above)
3. Test in development
4. Configure for production
5. Update user model with OAuth provider info
6. Create user profile completion flow (for additional info like phone, address)
