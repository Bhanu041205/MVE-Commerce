# MVE Commerce - Quick Start Guide

## Default Admin Credentials
- **Email:** admin@mvecommerce.com
- **Password:** admin123

> These are auto-created on startup by `DataInitializer.java` if the admin account doesn't already exist.

## 5-Minute Setup

### Prerequisites
- Java 17 (JDK)
- MySQL 8.0
- Node.js 16+
- Git

### Step 1: Setup Backend (2 minutes)

```bash
# 1. Start MySQL
# Windows
net start MySQL80
# macOS
brew services start mysql
# Linux
sudo systemctl start mysql

# 2. Create database
mysql -u root -p
CREATE DATABASE mvecommerce;
EXIT;

# 3. Configure application
cd backend
# Edit src/main/resources/application.yml
# Update database credentials

# 4. Start backend
mvn spring-boot:run
# Backend runs on: http://localhost:8080/api
```

### Step 2: Setup Frontend (2 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env

# Start frontend
npm start
# Frontend opens at: http://localhost:3000
```

### Step 3: Login (1 minute)

Use these demo credentials:

**Customer Login:**
- Email: customer@demo.com
- Password: password123

**Admin Login:**
- Email: admin@demo.com
- Password: password123

## First Steps After Startup

1. **Browse Products** (Customer)
   - Click "Products" in navbar
   - Select category to filter
   - Click "View" to see product details
   - Add items to cart

2. **Manage Products** (Admin)
   - Go to `/admin/products`
   - Create, update, or delete products
   - Monitor inventory

3. **Create Custom Categories**
   - Admin: `/admin/categories`
   - Create new categories for products

## Common Commands

### Backend
```bash
# Run tests
mvn test

# Build JAR
mvn clean package

# Run with different port
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Frontend
```bash
# Run tests
npm test

# Build for production
npm run build

# Start on different port
PORT=3001 npm start
```

## API Testing

Use tools like Postman or Insomnia to test endpoints:

```
POST http://localhost:8080/api/auth/login
{
  "email": "admin@demo.com",
  "password": "password123"
}
```

Response includes JWT token for authentication.

## File Locations

- **Backend Config**: `backend/src/main/resources/application.yml`
- **Database Scripts**: `backend/src/main/resources/db/migration/`
- **Frontend Config**: `frontend/.env`
- **Frontend Pages**: `frontend/src/pages/`

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in config or kill process |
| Database connection failed | Verify MySQL is running and credentials are correct |
| CORS errors | Check backend CORS config, frontend API URL |
| Token expired | Clear localStorage and login again |
| API not found | Verify backend is running on port 8080 |

## Next Development Steps

1. ✅ Setup complete
2. 🔄 Populate initial data (categories, products)
3. 📝 Implement advanced pages (Cart, Checkout, Orders)
4. 👨‍💼 Complete admin dashboard
5. 🧪 Add tests
6. 🚀 Deploy to production

## Support

For detailed documentation, see:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [Main README](./README.md)

---

**Happy Coding! 🚀**
