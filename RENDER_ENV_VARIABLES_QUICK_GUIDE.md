# Render Deployment - Quick Environment Variables Guide

## 📋 BACKEND Environment Variables (Java Spring Boot)

### Critical Variables (Required)

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Get from Neon console |
| `CORS_ALLOWED_ORIGINS` | `https://frontend-url.onrender.com` | **Must match your frontend Render URL** |
| `JWT_SECRET` | `mvecommerce_jwt_secret_key_for_authentication_and_token_generation_purposes_2026` | Change in production |

### Recommended Variables

| Variable | Default | Value |
|----------|---------|-------|
| `JWT_EXPIRATION` | 86400000 | 24 hours in milliseconds |
| `JWT_REFRESH_EXPIRATION` | 604800000 | 7 days in milliseconds |
| `PORT` | 6969 | Server port |
| `SERVER_SERVLET_CONTEXT_PATH` | /api | API context path |
| `LOGGING_LEVEL_ROOT` | INFO | Log level |
| `LOGGING_LEVEL_COM_MVECOMMERCE` | DEBUG | App log level |

### Optional Variables

| Variable | Value | Use Case |
|----------|-------|----------|
| `APP_ORDER_NOTES_NOTIFY_RECIPIENTS` | your-email@example.com | Email notifications |
| `DB_USERNAME` | neondb_owner | Alternative to DATABASE_URL |
| `DB_PASSWORD` | your_password | Alternative to DATABASE_URL |

---

## 🎨 FRONTEND Environment Variables (React/Vite)

### Critical Variables (Required)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://backend-url.onrender.com/api` | **Must match your backend Render URL** |

### Optional Variables (OAuth)

| Variable | Value | Use Case |
|----------|-------|----------|
| `VITE_GOOGLE_CLIENT_ID` | your-client-id | For Google Sign-In |
| `VITE_GITHUB_CLIENT_ID` | your-client-id | For GitHub Sign-In |

---

## 🔧 Step-by-Step Render Setup

### 1. Create Backend Service
```
Service Type: Web Service + Docker
Build: Docker (automatic from Dockerfile)
Plan: Starter (or Free for testing)
```

### 2. Add Backend Environment Variables
In Render → Environment tab, add all variables from Backend section above

### 3. Create Frontend Service  
```
Service Type: Static Site (or Web Service)
Build Command: npm install && npm run build
Publish Directory: dist
Plan: Free
```

### 4. Add Frontend Environment Variables
In Render → Environment tab:
- `VITE_API_URL=https://[YOUR_BACKEND_RENDER_URL].onrender.com/api`

### 5. Create PostgreSQL Database
```
Option A: Use Render PostgreSQL
Option B: Use Neon (recommended)
         - Create account at neon.tech
         - Get connection string
         - Add to DATABASE_URL
```

---

## 🔗 Getting Render URLs

After deployment, your URLs will be:
- **Backend**: `https://mvecommerce-backend.onrender.com`
- **Frontend**: `https://mvecommerce-frontend.onrender.com`

### Update CORS Configuration
Once you have frontend URL, update backend:
```
CORS_ALLOWED_ORIGINS=https://mvecommerce-frontend.onrender.com
```

---

## ⚠️ Important: CORS Configuration

**The most common deployment issue is CORS mismatch!**

Make sure:
1. Frontend `VITE_API_URL` points to correct backend URL
2. Backend `CORS_ALLOWED_ORIGINS` includes frontend URL
3. Both URLs must be EXACT (case-sensitive, with/without trailing slash)

Example:
```
Frontend: https://myapp-frontend.onrender.com
Backend: https://myapp-backend.onrender.com/api

CORS_ALLOWED_ORIGINS must be: https://myapp-frontend.onrender.com
VITE_API_URL must be: https://myapp-backend.onrender.com/api
```

---

## 📝 Database Setup for Render

### Using Neon (PostgreSQL)
1. Visit https://console.neon.tech
2. Create project
3. Copy connection string
4. Set as `DATABASE_URL` in backend environment variables
5. Format: `postgresql://username:password@host:5432/database?sslmode=require`

### Using Render PostgreSQL
1. In Render dashboard, create PostgreSQL database
2. Copy connection info
3. Set as `DATABASE_URL` in backend

---

## 🚀 Deployment Commands Checklist

- [ ] Update `backend/src/main/resources/application.yml` with environment variable placeholders
- [ ] Verify `backend/Dockerfile` exists
- [ ] Create `frontend/.env` with `VITE_API_URL`
- [ ] Run `npm run build` in frontend to test build
- [ ] Push code to GitHub
- [ ] Create Render Web Service for backend
- [ ] Add backend environment variables
- [ ] Create Render Static Site for frontend
- [ ] Add frontend environment variables
- [ ] Update `CORS_ALLOWED_ORIGINS` with actual frontend URL
- [ ] Test the deployed application

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS Error | Check `CORS_ALLOWED_ORIGINS` matches frontend Render URL |
| 404 on API calls | Verify `VITE_API_URL` and backend URL are correct |
| Database connection failed | Ensure `DATABASE_URL` includes `?sslmode=require` |
| Build failed | Check `npm run build` works locally first |
| Static site blank | Check publish directory is `dist`, not `build` |

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Spring Boot Env Variables**: https://spring.io/guides/
- **Vite Env Variables**: https://vitejs.dev/guide/env-and-modes.html
- **Neon Database**: https://neon.tech/docs
