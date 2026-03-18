# Authentication & Authorization Guide

## Overview
This document describes the complete authentication system for MVE Commerce, including login, registration, password reset, and social login capabilities.

---

## 📄 Pages Available

### 1. Login Page (`/login`)
Enhanced login page with:
- ✅ Email and password fields
- ✅ Show/hide password toggle
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Social login (Google & GitHub)
- ✅ Real-time form validation
- ✅ Demo credentials display
- ✅ Role-based redirection (Admin/Customer)

**Features:**
- Gradient background with modern UI
- Loading state with spinner
- Toast notifications for success/error
- Secure password handling
- Local storage persistence

**Route:** `/login`

---

### 2. Register Page (`/register`)
Enhanced registration page with:
- ✅ First name, last name, email, phone fields
- ✅ Password strength indicator (4 levels)
- ✅ Show/hide password toggle
- ✅ Phone number validation
- ✅ Password validation (min 8 chars)
- ✅ Terms & conditions acceptance
- ✅ Social signup (Google & GitHub)
- ✅ Field validation

**Features:**
- Real-time password strength feedback
- Field-by-field validation
- Auto-redirect to login on success
- User-friendly error messages
- Protected API calls

**Route:** `/register`

---

### 3. Forgot Password Page (`/forgot-password`)
Three-step password recovery process:

#### Step 1: Enter Email
- User enters email address
- Backend sends OTP to email

#### Step 2: Verify OTP
- User receives 6-digit code via email
- Enter code to verify identity

#### Step 3: Reset Password
- Set new password
- Confirm password match
- Password strength validation

**Features:**
- Multi-step form flow
- OTP verification
- Password strength requirements
- Back navigation options
- Secure token handling

**Route:** `/forgot-password`

---

## 🔐 Authentication Flow

### Login Flow
```
User enters credentials
         ↓
Frontend validates input
         ↓
Sends POST /auth/login
         ↓
Backend verifies credentials
         ↓
Returns JWT token + user data
         ↓
Store in Redux + localStorage
         ↓
Redirect to dashboard/home
```

### Register Flow
```
User enters registration data
         ↓
Frontend validates all fields
         ↓
Sends POST /auth/register
         ↓
Backend creates user account
         ↓
Auto-redirect to login
         ↓
User logs in with credentials
```

### Password Reset Flow
```
User clicks "Forgot password?"
         ↓
Enters email address
         ↓
Backend sends OTP email
         ↓
User enters OTP
         ↓
Backend verifies OTP match
         ↓
User sets new password
         ↓
Backend updates password
         ↓
Redirect to login
```

---

## 🔑 Social Login Integration

### Google OAuth
**Status:** Ready for configuration

**Setup Steps:**
1. Create Google Cloud project
2. Enable OAuth 2.0
3. Add redirect URIs
4. Copy Client ID
5. Add to `.env` file
6. Install: `npm install @react-oauth/google`

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed instructions.

**Flow:**
```
User clicks "Google" button
         ↓
Redirects to Google login
         ↓
User authorizes app
         ↓
Returns auth token
         ↓
Frontend sends token to backend
         ↓
Backend verifies with Google API
         ↓
Creates/updates user
         ↓
Returns JWT token
         ↓
User logged in
```

### GitHub OAuth
**Status:** Ready for configuration

**Setup Steps:**
1. Register OAuth app on GitHub
2. Get Client ID & Secret
3. Set callback URL
4. Add to `.env` file

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed instructions.

**Flow:**
```
User clicks "GitHub" button
         ↓
Redirects to GitHub login
         ↓
User authorizes app
         ↓
Returns auth code
         ↓
Frontend sends code to backend
         ↓
Backend exchanges code for token
         ↓
Gets user info from GitHub
         ↓
Creates/updates user
         ↓
Returns JWT token
         ↓
User logged in
```

---

## 📋 API Endpoints

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1 (555) 123-4567"
}

Response:
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer jwt_token_here

Response:
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
```

#### Send Password Reset OTP
```
POST /api/auth/forgot-password

{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent to email"
}
```

#### Verify Reset OTP
```
POST /api/auth/verify-otp

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "message": "OTP verified",
  "resetToken": "temp_token_for_password_reset"
}
```

#### Reset Password
```
POST /api/auth/reset-password

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}

Response:
{
  "message": "Password reset successful"
}
```

#### Google Login
```
POST /api/auth/google-login

{
  "token": "google_id_token"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### GitHub Login
```
POST /api/auth/github-login

{
  "code": "github_auth_code"
}

Response:
{
  "token": "jwt_token_here",
  "user": { ... }
}
```

---

## 🛡️ Security Features

### Password Security
- ✅ Minimum 8 characters required
- ✅ Password strength indicator
- ✅ Secure hashing on backend (bcrypt)
- ✅ Never stored in plain text
- ✅ Frontend validation before submission

### JWT Token Management
- ✅ Tokens stored in localStorage
- ✅ Auto-refresh token on expiry (24 hours)
- ✅ Refresh tokens (7 days)
- ✅ Token included in API headers
- ✅ Secure token structure

### Session Management
- ✅ User stored in Redux store
- ✅ Protected routes with role checking
- ✅ Auto-logout on token expiry
- ✅ Clear session on logout

### CORS Protection
- ✅ Configured allowed origins
- ✅ Cookie credentials support
- ✅ Restricted HTTP methods
- ✅ Custom headers allowed

---

## 🛠️ Environment Variables

Create `.env` file in frontend directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:6969/api

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# GitHub OAuth
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id_here
REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Environment
REACT_APP_ENV=development
```

---

## ⚙️ Backend Adjustments Needed

### User Entity Addition
```java
@Column(name = "google_id")
private String googleId;

@Column(name = "github_id")
private String githubId;

@Column(name = "oauth_provider")
private String oauthProvider; // GOOGLE, GITHUB, LOCAL
```

### New Endpoints to Create
- `POST /auth/forgot-password` - Send OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/reset-password` - Reset password
- `POST /auth/google-login` - Google OAuth
- `POST /auth/github-login` - GitHub OAuth
- `POST /auth/refresh` - Refresh JWT token

### Dependencies Needed
Backend should include:
- JWT library (already included)
- Google API client
- GitHub API client
- Email service (for OTP)

---

## 🧪 Demo Credentials

### Customer Account
- **Email:** customer@demo.com
- **Password:** password123

### Admin Account
- **Email:** admin@demo.com
- **Password:** password123

---

## 🐛 Troubleshooting

### Login Issues
| Issue | Solution |
|-------|----------|
| Invalid credentials | Check email/password match in backend |
| CORS error | Verify backend CORS configuration |
| Token not saving | Check localStorage permissions |
| 401 Unauthorized | Token expired, refresh needed |

### Registration Issues
| Issue | Solution |
|-------|----------|
| Email already exists | Use different email |
| Password validation fails | Min 8 chars, uppercase, number, special char |
| Phone validation fails | Use valid phone format |
| 400 Bad Request | Check all fields are filled |

### OAuth Issues
| Issue | Solution |
|-------|----------|
| Redirect URI mismatch | Update OAuth app settings |
| Client ID not found | Add to .env file |
| OAuth not configured | See OAUTH_SETUP.md |

### Password Reset Issues
| Issue | Solution |
|-------|----------|
| No email received | Check email service configuration |
| OTP expired | Generate new OTP |
| Invalid OTP | Enter correct 6-digit code |

---

## 📱 Responsive Design

All auth pages are fully responsive:
- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ Large screens (1440px+)

---

## 🎨 Styling

All pages use Tailwind CSS with:
- Green gradient backgrounds
- Modern card design
- Smooth transitions
- Icon integration (SVG)
- Dark mode ready

---

## 🔄 Next Steps

1. **Configure OAuth:**
   - Get Google Client ID
   - Get GitHub Client ID
   - Update .env files

2. **Backend Implementation:**
   - Add password reset endpoints
   - Implement OAuth handlers
   - Setup email service for OTP

3. **Testing:**
   - Test all auth flows
   - Test social login
   - Test password reset

4. **Deployment:**
   - Update URLs for production
   - Configure OAuth for production
   - Test in staging environment

---

## 📚 Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP Authentication Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [React Router Documentation](https://reactrouter.com/)
- [Redux Documentation](https://redux.js.org/)

---

## 👤 Support

For issues or questions:
1. Check troubleshooting section
2. Review OAUTH_SETUP.md for OAuth issues
3. Check browser console for errors
4. Review API response codes
5. Contact development team

---

**Last Updated:** February 18, 2026
**Version:** 1.0.0
