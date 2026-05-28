# ✅ DEPLOYMENT READY - COMPLETE GUIDE

Your MVE Commerce project is production-ready! This guide covers deployment steps and all required configurations.

---

## 📦 BUILD STATUS

✅ **Backend**: Built successfully (JAR created)  
✅ **Frontend**: Built successfully (Dist folder created)  
✅ **Database**: Neon PostgreSQL ready  
✅ **Project**: Pushed to GitHub  

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Render.com (Recommended - Free/Paid)
Best for: Full-stack deployment with free frontend hosting

### Option 2: Heroku (Paid)
Best for: Easy one-click deployment

### Option 3: DigitalOcean/AWS
Best for: More control and scaling

---

## 📋 ENVIRONMENT VARIABLES FOR DEPLOYMENT

### BACKEND - Environment Variables (Render Web Service)

```
# DATABASE (Neon PostgreSQL)
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

# LOGGING
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MVECOMMERCE=DEBUG

# CORS CONFIGURATION (Update after frontend deployment)
CORS_ALLOWED_ORIGINS=https://mvecommerce-frontend-xxxxx.onrender.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD
CORS_ALLOWED_HEADERS=*
CORS_ALLOW_CREDENTIALS=false

# JPA/HIBERNATE
JPA_HIBERNATE_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_HIBERNATE_FORMAT_SQL=true

# EMAIL (Optional)
APP_ORDER_NOTES_NOTIFY_RECIPIENTS=your-email@example.com
APP_ORDER_NOTES_FROM_EMAIL=no-reply@mvecommerce.local
```

### FRONTEND - Environment Variables (Render Static Site)

```
# API Configuration (Update with your backend URL)
VITE_API_URL=https://mvecommerce-backend-xxxxx.onrender.com/api

# Google OAuth (If using OAuth)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### LOCAL DEVELOPMENT - .env Files

**Backend (.env)**
```
DATABASE_URL=postgresql://localhost:5432/mvecommerce
DB_USERNAME=postgres
DB_PASSWORD=postgres
JWT_SECRET=mvecommerce_jwt_secret_key_for_authentication_and_token_generation_purposes_2026
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:6969/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## 🐙 GIT VERIFICATION

Your code is already pushed to GitHub! To verify:

```powershell
cd "d:\Java FullStack\Mandova"
git log --oneline -5
git remote -v
```

**Your Repository:**
```
https://github.com/Bhanu041205/MVE-Commerce.git
```

---

## 🎯 RENDER.COM DEPLOYMENT STEPS (Detailed)

### Step 1: Deploy Backend

1. Go to [render.com](https://render.com) dashboard
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository: `MVE-Commerce`
4. Choose branch: `main`
5. Configure:
   - **Name**: `mvecommerce-backend`
   - **Environment**: `Docker`
   - **Region**: `Oregon` (or closest to you)
   - **Plan**: `Starter` ($7-12/month)
6. Click **"Create Web Service"**
7. **Add Environment Variables** (see BACKEND vars above):
   - Go to **Environment** tab
   - Add each variable from the list above
8. Click **"Deploy"**
9. Wait 5-10 minutes for build to complete
10. **Copy your backend URL**: `https://mvecommerce-backend-xxxxx.onrender.com`

### Step 2: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Select same GitHub repository: `MVE-Commerce`
3. Choose branch: `main`
4. Configure:
   - **Name**: `mvecommerce-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`
5. Click **"Create Static Site"**
6. **Add Environment Variable**:
   - `VITE_API_URL=https://mvecommerce-backend-xxxxx.onrender.com/api`
   - (Replace with your actual backend URL from Step 1)
7. Click **"Deploy"**
8. Wait 3-5 minutes for build to complete
9. **Copy your frontend URL**: `https://mvecommerce-frontend-xxxxx.onrender.com`

### Step 3: Update Backend CORS

1. Go back to **Backend Service** in Render
2. Go to **Environment** tab
3. Update `CORS_ALLOWED_ORIGINS`:
   - Change from `*` to your frontend URL
   - Example: `https://mvecommerce-frontend-xxxxx.onrender.com`
4. Click **"Save"**
5. Backend will auto-redeploy with new CORS settings

---

## 📝 REQUIRED FILES FOR DEPLOYMENT

Your GitHub repo must have:

- ✅ `backend/` folder with Spring Boot project
- ✅ `frontend/` folder with React project
- ✅ `backend/pom.xml` - Maven configuration
- ✅ `frontend/package.json` - npm configuration
- ✅ `backend/Dockerfile` - Docker configuration for backend
- ✅ `.gitignore` - to exclude node_modules, target/, etc.

---

## 🔍 TESTING THE DEPLOYMENT

### Test Backend
```bash
curl https://mvecommerce-backend-xxxxx.onrender.com/api
```

### Test Frontend
```
Open in browser: https://mvecommerce-frontend-xxxxx.onrender.com
```

### Check Logs
- Backend: Render dashboard → Backend Service → Logs
- Frontend: Render dashboard → Frontend Site → Logs

---

## ❌ TROUBLESHOOTING

### Backend Build Fails
- Check `pom.xml` is valid
- Check Java version (should be 17)
- Check `Dockerfile` exists in backend folder

### Frontend Build Fails
- Check `package.json` is valid
- Check all npm dependencies are installed locally
- Run locally: `npm install && npm run build`

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Restart/redeploy backend after updating CORS

### API Connection Fails
- Check backend is running: `curl https://mvecommerce-backend-xxxxx.onrender.com/api`
- Check `VITE_API_URL` in frontend is correct
- Check network/firewall isn't blocking requests

---

## 📄 .gitignore (Already in your repo)

Ensure `.gitignore` contains:

```
# Backend
backend/target/
backend/.env
backend/.env.local
backend/*.log

# Frontend
frontend/node_modules/
frontend/.env
frontend/.env.local
frontend/dist/
frontend/.vite/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Backend builds successfully: `mvn clean package`
- [ ] Frontend builds successfully: `npm run build`
- [ ] All code pushed to GitHub
- [ ] Render accounts created and connected
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render
- [ ] Backend URL copied and used in frontend
- [ ] CORS updated with frontend URL
- [ ] All environment variables added
- [ ] API connectivity tested
- [ ] Frontend loads and can call backend

---

## 🎉 YOU'RE READY FOR DEPLOYMENT!

Follow the steps above to deploy your application. Once deployed, test thoroughly before promoting to production.

For detailed help, see [RENDER_STEP_BY_STEP_GUIDE.md](RENDER_STEP_BY_STEP_GUIDE.md)
