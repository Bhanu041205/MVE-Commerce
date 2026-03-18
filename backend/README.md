# MVE Commerce Backend

Spring Boot backend for the MVE Commerce e-commerce platform.

## Project Setup

### Prerequisites
- Java 17 or higher
- Maven 3.8.1 or higher
- MySQL 8.0 or higher

### Installation

1. **Clone/Setup the project**
```bash
cd backend
```

2. **Configure Database**
Edit `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mvecommerce
    username: root
    password: your_password
```

3. **Build the project**
```bash
mvn clean install
```

4. **Run the application**
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile

### Products (Customer)
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product details
- `GET /api/products/search?keyword=...` - Search products
- `GET /api/products/category/:categoryId` - Get products by category

### Products (Admin)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/toggle-active` - Toggle product availability
- `GET /api/products/admin/low-stock` - Get low stock products

### Categories (Customer)
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category details

### Categories (Admin)
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `PATCH /api/categories/:id/toggle-active` - Toggle category

### Cart (Customer)
- `POST /api/cart` - Add item to cart
- `GET /api/cart` - Get cart items
- `PUT /api/cart/:cartItemId` - Update cart item quantity
- `DELETE /api/cart/:cartItemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders (Customer)
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders (paginated)
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/order-number/:orderNumber` - Get order by order number
- `PATCH /api/orders/:id/cancel` - Cancel order

### Orders (Admin)
- `GET /api/orders/admin/all` - Get all orders (paginated)
- `PUT /api/orders/:id/status` - Update order status

### Addresses (Customer)
- `POST /api/addresses` - Create address
- `GET /api/addresses` - Get all addresses
- `GET /api/addresses/:id` - Get address details
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/mvecommerce/
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── controller/          # REST Controllers
│   │   │   ├── service/             # Business logic
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── entity/              # JPA Entities
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── exception/          # Exception handling
│   │   │   └── security/            # JWT and security
│   │   └── resources/
│   │       └── application.yml
│   └── test/
├── pom.xml                          # Maven dependencies
└── README.md
```

## Key Technologies

- **Spring Boot 3.2.2** - Web framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence
- **JWT** - Token-based authentication
- **Hibernate** - ORM
- **MySQL** - Database
- **Lombok** - Boilerplate reduction
- **ModelMapper** - Object mapping

## Database Schema

The application automatically creates the database schema on startup. Key entities:
- `users` - User accounts (Admin/Customer)
- `categories` - Product categories
- `products` - Product catalog
- `cart_items` - User shopping carts
- `addresses` - Delivery addresses
- `orders` - Customer orders
- `order_items` - Items in orders

## Running Tests

```bash
mvn test
```

## Build for Production

```bash
mvn clean package
java -jar target/mvecommerce-backend-1.0.0.jar
```

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in `application.yml`
- Create database: `CREATE DATABASE mvecommerce;`

### Port Already in Use
- Change port in `application.yml`: `server.port: 8081`

### JWT Errors
- Check JWT secret key in `application.yml`
- Verify token format in Authorization header

## Support

For issues or questions, please contact the development team.

---

**Last Updated**: February 2026
**Version**: 1.0.0
