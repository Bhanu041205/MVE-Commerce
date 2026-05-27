# Render Deployment Guide - MVE Commerce

## Overview
This guide covers deploying both backend (Java Spring Boot) and frontend (React/Vite) to Render.

---

## BACKEND (Spring Boot) - Render Setup

### Prerequisites
- GitHub repository with your code
- Render account (render.com)
- PostgreSQL database (can use Render's or external like Neon)

### Step 1: Create a New Web Service on Render

1. Go to **Render Dashboard** → Click **New +** → Select **Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `mvecommerce-backend` (or your choice)
   - **Environment**: `Docker`
   - **Build Command**: (leave default)
   - **Start Command**: (leave default - will use Dockerfile)
   - **Plan**: Free or Starter (based on your needs)

### Step 2: Backend Environment Variables

Add these environment variables in **Environment** section:

```
# Database Configuration
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]?sslmode=require
DB_USERNAME=neondb_owner
DB_PASSWORD=your_actual_password
DB_DRIVER=org.postgresql.Driver

# JWT Configuration
JWT_SECRET=mvecommerce_jwt_secret_key_for_authentication_and_token_generation_purposes_2026
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Server Configuration
PORT=6969
SERVER_SERVLET_CONTEXT_PATH=/api
SERVER_ERROR_INCLUDE_MESSAGE=true
SERVER_ERROR_INCLUDE_BINDING_ERRORS=true

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_MVECOMMERCE=DEBUG

# CORS Configuration (IMPORTANT - Update with your frontend URL)
CORS_ALLOWED_ORIGINS=https://your-frontend-render-url.onrender.com,http://localhost:3000
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=*
CORS_ALLOW_CREDENTIALS=true

# JPA Configuration
JPA_HIBERNATE_DDL_AUTO=update
JPA_SHOW_SQL=false
JPA_HIBERNATE_FORMAT_SQL=true

# Email Notification (Optional)
APP_ORDER_NOTES_NOTIFY_RECIPIENTS=your-email@example.com
APP_ORDER_NOTES_FROM_EMAIL=no-reply@mvecommerce.local
```

### Step 3: Update Backend application.yml

Modify `backend/src/main/resources/application.yml` to use environment variables:

```yaml
spring:
  application:
    name: mvecommerce-backend
  datasource:
    url: ${DATABASE_URL:jdbc:postgresql://localhost:5432/mvecommerce}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: ${DB_DRIVER:org.postgresql.Driver}
    hikari:
      maximum-pool-size: 5
      minimum-idle: 1
      idle-timeout: 30000
      max-lifetime: 120000
      connection-timeout: 20000
      keepalive-time: 30000
      validation-timeout: 5000
  jpa:
    hibernate:
      ddl-auto: ${JPA_HIBERNATE_DDL_AUTO:update}
    show-sql: ${JPA_SHOW_SQL:false}
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: ${JPA_HIBERNATE_FORMAT_SQL:true}
  jackson:
    serialization:
      write-dates-as-timestamps: false

server:
  port: ${PORT:6969}
  servlet:
    context-path: ${SERVER_SERVLET_CONTEXT_PATH:/api}
  error:
    include-message: ${SERVER_ERROR_INCLUDE_MESSAGE:always}
    include-binding-errors: ${SERVER_ERROR_INCLUDE_BINDING_ERRORS:always}

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:mvecommerce_jwt_secret_key_for_authentication_and_token_generation_purposes_2026}
  expiration: ${JWT_EXPIRATION:86400000}
  refresh-expiration: ${JWT_REFRESH_EXPIRATION:604800000}

# Logging Configuration
logging:
  level:
    root: ${LOGGING_LEVEL_ROOT:INFO}
    com.mvecommerce: ${LOGGING_LEVEL_COM_MVECOMMERCE:DEBUG}
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"

# CORS Configuration
cors:
  allowed-origins: ${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:3001}
  allowed-methods: ${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,OPTIONS}
  allowed-headers: ${CORS_ALLOWED_HEADERS:*}
  allow-credentials: ${CORS_ALLOW_CREDENTIALS:true}

# App Configuration
app:
  order-notes:
    notify-recipients: ${APP_ORDER_NOTES_NOTIFY_RECIPIENTS:}
    from-email: ${APP_ORDER_NOTES_FROM_EMAIL:no-reply@mvecommerce.local}
```

### Step 4: Create/Update Dockerfile (Backend)

Create `backend/Dockerfile`:

```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 6969
CMD ["java", "-jar", "app.jar"]
```

---

## FRONTEND (React/Vite) - Render Setup

### Step 1: Create a New Static Site (or Web Service) on Render

1. Go to **Render Dashboard** → Click **New +** → Select **Static Site** (or **Web Service** for more control)
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `mvecommerce-frontend` (or your choice)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

### Step 2: Frontend Environment Variables

Add these in **Environment** section of your Render Static Site/Web Service:

```
# API Configuration - IMPORTANT: Update with your backend Render URL
VITE_API_URL=https://your-backend-render-url.onrender.com/api

# Optional: Google OAuth (if using)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=https://your-frontend-render-url.onrender.com/auth/callback

# Optional: GitHub OAuth (if using)
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_REDIRECT_URI=https://your-frontend-render-url.onrender.com/auth/github-callback
```

### Step 3: Create/Update Frontend .env File

Create `frontend/.env.example` (or add to version control at `frontend/.env`):

```env
# Backend API Configuration
VITE_API_URL=https://your-backend-url.onrender.com/api

# OAuth Configuration (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=https://your-frontend-url.onrender.com/auth/callback
VITE_GITHUB_CLIENT_ID=your-github-client-id
VITE_GITHUB_REDIRECT_URI=https://your-frontend-url.onrender.com/auth/github-callback
```

### Step 4: Update Frontend axios Configuration

The frontend already supports environment variables in `src/api/axios.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:6969/api';
```

No changes needed if already present.

### Step 5: Create Render Configuration File (Optional but Recommended)

Create `render.yaml` in project root for Infrastructure as Code:

```yaml
services:
  - type: web
    name: mvecommerce-backend
    env: docker
    repo: your-github-repo-url
    dockerfilePath: ./backend/Dockerfile
    region: oregon
    plan: starter
    envVars:
      - key: DATABASE_URL
        value: postgresql://...
      - key: JWT_SECRET
        value: your-secret
      - key: CORS_ALLOWED_ORIGINS
        value: https://your-frontend.onrender.com

  - type: static
    name: mvecommerce-frontend
    repo: your-github-repo-url
    buildCommand: npm install && npm run build
    publishPath: dist
    region: oregon
    plan: free
    envVars:
      - key: VITE_API_URL
        value: https://your-backend.onrender.com/api
```

---

## Database Setup for Render

### Option 1: Use Neon (PostgreSQL) - Recommended

1. Visit [Neon Console](https://console.neon.tech)
2. Create a project
3. Get the connection string
4. Add to backend environment variables as `DATABASE_URL`

### Option 2: Use Render's PostgreSQL

1. In Render Dashboard, create a new **PostgreSQL** database
2. Get the connection info
3. Use it in your backend environment variables

---

## Deployment Checklist

### Before Deploying:

- [ ] Backend:
  - [ ] Update `application.yml` to use environment variables
  - [ ] Create Dockerfile in backend directory
  - [ ] Test locally with Docker: `docker build -t mvecommerce-backend . && docker run -p 6969:6969 mvecommerce-backend`
  - [ ] Push code to GitHub

- [ ] Frontend:
  - [ ] Create `.env` file with `VITE_API_URL`
  - [ ] Test build: `npm run build`
  - [ ] Verify `dist` folder is generated
  - [ ] Push code to GitHub

### After Deployment:

- [ ] Test backend API endpoints from Postman/browser
- [ ] Test frontend connectivity to backend
- [ ] Check CORS configuration (should allow your frontend domain)
- [ ] Monitor logs in Render dashboard for errors
- [ ] Test all authentication flows (login, register, OAuth)

---

## Quick Reference: Environment Variables Summary

### Backend (Server runs on Render)
| Variable | Example | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` | PostgreSQL connection string |
| `JWT_SECRET` | `your-long-secret-key` | JWT token signing secret |
| `CORS_ALLOWED_ORIGINS` | `https://frontend.onrender.com` | Frontend domain for CORS |
| `PORT` | `6969` | Server port (Render assigns automatically) |

### Frontend (Build-time variables)
| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `https://backend.onrender.com/api` | Backend API base URL |

---

## Common Issues & Solutions

### Issue: CORS Error
**Solution**: Update `CORS_ALLOWED_ORIGINS` with exact frontend URL from Render

### Issue: "Cannot find backend"
**Solution**: Ensure `VITE_API_URL` points to correct backend Render URL

### Issue: Database connection fails
**Solution**: Verify `DATABASE_URL` includes `?sslmode=require` for Neon

### Issue: Static site not updating
**Solution**: Redeploy from Render dashboard or push code change to trigger rebuild

---

## After Deployment

1. **Test the application**:
   - Visit frontend URL
   - Try login/register
   - Test product browsing
   - Test admin operations

2. **Monitor performance**:
   - Check Render logs regularly
   - Monitor database connections
   - Check error rates

3. **Security**:
   - Change default JWT secret in production
   - Use strong database passwords
   - Enable SSL/TLS (automatic on Render)
   - Keep dependencies updated

---

## Contact & Support
For deployment issues, check Render documentation or contact Render support.
