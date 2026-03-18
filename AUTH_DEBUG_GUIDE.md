# Authentication Flow Debugging Guide

## What We Just Fixed

### 1. **API URL Bug** ✅
- **Problem**: Frontend was looking for backend on `http://localhost:8080/api`
- **Solution**: Updated to correct port `http://localhost:6969/api` in `.env` file

### 2. **Enhanced Error Handling** ✅
- Added detailed console logging for debugging
- Improved error messages
- Better response handling

### 3. **Auto-Login After Registration** ✅
- After successful registration, system auto-logs in the user
- If auto-login fails, redirects to login page
- Better error messages if things fail

---

## Backend Response Format Required

### Login Endpoint: `POST /api/auth/login`

**Request:**
```json
{
  "email": "customer@demo.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "customer@demo.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid email or password",
  "status": 401
}
```

### Register Endpoint: `POST /api/auth/register`

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

**Expected Response (200/201):**
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "message": "User registered successfully"
}
```

**Error Response (400):**
```json
{
  "message": "Email already exists",
  "status": 400
}
```

---

## Frontend Flow Diagram

```
1. User fills login form
   ↓
2. Clicks "Login" button
   ↓
3. Frontend sends POST /api/auth/login
   ↓
4. Backend validates & returns token + user
   ↓
5. Frontend saves to:
   - Redux store (auth state)
   - localStorage (persistence)
   ↓
6. Frontend redirects to:
   - "/" (home) for CUSTOMER
   - "/admin/dashboard" for ADMIN
```

---

## Registration Flow Diagram

```
1. User fills signup form
   ↓
2. Frontend validates (password, email, phone, etc.)
   ↓
3. Clicks "Sign Up" button
   ↓
4. Frontend sends POST /api/auth/register
   ↓
5. Backend creates user &returns success
   ↓
6. Frontend auto-calls POST /api/auth/login
   ↓
7. Backend returns token + user
   ↓
8. Frontend saves to Redux + localStorage
   ↓
9. Redirects to "/" (home page)
```

---

## How to Test

### Test with Demo Credentials:
```
Email: customer@demo.com
Password: password123
or
Email: admin@demo.com
Password: password123
```

### Check Console Logs:
Open browser DevTools (F12) → Console tab
You should see:
- `Request: POST /auth/login`
- `Response: 200 {...}`
- `User restored from localStorage`
- `Redirecting to: /`

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails with 404 | Wrong API URL | Check .env file has correct port (6969) |
| Login fails with 401 | Invalid credentials | Use demo credentials first to test |
| After login, page stays blank | Redux not updated | Check browser console for errors |
| Not redirected to home | Auth state not set | Check localStorage has token + user |
| Registration doesn't save | Backend issue | Check backend logs |
| Can't login after signup | Auto-login failed | Manual login should work |

---

## Environment Variable Check

**File**: `frontend/.env`

Should contain:
```
REACT_APP_API_URL=http://localhost:6969/api
REACT_APP_ENV=development
```

If you change the backend port, update this file!

---

## What's Working Now

✅ API URL correctly set to port 6969  
✅ Enhanced error handling with console logs  
✅ Auto-login after registration  
✅ Token storage in localStorage  
✅ Redux state management  
✅ .env file configuration  
✅ Detailed error messages  

---

## Next Steps if Still Not Working

1. Check backend logs for errors
2. Open browser console (F12) and look for:
   - Network errors
   - 404 (wrong URL)
   - 500 (backend error)
   - CORS errors
3. Verify backend is running on port 6969
4. Test backend endpoints with Postman
5. Check that demo user exists in database

---

## Backend Verification

Run these commands to verify backend is working:

```bash
# Check if backend is running
curl http://localhost:6969/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"customer@demo.com\", \"password\": \"password123\"}"

# Should return token + user object
```

If you get an error, backend endpoints might not be implemented correctly.

---

## File Changes Made

- ✅ `frontend/.env` - Added with correct API URL
- ✅ `src/api/axios.js` - Fixed API URL + added logging
- ✅ `src/pages/auth/Login.js` - Enhanced error handling + logging
- ✅ `src/pages/auth/Register.js` - Added auto-login + fixed syntax
- ✅ `src/App.js` - Added auth state restoration logging

---

## Frontend Console Commands (for testing)

Open browser console and run:

```javascript
// Check if token is saved
localStorage.getItem('token')

// Check if user is saved
JSON.parse(localStorage.getItem('user'))

// Check Redux store (install Redux DevTools extension for better view)
// or check by logging in and watching console
```
