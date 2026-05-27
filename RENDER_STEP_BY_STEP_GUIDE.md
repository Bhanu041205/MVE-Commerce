# STEP-BY-STEP RENDER DEPLOYMENT GUIDE

## PREREQUISITES
- GitHub account with your code pushed
- Render account (render.com)
- Neon database connection string (already have it)

---

## 🖥️ STEP 1: DEPLOY BACKEND

### Step 1.1: Go to Render Dashboard
- Open https://render.com/dashboard
- Click **"New +"** button (top right)
- Select **"Web Service"**

### Step 1.2: Connect GitHub Repository
- Click **"Connect account"** if not already connected
- Select your GitHub repository containing the code
- Select branch: **main** (or your default)

### Step 1.3: Configure Service
- **Name**: `mvecommerce-backend`
- **Environment**: `Docker`
- **Region**: `Oregon` (or closest to you)
- **Plan**: `Starter` ($12/month - minimum for backend)
- Click **"Create Web Service"**

### Step 1.4: Add Environment Variables
- After service is created, go to **"Environment"** tab
- Click **"Add Environment Variable"**
- Add these 3 variables one by one:

```
KEY: DATABASE_URL
VALUE: postgresql://neondb_owner:npg_HzrORgZGC5U4@ep-flat-unit-ai50sjq8-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

KEY: JWT_SECRET
VALUE: mvecommerce_jwt_secret_key_for_authentication_and_token_generation_purposes_2026

KEY: CORS_ALLOWED_ORIGINS
VALUE: http://localhost:3000
(We'll update this later after frontend is deployed)
```

- Click **"Save"** after adding each variable

### Step 1.5: Deploy Backend
- Click the **"Deploy"** button
- Wait for the build to complete (takes 5-10 minutes)
- Check the logs for any errors
- When complete, you'll see a green checkmark ✅
- **Copy your backend URL**: `https://mvecommerce-backend-xxxxx.onrender.com`

### Step 1.6: Test Backend
- Open in browser: `https://mvecommerce-backend-xxxxx.onrender.com/api`
- You should see an error page (that's normal - no endpoint there)
- If page loads, backend is running ✅

---

## 🎨 STEP 2: DEPLOY FRONTEND

### Step 2.1: Go to Render Dashboard
- Click **"New +"** button (top right)
- Select **"Static Site"** (best for React/Vite)

### Step 2.2: Connect GitHub Repository
- Select your GitHub repository (same one as backend)
- Select branch: **main** (or your default)

### Step 2.3: Configure Service
- **Name**: `mvecommerce-frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Plan**: `Free` (0$/month)
- Click **"Create Static Site"**

### Step 2.4: Add Environment Variables
- After service is created, go to **"Environment"** tab
- Click **"Add Environment Variable"**
- Add this variable:

```
KEY: VITE_API_URL
VALUE: https://mvecommerce-backend-xxxxx.onrender.com/api
(Replace xxxxx with the actual ID from your backend URL)
```

- Click **"Save"**

### Step 2.5: Deploy Frontend
- Click the **"Deploy"** button
- Wait for the build to complete (takes 3-5 minutes)
- Check the logs for any errors
- When complete, you'll see ✅
- **Copy your frontend URL**: `https://mvecommerce-frontend-xxxxx.onrender.com`

### Step 2.6: Test Frontend
- Open in browser: `https://mvecommerce-frontend-xxxxx.onrender.com`
- You should see your login page ✅
- If you see blank page, wait a bit more for static assets to load

---

## 🔄 STEP 3: UPDATE BACKEND CORS

### Step 3.1: Go Back to Backend Service
- Go to Render Dashboard
- Click on **mvecommerce-backend** service
- Go to **"Environment"** tab

### Step 3.2: Update CORS Variable
- Find **CORS_ALLOWED_ORIGINS**
- Change value from: `http://localhost:3000`
- Change value to: `https://mvecommerce-frontend-xxxxx.onrender.com`
  (Use your actual frontend URL from Step 2.5)
- Click **"Save"**

### Step 3.3: Backend Auto-Redeploys
- Backend will automatically redeploy with new CORS setting
- Wait for deployment to complete (1-2 minutes)
- Check logs for success ✅

---

## ✅ STEP 4: TEST THE APPLICATION

### Step 4.1: Test Frontend at Frontend URL
- Open: `https://mvecommerce-frontend-xxxxx.onrender.com`
- Should see login page ✅

### Step 4.2: Test Login
- Click **"Sign Up"** button
- Fill in email and password
- Click **"Sign Up"**
- If successful, you're logged in ✅
- If error: Check backend logs for database issues

### Step 4.3: Test API Connection
- Open browser **Developer Tools** (F12)
- Go to **Network** tab
- Login again
- You should see API calls to backend
- If all green (200 status), API is working ✅
- If red (CORS/404 errors), check CORS_ALLOWED_ORIGINS

### Step 4.4: Test Core Features
- Browse products
- Add to cart
- Try checkout
- Check admin panel (if applicable)

---

## 📊 MONITORING & TROUBLESHOOTING

### Check Logs
- **Backend logs**: Render dashboard → Backend service → Logs
- **Frontend logs**: Render dashboard → Frontend service → Logs
- Look for errors, especially in first few minutes after deployment

### Common Issues & Fixes

#### ❌ CORS Error
```
Error: Access blocked by CORS policy
Fix: Update CORS_ALLOWED_ORIGINS with exact frontend URL
```

#### ❌ 404 on API calls
```
Error: Cannot POST /api/auth/login
Fix: Check VITE_API_URL includes /api at the end
```

#### ❌ Database connection error
```
Error: Failed to connect to database
Fix: Ensure DATABASE_URL is exactly correct (copy-paste carefully)
```

#### ❌ Frontend shows blank page
```
Error: White screen, no content
Fix: Wait 2-3 minutes, then refresh. Check frontend logs for build errors
```

#### ❌ Login not working
```
Error: Login fails silently
Fix: Check browser console (F12) for specific error messages
```

---

## 🎯 SUMMARY OF YOUR RENDER URLS

After completing all steps:

```
Frontend: https://mvecommerce-frontend-xxxxx.onrender.com
Backend:  https://mvecommerce-backend-xxxxx.onrender.com/api
Database: Neon PostgreSQL (no public URL needed)
```

---

## ⚡ QUICK REFERENCE: Environment Variables Set

### Backend (in Render)
```
DATABASE_URL=postgresql://neondb_owner:npg_HzrORgZGC5U4@...
JWT_SECRET=mvecommerce_jwt_secret_key_...
CORS_ALLOWED_ORIGINS=https://mvecommerce-frontend-xxxxx.onrender.com
```

### Frontend (in Render)
```
VITE_API_URL=https://mvecommerce-backend-xxxxx.onrender.com/api
```

---

## 🎉 YOU'RE DONE!

Your application is now live on Render! 🚀

- Backend running on: `https://mvecommerce-backend-xxxxx.onrender.com`
- Frontend running on: `https://mvecommerce-frontend-xxxxx.onrender.com`
- Database: Neon PostgreSQL
- All connected and working! ✅

Share these URLs with your users or test thoroughly before going public.

---

## 📝 NOTES

- **Auto-Deployment**: Whenever you push code to GitHub, Render automatically rebuilds and deploys
- **Logs**: Always check logs if something isn't working
- **Free Tier**: Frontend is free forever, Backend needs Starter plan ($12/month)
- **Database**: Neon has free tier, but paid plans available as you scale
- **Uptime**: Render services will sleep after 15 min of inactivity on free tier (only applies to backend Starter plan has 99.95% uptime)
