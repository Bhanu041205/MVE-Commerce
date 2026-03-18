# MVE Commerce - E-Commerce Platform

A single-vendor e-commerce website similar to BigBasket/Blinkit with separate Admin and Customer dashboards.

## Project Overview

### Features

**Customer Features:**
- Browse products by category
- Search and filter products
- Add items to cart
- Place orders
- Track order status
- Manage profile and addresses
- View order history

**Admin Features:**
- Product management (CRUD operations)
- Inventory management
- Order management and monitoring
- Category management
- Pricing and promotions
- Vendor analytics
- Customer management

## Tech Stack

### Backend
- **Framework**: Java Spring Boot
- **Database**: MySQL / PostgreSQL
- **ORM**: Hibernate/JPA
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **API**: RESTful API

### Frontend
- **Framework**: React 18+
- **State Management**: Redux/Context API
- **Styling**: Tailwind CSS / Material-UI
- **Package Manager**: npm/yarn
- **HTTP Client**: Axios

## Project Structure

```
MVECommerce/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/mvecommerce/
│   │   │   │       ├── config/          # Configuration classes
│   │   │   │       ├── controller/      # REST Controllers
│   │   │   │       ├── service/         # Business logic
│   │   │   │       ├── repository/      # Data access layer
│   │   │   │       ├── entity/          # JPA Entities
│   │   │   │       ├── dto/             # Data Transfer Objects
│   │   │   │       ├── exception/      # Custom Exceptions
│   │   │   │       └── MveCommerceApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml      # Application configuration
│   │   │       └── db/migration/        # Flyway migrations
│   │   └── test/
│   ├── pom.xml                          # Maven configuration
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── customer/               # Customer pages
│   │   │   └── admin/                  # Admin pages
│   │   ├── components/                 # Reusable components
│   │   ├── services/                   # API services
│   │   ├── store/                      # Redux store
│   │   ├── styles/                     # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
└── README.md (this file)
```

## Database Schema Overview

### Core Entities
- **User**: Admin and Customer information
- **Product**: Product details, pricing, inventory
- **Category**: Product categories
- **Cart**: Shopping cart items
- **Order**: Customer orders
- **OrderItem**: Items in an order
- **Address**: Customer delivery addresses

## API Endpoints (Brief Overview)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Products (Customer)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `GET /api/products/search` - Search products

### Products (Admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/products` - Get all products

### Cart & Orders
- `POST /api/cart` - Add to cart
- `DELETE /api/cart/:itemId` - Remove from cart
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders

### Admin Dashboard
- `GET /api/admin/dashboard/stats` - Get analytics
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id` - Update order status

## Quick Start Guide

### Prerequisites
- Java 17+
- MySQL 8.0+
- Node.js 16+
- npm or yarn

### Backend Setup (Spring Boot)

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Configure MySQL Database**
```bash
# Create database
mysql -u root -p
CREATE DATABASE mvecommerce;
USE mvecommerce;
EXIT;
```

3. **Update application.yml**
Edit `src/main/resources/application.yml` with your database credentials:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mvecommerce
    username: root
    password: your_mysql_password
```

4. **Build and Run**
```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

Backend will start at: `http://localhost:8080/api`

### Frontend Setup (React)

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
```

4. **Start development server**
```bash
npm start
```

Frontend will open at: `http://localhost:3000`

### Docker Setup (Optional)

```bash
# Build backend image
docker build -t mvecommerce-backend:1.0 ./backend

# Build frontend image
docker build -t mvecommerce-frontend:1.0 ./frontend

# Run with docker-compose (if you have docker-compose.yml in root)
docker-compose up -d
```

## Environment Configuration

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mvecommerce
    username: root
    password: password
  jpa:
    hibernate:
      ddl-auto: update
  
jwt:
  secret: your-secret-key
  expiration: 86400000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8080/api
```

## Security Considerations

- JWT token-based authentication
- Role-based access control (RBAC)
- Password encryption using BCrypt
- CORS configuration
- Input validation and sanitization
- SQL injection prevention

## Development Workflow

1. Create feature branches
2. Develop features with TDD approach
3. Write unit and integration tests
4. Submit pull requests for code review
5. Deploy to staging before production

## Next Steps

### 1. **Populate Demo Data**
Create demo categories, products, and admin account after starting the backend:
```bash
# Use the API endpoints to create:
# - Categories (use Admin account)
# - Products
# - Sample Orders (use Customer account)
```

### 2. **Frontend Development**
Key pages to complete:
- [ ] ProductDetail - Enhanced product view with reviews
- [ ] Cart - Full cart management with checkout
- [ ] Checkout - Address selection and payment
- [ ] Orders - Order tracking with status updates
- [ ] Profile - User profile and address management
- [ ] Admin Dashboard - Analytics and reporting
- [ ] Admin Products - Product CRUD interface
- [ ] Admin Categories - Category management
- [ ] Admin Orders - Order list and status updates

### 3. **Backend Refinements**
Planned enhancements:
- [ ] Review and rating system
- [ ] Wishlist functionality
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Inventory management dashboard
- [ ] Advanced analytics
- [ ] Discount/coupon system

### 4. **Testing**
- [ ] Unit tests for backend services
- [ ] Integration tests for API endpoints
- [ ] Frontend component tests
- [ ] E2E testing with test accounts

### 5. **Deployment**
- [ ] Backend: AWS EC2, Heroku, or DigitalOcean
- [ ] Frontend: Vercel, Netlify, or AWS S3
- [ ] Database: AWS RDS or managed MySQL hosting
- [ ] CDN: CloudFlare or AWS CloudFront

## Demo Credentials

### Admin Account
- **Email**: admin@demo.com
- **Password**: password123
- **Role**: Admin (Full access to manage products, categories, orders)

### Customer Account
- **Email**: customer@demo.com
- **Password**: password123
- **Role**: Customer (Can browse, purchase, and track orders)

**Note**: Create these accounts by registering through the `/register` endpoint or register page.

## Troubleshooting

### Backend Issues

**Port 8080 Already in Use**
```bash
# Change port in application.yml
server:
  port: 8081
```

**Database Connection Failed**
```bash
# Verify MySQL is running
# Windows
net start MySQL80

# Linux/Mac
mysql.server start
```

**JWT Token Issues**
- Clear localStorage in browser: `localStorage.clear()`
- Ensure JWT secret key is set in `application.yml`
- Check token expiration time

### Frontend Issues

**Port 3000 Already in Use**
```bash
PORT=3001 npm start
```

**Dependencies Not Installing**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**API Connection Failed**
- Verify backend is running on `http://localhost:8080`
- Check `.env` file has correct `REACT_APP_API_URL`
- Check browser network tab for CORS errors
- Verify CORS is enabled in backend SecurityConfig

## Performance Optimization

### Backend
- Use database indexes on frequently queried fields
- Implement caching for product lists
- Use pagination for large datasets
- Enable compression in Spring

### Frontend
- Implement code splitting and lazy loading
- Use React memo for component optimization
- Optimize images with proper formats
- Use Redux for state management efficiency

## Security Best Practices

✅ **Implemented**
- JWT authentication with token validation
- Password encryption using BCrypt
- CORS configuration for allowed origins
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention via JPA

🔐 **Recommended for Production**
- HTTPS/SSL certificates
- Rate limiting on API endpoints
- Database encryption at rest
- Secure password reset flow
- Two-factor authentication (2FA)
- Regular security audits
- API request signing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Project Statistics

- **Backend**: Java Spring Boot 3.2.2, REST API with 20+ endpoints
- **Frontend**: React 18 with Redux, responsive design
- **Database**: MySQL 8.0 with 8 core entities
- **Pages**: 14 pages (6 customer + 4 admin + 2 auth + home)
- **Components**: 5+ reusable components

## File Structure Summary

```
MVECommerce/
├── backend/                          # Spring Boot Application
│   ├── pom.xml
│   ├── src/main/java/com/mvecommerce/
│   │   ├── config/                  # 2 files
│   │   ├── controller/              # 6 files
│   │   ├── service/                 # 5 files
│   │   ├── repository/              # 6 files
│   │   ├── entity/                  # 7 files
│   │   ├── dto/                     # 11 files
│   │   ├── exception/               # 5 files
│   │   ├── security/                # 4 files
│   │   └── MveCommerceApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── README.md
├── frontend/                         # React Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/                     # 2 files
│   │   ├── components/              # 3 files
│   │   ├── pages/                   # 11 files
│   │   ├── store/                   # 3 files
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
└── README.md                         # This file
```

## Useful Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [JWT Guide](https://jwt.io)
- [REST API Best Practices](https://restfulapi.net)
