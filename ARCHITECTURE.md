# MVE Commerce - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                    │
├────────────────┬─────────────────────────┬──────────────────┤
│ Admin Portal   │   Customer Portal       │   Shared         │
├────────────────┼─────────────────────────┼──────────────────┤
│ • Dashboard    │ • Home                  │ • Navigation     │
│ • Products     │ • Products Catalog      │ • Footer         │
│ • Categories   │ • Shopping Cart         │ • Authentication │
│ • Orders       │ • Checkout              │ • Components     │
│                │ • Order History         │                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Spring Boot REST API)             │
│                    Port: 8080                               │
├─────────────────────────────────────────────────────────────┤
│ • Authentication (JWT)                                      │
│ • CORS Configuration                                        │
│ • Request/Response Handling                                 │
│ • Error Handling                                            │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           APPLICATION LAYER (Spring Boot Services)          │
├────────────────┬─────────────────────────┬──────────────────┤
│ Service Layer  │  Repository Layer       │  Security        │
├────────────────┼─────────────────────────┼──────────────────┤
│ • AuthService  │ • UserRepository        │ • JwtProvider    │
│ • ProductService│ • ProductRepository    │ • JwtFilter      │
│ • CategoryService│ • CategoryRepository   │ • SecurityConfig │
│ • CartService  │ • OrderRepository       │ • CustomUserDetails│
│ • OrderService │ • AddressRepository     │                  │
│ • AddressService│                        │                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            DATABASE LAYER (MySQL 8.0)                       │
├─────────────────────────────────────────────────────────────┤
│ Tables:                                                     │
│ • users           • order_items                             │
│ • categories      • addresses                               │
│ • products        • cart_items                              │
│ • orders                                                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Diagram

### Frontend Architecture (React)
```
App (Root)
├── Routes
│   ├── Public Routes
│   │   ├── /login (Login Component)
│   │   ├── /register (Register Component)
│   │   └── / (Home Component)
│   ├── Protected Customer Routes
│   │   ├── /products (Products Component)
│   │   ├── /cart (Cart Component)
│   │   ├── /checkout (Checkout Component)
│   │   ├── /orders (Orders Component)
│   │   └── /profile (Profile Component)
│   └── Protected Admin Routes
│       ├── /admin/dashboard (Dashboard Component)
│       ├── /admin/products (AdminProducts Component)
│       ├── /admin/categories (AdminCategories Component)
│       └── /admin/orders (AdminOrders Component)
├── Redux Store
│   ├── Auth Slice (User, Token)
│   └── Cart Slice (Items, Total)
├── API Services (axios)
│   └── endpoints.js (All API calls)
└── Shared Components
    ├── Navbar
    ├── Footer
    └── Spinner
```

### Backend Architecture (Spring Boot)
```
Application (com.mvecommerce)
├── Config
│   ├── SecurityConfig (JWT, CORS)
│   ├── ApplicationConfig (ModelMapper)
│   └── CustomUserDetailsService (Auth)
├── Controller
│   ├── AuthController (/auth)
│   ├── ProductController (/products)
│   ├── CategoryController (/categories)
│   ├── CartController (/cart)
│   ├── OrderController (/orders)
│   └── AddressController (/addresses)
├── Service
│   ├── AuthService
│   ├── ProductService
│   ├── CategoryService
│   ├── CartService
│   ├── OrderService
│   └── AddressService
├── Repository
│   ├── UserRepository
│   ├── ProductRepository
│   ├── CategoryRepository
│   ├── CartItemRepository
│   ├── OrderRepository
│   ├── OrderItemRepository
│   └── AddressRepository
├── Entity (Domain Model)
│   ├── User (Admin/Customer)
│   ├── Product
│   ├── Category
│   ├── CartItem
│   ├── Order
│   ├── OrderItem
│   └── Address
├── DTO (Data Transfer Objects)
│   └── [Request/Response Objects]
├── Exception (Error Handling)
│   ├── GlobalExceptionHandler
│   ├── ResourceNotFoundException
│   ├── BadRequestException
│   └── UnauthorizedException
└── Security
    ├── JwtProvider (Token generation)
    ├── JwtAuthenticationFilter
    ├── CustomUserDetails
    └── SecurityUtil
```

## Database Schema

```sql
-- Users Table
users
├── id (PK)
├── email (UNIQUE)
├── password (encrypted)
├── firstName
├── lastName
├── phone
├── role (ENUM: ADMIN, CUSTOMER)
├── isActive
├── createdAt
└── updatedAt

-- Categories Table
categories
├── id (PK)
├── name (UNIQUE)
├── description
├── imageUrl
├── isActive
├── createdAt
└── updatedAt

-- Products Table
products
├── id (PK)
├── name
├── description
├── price
├── stock
├── imageUrl
├── images (Multiple images)
├── discount
├── categoryId (FK)
├── isActive
├── rating
├── reviewCount
├── createdAt
└── updatedAt

-- Cart Items Table
cart_items
├── id (PK)
├── userId (FK)
├── productId (FK)
├── quantity
├── createdAt
└── updatedAt

-- Orders Table
orders
├── id (PK)
├── userId (FK)
├── addressId (FK)
├── orderNumber (UNIQUE)
├── status (ENUM: PENDING, CONFIRMED, PROCESSING, SHIPPED, etc.)
├── totalAmount
├── discountAmount
├── taxAmount
├── notes
├── createdAt
├── estimatedDeliveryDate
├── deliveredAt
└── updatedAt

-- Order Items Table
order_items
├── id (PK)
├── orderId (FK)
├── productId (FK)
├── quantity
├── priceAtPurchase
├── discountApplied
├── createdAt
└── updatedAt

-- Addresses Table
addresses
├── id (PK)
├── userId (FK)
├── addressLine1
├── addressLine2
├── city
├── state
├── postalCode
├── country
├── phone
├── isDefault
├── createdAt
└── updatedAt
```

## Authentication Flow

```
1. User Registration
   ┌─────────────────┐
   │User Registration│
   └────────┬────────┘
            │
            ▼
   ┌─────────────────────┐
   │Validate Input Data  │
   └────────┬────────────┘
            │
            ▼
   ┌──────────────────────┐
   │Check Email Exists    │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │Encrypt Password      │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │Save User to Database │
   └────────┬─────────────┘
            │
            ▼
   ┌──────────────────────┐
   │Return Success Message│
   └──────────────────────┘

2. User Login
   ┌─────────────────┐
   │User Login       │
   └────────┬────────┘
            │
            ▼
   ┌──────────────────────────┐
   │Authenticate Credentials  │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │Generate JWT Token        │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │Return Token & User Info  │
   └──────────────────────────┘

3. Authenticated Requests
   ┌──────────────────────────┐
   │Request with JWT Token    │
   │(Authorization Header)    │
   └────────┬─────────────────┘
            │
            ▼
   ┌──────────────────────────┐
   │JwtAuthenticationFilter   │
   └────────┬─────────────────┘
            │
            ▼
   ┌───────────────────────────┐
   │Validate Token Signature   │
   └────────┬──────────────────┘
            │
            ▼
   ┌────────────────────────────┐
   │Extract User from Token     │
   └────────┬───────────────────┘
            │
            ▼
   ┌────────────────────────────┐
   │Load User Details (RBAC)    │
   └────────┬───────────────────┘
            │
            ▼
   ┌────────────────────────────┐
   │Process Request             │
   └────────────────────────────┘
```

## API Flow Example: Place Order

```
Customer UI
    │
    └─► POST /orders
         (with cart items & address)
            │
            ▼
    OrderController
         │
         └─► OrderService.createOrder()
              │
              ├─► Validate Cart Items
              ├─► Validate Address
              ├─► Calculate Total
              ├─► Create Order entity
              ├─► Create OrderItems
              ├─► Update Product Stock
              ├─► Clear Cart
              │
              └─► Save to DB
                  │
                  ▼
              OrderRepository.save()
                  │
                  ▼
              MySQL (orders, order_items)
                  │
                  ▼
              Return OrderDTO
                  │
                  ▼
            OrderController
              │
              ▼
          Status: 201 Created
              │
              ▼
          Customer UI
```

## Deployment Architecture

```
┌──────────────────────────────────────┐
│        Production Environment        │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ CDN/Cloudflare│  │  Frontend   │  │
│  │  (Vercel)    │  │  (React)    │  │
│  └──────┬───────┘  └──────┬──────┘  │
│         │                 │          │
│         └────────┬────────┘          │
│                  │                   │
│              HTTPS/SSL               │
│                  │                   │
│         ┌────────▼─────────┐         │
│         │  API Gateway     │         │
│         │  (AWS ALB)       │         │
│         └────────┬─────────┘         │
│                  │                   │
│         ┌────────▼──────────┐        │
│         │  Backend Service  │        │
│         │  (Spring Boot)    │        │
│         │  (Docker/EC2)     │        │
│         └────────┬──────────┘        │
│                  │                   │
│         ┌────────▼──────────┐        │
│         │  Database         │        │
│         │  (AWS RDS MySQL)  │        │
│         └───────────────────┘        │
│                                      │
└──────────────────────────────────────┘
```

## Security Considerations

### Authentication & Authorization
- ✅ JWT Token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password encryption with BCrypt
- ✅ Token expiration and refresh

### API Security
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (JPA)
- ✅ Exception handling with proper error messages

### Data Protection
- ⚠️ HTTPS/SSL (recommended for production)
- ⚠️ Database encryption at rest (recommended)
- ⚠️ Sensitive data logging (avoid in production)

## Performance Optimization

### Database
- Indexes on frequently queried columns
- Connection pooling
- Query optimization with JPA
- Pagination for list endpoints

### Frontend
- Code splitting with React.lazy()
- Component memoization
- Image optimization
- Redux for efficient state management

### Backend
- Request/response compression
- Caching strategies
- Async processing for heavy operations
- Connection pooling

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancing with multiple instances
- Shared session management if needed
- Distributed caching (Redis)

### Vertical Scaling
- Database optimization
- Efficient algorithms
- Resource pooling

### Future Enhancements
- Microservices architecture
- API rate limiting
- Advanced caching layer
- Message queue for async operations (RabbitMQ/Kafka)

---

**Last Updated**: February 2026
**Version**: 1.0.0
