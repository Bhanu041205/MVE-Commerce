# FINAL ENVIRONMENT VARIABLES FOR RENDER DEPLOYMENT
# Backend and Frontend - MVE Commerce Project

## ========================================
## BACKEND ENVIRONMENT VARIABLES (Spring Boot)
## ========================================
## Add these in Render Web Service → Environment tab

# DATABASE CONFIGURATION (From your Neon account)
DATABASE_URL=postgresql://neondb_owner:npg_HzrORgZGC5U4@ep-flat-unit-ai50sjq8-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT CONFIGURATION
JWT_SECRET=mvecommerce_jwt_secret_key_for_authentication_and_token_generation_purposes_2026
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# SERVER CONFIGURATION
PORT=6969
SERVER_SERVLET_CONTEXT_PATH=/api
SERVER_ERROR_INCLUDE_MESSAGE=true
SERVER_ERROR_INCLUDE_BINDING_ERRORS=true

# LOGGING CONFIGURATION
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MVECOMMERCE=DEBUG

# CORS CONFIGURATION (UPDATE AFTER FRONTEND IS DEPLOYED)
# Replace with your actual frontend Render URL once it's deployed
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*
CORS_ALLOW_CREDENTIALS=true

# JPA/HIBERNATE CONFIGURATION
JPA_HIBERNATE_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_HIBERNATE_FORMAT_SQL=true

# EMAIL NOTIFICATION CONFIGURATION (Optional)
APP_ORDER_NOTES_NOTIFY_RECIPIENTS=your-email@example.com
APP_ORDER_NOTES_FROM_EMAIL=no-reply@mvecommerce.local


## ========================================
## FRONTEND ENVIRONMENT VARIABLES (React/Vite)
## ========================================
## Add these in Render Static Site → Environment tab

# API CONFIGURATION (UPDATE AFTER BACKEND IS DEPLOYED)
# Replace with your actual backend Render URL once it's deployed
VITE_API_URL=https://your-backend-name.onrender.com/api

# OPTIONAL: Google OAuth (if using)
# VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
# VITE_GOOGLE_REDIRECT_URI=https://your-frontend-name.onrender.com/auth/callback

# OPTIONAL: GitHub OAuth (if using)
# VITE_GITHUB_CLIENT_ID=your-github-client-id-here
# VITE_GITHUB_REDIRECT_URI=https://your-frontend-name.onrender.com/auth/github-callback


## ========================================
## DEPLOYMENT STEPS
## ========================================

### STEP 1: Deploy Backend
1. Go to Render.com Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set Name: mvecommerce-backend
5. Set Environment: Docker
6. Set Plan: Starter
7. Go to "Environment" tab
8. Add ALL backend environment variables above
9. Click "Deploy"
10. Wait for deployment to complete
11. Copy your backend URL: https://mvecommerce-backend-xxxxx.onrender.com

### STEP 2: Deploy Frontend
1. Go to Render.com Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Set Name: mvecommerce-frontend
5. Set Build Command: npm install && npm run build
6. Set Publish Directory: dist
7. Set Plan: Free
8. Go to "Environment" tab
9. Add VITE_API_URL with your backend URL from Step 1
10. Click "Deploy"
11. Wait for deployment to complete
12. Copy your frontend URL: https://mvecommerce-frontend-xxxxx.onrender.com

### STEP 3: Update Backend CORS
1. Go back to backend service in Render
2. Go to "Environment" tab
3. Update CORS_ALLOWED_ORIGINS with your actual frontend URL
4. Click "Save"
5. Backend will auto-redeploy

### STEP 4: Test
- Visit your frontend URL
- Try login/register
- Check if API calls work
- Monitor logs for errors


## ========================================
## IMPORTANT NOTES
## ========================================

✅ DATABASE CONNECTION:
   - Connection String is already configured from your Neon account
   - The application will automatically create tables on first run
   - No manual database setup needed

⚠️ CORS CONFIGURATION:
   - Must match your actual Render frontend URL
   - Update after frontend is deployed
   - This is the #1 reason for deployment failures

⚠️ FRONTEND API URL:
   - Must match your actual Render backend URL
   - Update after backend is deployed
   - Check that it includes /api at the end

🔒 SECURITY:
   - Change JWT_SECRET in production to a unique value
   - Keep DATABASE_URL secret (use Render's secret management)
   - Never commit actual credentials to GitHub

🔧 MONITORING:
   - Check Render logs frequently during and after deployment
   - Look for database connection errors
   - Check for CORS errors in browser console
   - Test all key features: login, product browsing, cart, admin

## ========================================
## YOUR NEON DATABASE DETAILS (Extracted)
## ========================================

Database Type: PostgreSQL
Host: ep-flat-unit-ai50sjq8-pooler.c-4.us-east-1.aws.neon.tech
Port: 5432
Database Name: neondb
Username: neondb_owner
Password: npg_HzrORgZGC5U4
SSL Mode: require
Channel Binding: require

(All already included in DATABASE_URL above)
