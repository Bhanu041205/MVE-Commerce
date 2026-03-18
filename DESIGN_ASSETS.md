# MVE Commerce — Design Assets Documentation

## Project: MVE Commerce (Single-Vendor E-Commerce Platform)
## Tech Stack: Java Spring Boot + React 18 + MySQL 8.0 + Redux + Tailwind CSS

---

## Summary of All Design Diagrams

| #  | Diagram Name | Type | Description |
|----|-------------|------|-------------|
| 1  | ER Diagram | Database Design | 7 tables with PKs, FKs, data types, and relationships |
| 2  | System Architecture | Architecture | 4-tier layered architecture (Client → API → Service → DB) |
| 3  | Use Case Diagram | Behavioral | 27 use cases across 3 actors (Guest, Customer, Admin) |
| 4  | Auth Sequence Diagram | Behavioral | Registration, Login (JWT), authenticated request flows |
| 5  | Shopping & Order Sequence | Behavioral | Add-to-cart and checkout/place-order step-by-step |
| 6  | Class Diagram | Structural | 7 entity classes + 2 enums with attributes & relationships |
| 7  | DFD Level 0 (Context) | Data Flow | High-level context with external entities |
| 8  | DFD Level 1 (Detailed) | Data Flow | Detailed data flow through 5 core processes |
| 9  | Order State Diagram | Behavioral | Order lifecycle: PENDING → DELIVERED / CANCELLED |
| 10 | Deployment Architecture | Infrastructure | Servers, ports, and external service connections |
| 11 | API Endpoints Map | Technical | All 38+ REST endpoints organized by domain |

---

## 1. ER Diagram (Entity Relationship Diagram)

**Purpose:** Shows the complete database schema with all tables, their columns, data types, primary keys, foreign keys, and inter-table relationships.

### Tables & Columns

#### Table 1: `users`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User login email |
| password | VARCHAR(255) | NOT NULL | BCrypt encrypted password |
| first_name | VARCHAR(255) | NOT NULL | User's first name |
| last_name | VARCHAR(255) | NOT NULL | User's last name |
| phone | VARCHAR(20) | NOT NULL | Contact phone number |
| role | VARCHAR(50) | NOT NULL | ADMIN or CUSTOMER |
| is_active | BOOLEAN | DEFAULT true | Account active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### Table 2: `categories`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| name | VARCHAR(255) | NOT NULL | Category name (Seeds, Dals, Nuts, etc.) |
| description | TEXT | | Category description |
| image_url | VARCHAR(255) | | Category image path |
| is_active | BOOLEAN | DEFAULT true | Category visibility |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### Table 3: `products`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | TEXT | | Product description |
| price | NUMERIC(10,2) | NOT NULL | Product price |
| stock | INTEGER | NOT NULL | Available stock quantity |
| image_url | VARCHAR(255) | | Main product image |
| images | TEXT | | Additional product images |
| discount | NUMERIC(10,2) | DEFAULT 0 | Discount percentage |
| category_id | BIGINT | FOREIGN KEY → categories(id) | Category reference |
| is_active | BOOLEAN | DEFAULT true | Product visibility |
| rating | NUMERIC(3,2) | DEFAULT 0 | Average rating |
| review_count | INTEGER | DEFAULT 0 | Number of reviews |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### Table 4: `addresses`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| user_id | BIGINT | FOREIGN KEY → users(id) | Owner user reference |
| full_name | VARCHAR(255) | NOT NULL | Recipient name |
| phone | VARCHAR(20) | NOT NULL | Recipient phone |
| street | VARCHAR(255) | NOT NULL | Street address |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(100) | NOT NULL | State |
| postal_code | VARCHAR(20) | NOT NULL | ZIP/Postal code |
| country | VARCHAR(100) | NOT NULL | Country |
| is_default | BOOLEAN | DEFAULT false | Default address flag |
| is_active | BOOLEAN | DEFAULT true | Address active status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | | Last update timestamp |

#### Table 5: `orders`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | System-generated order number |
| user_id | BIGINT | FOREIGN KEY → users(id) | Customer who placed order |
| total_amount | NUMERIC(10,2) | NOT NULL | Total order amount |
| total_items | INTEGER | NOT NULL | Total number of items |
| status | VARCHAR(50) | DEFAULT 'PENDING' | PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED |
| address_id | BIGINT | FOREIGN KEY → addresses(id) | Delivery address |
| created_at | TIMESTAMP | DEFAULT NOW() | Order placement timestamp |
| updated_at | TIMESTAMP | | Last status update timestamp |

#### Table 6: `order_items`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| order_id | BIGINT | FOREIGN KEY → orders(id) | Parent order reference |
| product_id | BIGINT | FOREIGN KEY → products(id) | Product reference |
| product_name | VARCHAR(255) | NOT NULL | Product name snapshot at purchase |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| price | NUMERIC(10,2) | NOT NULL | Price at time of purchase |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

#### Table 7: `cart_items`
| Column | Data Type | Constraint | Description |
|--------|-----------|------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Auto-increment unique identifier |
| user_id | BIGINT | FOREIGN KEY → users(id) | Cart owner |
| product_id | BIGINT | FOREIGN KEY → products(id) | Product in cart |
| quantity | INTEGER | DEFAULT 1 | Quantity in cart |
| created_at | TIMESTAMP | DEFAULT NOW() | Added to cart timestamp |
| updated_at | TIMESTAMP | | Last quantity update |

### Relationships
| From Table | To Table | Relationship | Foreign Key |
|-----------|----------|--------------|-------------|
| users | addresses | One-to-Many | addresses.user_id → users.id |
| users | orders | One-to-Many | orders.user_id → users.id |
| users | cart_items | One-to-Many | cart_items.user_id → users.id |
| categories | products | One-to-Many | products.category_id → categories.id |
| orders | order_items | One-to-Many | order_items.order_id → orders.id |
| products | order_items | One-to-Many | order_items.product_id → products.id |
| products | cart_items | One-to-Many | cart_items.product_id → products.id |
| addresses | orders | One-to-Many | orders.address_id → addresses.id |

### Database Indexes
| Index Name | Table | Column | Purpose |
|-----------|-------|--------|---------|
| idx_products_category | products | category_id | Fast category filtering |
| idx_orders_user | orders | user_id | Fast user order lookup |
| idx_orders_status | orders | status | Fast status filtering |
| idx_addresses_user | addresses | user_id | Fast address lookup |
| idx_cart_items_user | cart_items | user_id | Fast cart retrieval |
| idx_order_items_order | order_items | order_id | Fast order item lookup |

---

## 2. System Architecture Diagram

**Purpose:** Shows the 4-tier layered architecture of the entire application from client to database.

### Architecture Layers

| Layer | Technology | Components | Port |
|-------|-----------|------------|------|
| **Client Layer** | React 18 + Redux + Tailwind CSS | Public Pages, Customer Portal, Admin Portal, Shared Components, Redux Store | :3000 |
| **API Layer** | Spring Boot REST API | 6 Controllers, JWT Security, CORS Config | :6969 |
| **Service Layer** | Spring Boot Services | AuthService, ProductService, CategoryService, CartService, OrderService, AddressService | — |
| **Repository Layer** | Spring Data JPA | UserRepo, ProductRepo, CategoryRepo, CartItemRepo, OrderRepo, OrderItemRepo, AddressRepo | — |
| **Database Layer** | MySQL 8.0 | 7 Tables, 6 Indexes | :3306 |

### Communication Flow
| From | To | Protocol | Auth |
|------|----|----------|------|
| React Frontend | Spring Boot API | HTTP/REST (JSON) | JWT Bearer Token |
| Spring Boot API | Service Layer | Java method calls | — |
| Service Layer | Repository Layer | JPA interface calls | — |
| Repository Layer | MySQL Database | JDBC / Hibernate | Connection Pool |
| React Frontend | Google OAuth | HTTPS | OAuth 2.0 Client ID |

---

## 3. Use Case Diagram

**Purpose:** Shows all functionalities available to each type of user (actor).

### Actors & Use Cases

#### Actor 1: Guest (Unauthenticated User)
| # | Use Case | API Endpoint | Page |
|---|----------|-------------|------|
| 1 | Register Account | POST /auth/register | /register |
| 2 | Login with Email/Password | POST /auth/login | /login |
| 3 | Login with Google OAuth | POST /auth/google-login | /login |
| 4 | Forgot Password + OTP | POST /auth/forgot-password, /verify-otp, /reset-password | /forgot-password |
| 5 | Browse Products | GET /products | /products |
| 6 | Search Products | GET /products/search | /products |
| 7 | Filter by Category | GET /products/category/{id} | /products |
| 8 | View Product Detail | GET /products/{id} | /products/:id |

#### Actor 2: Customer (Authenticated, role=CUSTOMER)
| # | Use Case | API Endpoint | Page |
|---|----------|-------------|------|
| 9 | Add to Cart | POST /cart | /products |
| 10 | Update Cart Quantity | PUT /cart/{id} | /cart |
| 11 | Remove from Cart | DELETE /cart/{id} | /cart |
| 12 | Clear Entire Cart | DELETE /cart | /cart |
| 13 | Checkout / Place Order | POST /orders | /checkout |
| 14 | View My Orders | GET /orders | /orders |
| 15 | View Order Detail | GET /orders/{id} | /orders/:id |
| 16 | Cancel Order | PATCH /orders/{id}/cancel | /orders/:id |
| 17 | Track Order Status | GET /orders/{id} | /orders/:id |
| 18 | View Profile | GET /auth/me | /profile |
| 19 | Manage Addresses (CRUD) | GET/POST/PUT/DELETE /addresses | /profile |
| 20 | Set Default Address | PUT /addresses/{id} | /profile |

#### Actor 3: Admin (Authenticated, role=ADMIN)
| # | Use Case | API Endpoint | Page |
|---|----------|-------------|------|
| 21 | View Dashboard Analytics | GET /orders/admin/stats + multiple | /admin/dashboard |
| 22 | Create Product | POST /products | /admin/products |
| 23 | Edit Product | PUT /products/{id} | /admin/products |
| 24 | Delete Product | DELETE /products/{id} | /admin/products |
| 25 | Create/Edit/Delete Categories | POST/PUT/DELETE /categories | /admin/categories |
| 26 | View All Orders | GET /orders/admin/all | /admin/orders |
| 27 | Update Order Status | PUT /orders/{id}/status | /admin/orders |
| 28 | View Low Stock Alerts | GET /products/admin/low-stock | /admin/dashboard |
| 29 | Toggle Product Active/Inactive | PATCH /products/{id}/toggle-active | /admin/products |
| 30 | Toggle Category Active/Inactive | PATCH /categories/{id}/toggle-active | /admin/categories |

---

## 4. Authentication Sequence Diagram

**Purpose:** Shows step-by-step flow for Registration, Login, and Authenticated API requests.

### Flow 1: User Registration
| Step | Actor | Action | Details |
|------|-------|--------|---------|
| 1 | User | Fill registration form | firstName, lastName, email, phone, password |
| 2 | React | POST /auth/register | Send DTO to AuthController |
| 3 | AuthController | Call AuthService.registerUser() | Delegate to service |
| 4 | AuthService | Check email exists in DB | SELECT from users WHERE email = ? |
| 5 | MySQL | Return: Email not found | Validation passed |
| 6 | AuthService | Encrypt password | BCrypt hashing |
| 7 | AuthService | Save user to DB | INSERT into users (role = CUSTOMER) |
| 8 | MySQL | Return: User saved | Success |
| 9 | AuthController | Return 200 OK | "Registration successful" |
| 10 | React | Redirect to /login | Show success message |

### Flow 2: User Login (JWT)
| Step | Actor | Action | Details |
|------|-------|--------|---------|
| 1 | User | Enter email + password | Login form |
| 2 | React | POST /auth/login | Send credentials |
| 3 | AuthService | Find user by email | SELECT from users |
| 4 | AuthService | Verify password | BCrypt.matches() |
| 5 | JwtProvider | Generate JWT token | HS256 algorithm, includes userId, email, role |
| 6 | AuthController | Return token + user info | {token, firstName, lastName, email, role} |
| 7 | React | Store in Redux + localStorage | Persist authentication state |
| 8 | React | Redirect | Customer → /home, Admin → /admin/dashboard |

### Flow 3: Authenticated Request
| Step | Actor | Action | Details |
|------|-------|--------|---------|
| 1 | React | Send request with header | Authorization: Bearer {JWT token} |
| 2 | JwtAuthFilter | Intercept request | Extract token from header |
| 3 | JwtProvider | Validate token signature | Verify HS256 signature + expiry |
| 4 | CustomUserDetailsService | Load user from DB | Find by email from token |
| 5 | SecurityContext | Set authentication | UsernamePasswordAuthenticationToken |
| 6 | Controller | Process request | Role-based access check (ADMIN/CUSTOMER) |
| 7 | React | Receive response | Display data to user |

---

## 5. Shopping & Order Sequence Diagram

**Purpose:** Shows the complete flow from adding items to cart through placing an order.

### Flow 1: Add to Cart
| Step | Actor | Action | Details |
|------|-------|--------|---------|
| 1 | Customer | Click "Add to Cart" | On product card or detail page |
| 2 | React | POST /cart {productId, quantity} | Authenticated request |
| 3 | CartController | Call CartService.addToCart() | userId from JWT, productId, qty |
| 4 | CartService | Check product exists & stock > 0 | Validate product availability |
| 5 | CartService | Check if already in cart | Prevent duplicates (update qty if exists) |
| 6 | CartService | INSERT cart_item | Save new cart entry |
| 7 | CartController | Return CartItemDTO | 200 OK |
| 8 | React | Update Redux cart state | Increment badge count |
| 9 | React | Show toast notification | "Added to cart" message |

### Flow 2: Place Order (Checkout)
| Step | Actor | Action | Details |
|------|-------|--------|---------|
| 1 | Customer | Click "Place Order" | On checkout page with selected address |
| 2 | React | POST /orders {addressId} | Authenticated request |
| 3 | OrderService | Fetch all cart items for user | SELECT from cart_items WHERE user_id = ? |
| 4 | OrderService | Validate all products in stock | Check stock >= ordered quantity |
| 5 | OrderService | Fetch delivery address | SELECT from addresses WHERE id = ? |
| 6 | OrderService | Calculate total amount | SUM(price × quantity) for all items |
| 7 | OrderService | Generate unique order number | Format: ORD-{timestamp}-{random} |
| 8 | OrderService | INSERT order record | status = PENDING, total_amount, total_items |
| 9 | OrderService | INSERT order_items | One row per cart item with price snapshot |
| 10 | OrderService | UPDATE product stock | Decrement stock by ordered quantity |
| 11 | OrderService | DELETE cart items | Clear user's entire cart |
| 12 | OrderController | Return 201 Created | OrderDTO with orderNumber, total, status |
| 13 | React | Clear Redux cart state | Reset cart count to 0 |
| 14 | React | Show order confirmation | Display order number and details |

---

## 6. Class Diagram (Domain Model)

**Purpose:** Shows all JPA entity classes with their attributes, data types, and relationships.

### Entity Classes

#### User Entity
| Attribute | Type | Annotation | Description |
|-----------|------|------------|-------------|
| id | Long | @Id @GeneratedValue | Primary key |
| email | String | @Column(unique=true) | Login email |
| password | String | @Column | BCrypt hashed |
| firstName | String | @Column | First name |
| lastName | String | @Column | Last name |
| phone | String | @Column | Phone number |
| role | Role (Enum) | @Enumerated | ADMIN or CUSTOMER |
| isActive | Boolean | @Column | Account status |
| createdAt | LocalDateTime | @Column | Registration time |
| updatedAt | LocalDateTime | @Column | Last update |

#### Product Entity
| Attribute | Type | Annotation | Description |
|-----------|------|------------|-------------|
| id | Long | @Id @GeneratedValue | Primary key |
| name | String | @Column | Product name |
| description | String | @Column(TEXT) | Full description |
| price | BigDecimal | @Column | Product price |
| stock | Integer | @Column | Available stock |
| imageUrl | String | @Column | Main image path |
| images | String | @Column(TEXT) | Additional images |
| discount | BigDecimal | @Column | Discount % |
| category | Category | @ManyToOne | FK to categories |
| isActive | Boolean | @Column | Visibility |
| rating | BigDecimal | @Column | Average rating |
| reviewCount | Integer | @Column | Number of reviews |

#### Category Entity
| Attribute | Type | Description |
|-----------|------|-------------|
| id | Long | Primary key |
| name | String | Category name |
| description | String | Description |
| imageUrl | String | Category image |
| isActive | Boolean | Visibility |
| products | List\<Product\> | @OneToMany mapped products |

#### Order Entity
| Attribute | Type | Description |
|-----------|------|-------------|
| id | Long | Primary key |
| orderNumber | String | Unique order ID |
| user | User | @ManyToOne buyer |
| totalAmount | BigDecimal | Total price |
| totalItems | Integer | Item count |
| status | OrderStatus (Enum) | Current status |
| address | Address | @ManyToOne delivery address |
| orderItems | List\<OrderItem\> | @OneToMany items |

#### OrderItem Entity
| Attribute | Type | Description |
|-----------|------|-------------|
| id | Long | Primary key |
| order | Order | @ManyToOne parent order |
| product | Product | @ManyToOne product ref |
| productName | String | Name snapshot |
| quantity | Integer | Qty ordered |
| price | BigDecimal | Price at purchase |

#### CartItem Entity
| Attribute | Type | Description |
|-----------|------|-------------|
| id | Long | Primary key |
| user | User | @ManyToOne cart owner |
| product | Product | @ManyToOne product |
| quantity | Integer | Quantity in cart |

#### Address Entity
| Attribute | Type | Description |
|-----------|------|-------------|
| id | Long | Primary key |
| user | User | @ManyToOne owner |
| fullName | String | Recipient name |
| phone | String | Recipient phone |
| street | String | Street address |
| city | String | City |
| state | String | State |
| postalCode | String | ZIP code |
| country | String | Country |
| isDefault | Boolean | Default flag |

### Enumerations

#### Role Enum
| Value | Description |
|-------|-------------|
| ADMIN | Administrator with full access |
| CUSTOMER | Regular shopping user |

#### OrderStatus Enum
| Value | Description |
|-------|-------------|
| PENDING | Order just placed, awaiting confirmation |
| CONFIRMED | Admin confirmed the order |
| PROCESSING | Order being prepared |
| SHIPPED | Order dispatched for delivery |
| DELIVERED | Order successfully delivered |
| CANCELLED | Order cancelled by customer or admin |

### Class Relationships
| From | To | Type | Cardinality |
|------|----|------|-------------|
| User | Address | Association | 1 → * |
| User | Order | Association | 1 → * |
| User | CartItem | Association | 1 → * |
| Category | Product | Composition | 1 → * |
| Order | OrderItem | Composition | 1 → * |
| Product | OrderItem | Association | 1 → * |
| Product | CartItem | Association | 1 → * |
| Order | Address | Association | * → 1 |

---

## 7. Data Flow Diagram — Level 0 (Context Diagram)

**Purpose:** Shows the system as a single process with all external entities and data flows.

### External Entities
| Entity | Type | Data Sent to System | Data Received from System |
|--------|------|-------------------|--------------------------|
| Guest User | Actor | Registration data, login credentials | Confirmation messages, product listings |
| Customer | Actor | Cart operations, orders, address data | Product info, order status, profile data |
| Admin | Actor | Product/category data, status updates | Analytics, reports, order lists |
| Google OAuth 2.0 | External Service | User identity token | OAuth verification request |
| MySQL Database | Data Store | Stored data responses | CRUD queries |

---

## 8. Data Flow Diagram — Level 1 (Detailed)

**Purpose:** Breaks the system into 5 core processes showing detailed data movement.

### Process Breakdown
| Process | Name | Input Data | Output Data | Data Stores Used |
|---------|------|-----------|-------------|-----------------|
| 1.0 | Authentication | Credentials, OAuth token | JWT token, user info | Users DB |
| 2.0 | Product Management | Search queries, CRUD data | Product listings, details | Products DB, Categories DB |
| 3.0 | Cart Management | Add/update/remove requests | Cart contents, totals | Cart Items DB, Products DB |
| 4.0 | Order Processing | Place order request | Order confirmation | Cart Items DB, Addresses DB, Orders DB, Products DB |
| 5.0 | Address Management | Address CRUD data | Address list, defaults | Addresses DB |

### Data Store Interactions
| Data Store | Read By | Written By |
|-----------|---------|------------|
| Users DB | Process 1.0 | Process 1.0 |
| Products DB | Process 2.0, 3.0, 4.0 | Process 2.0, 4.0 (stock update) |
| Categories DB | Process 2.0 | Process 2.0 (admin) |
| Cart Items DB | Process 3.0, 4.0 | Process 3.0, 4.0 (clear) |
| Addresses DB | Process 4.0, 5.0 | Process 5.0 |
| Orders DB | Process 4.0 | Process 4.0 |
| Order Items DB | Process 4.0 | Process 4.0 |

---

## 9. Order Status State Diagram

**Purpose:** Shows all possible states of an order and valid transitions between them.

### States
| State | Description | Who Triggers | Next States |
|-------|-------------|-------------|-------------|
| PENDING | Order just placed by customer | Customer (Place Order) | CONFIRMED, CANCELLED |
| CONFIRMED | Admin has confirmed the order | Admin | PROCESSING, CANCELLED |
| PROCESSING | Order is being prepared/packed | Admin | SHIPPED |
| SHIPPED | Order dispatched for delivery | Admin | DELIVERED |
| DELIVERED | Order received by customer | System/Admin | (Final State) |
| CANCELLED | Order cancelled | Customer or Admin | (Final State) |

### State Transitions
| From | To | Trigger | Actor |
|------|----|---------|-------|
| (New) | PENDING | Customer places order | Customer |
| PENDING | CONFIRMED | Admin confirms order | Admin |
| PENDING | CANCELLED | Cancel order | Customer or Admin |
| CONFIRMED | PROCESSING | Start processing | Admin |
| CONFIRMED | CANCELLED | Cancel order | Admin |
| PROCESSING | SHIPPED | Mark as shipped | Admin |
| SHIPPED | DELIVERED | Confirm delivery | Admin |

---

## 10. Deployment Architecture

**Purpose:** Shows all servers, ports, technologies, and connections in the deployed system.

### Server Configuration
| Server | Technology | Port | Build Command | Start Command |
|--------|-----------|------|---------------|---------------|
| Frontend | React 18 + Redux + Tailwind CSS | 3000 | npm run build | npm start |
| Backend | Spring Boot 3.x + Spring Security | 6969 | mvn package | mvn spring-boot:run |
| Database | MySQL 8.0 | 3306 | — | MySQL service |

### Technology Stack Per Server
| Server | Technologies |
|--------|-------------|
| Frontend | React 18, Redux Toolkit, Tailwind CSS, Axios, React Router, crypto-js |
| Backend | Spring Boot, Spring Security, Spring Data JPA, Hibernate, JWT (jjwt), BCrypt, Maven |
| Database | MySQL 8.0, InnoDB engine, 7 tables, 6 indexes |
| External | Google OAuth 2.0 (Client ID authentication) |

### Connection Map
| From | To | Protocol | Details |
|------|----|----------|---------|
| React App | Spring Boot API | HTTP REST | JSON payloads, JWT in Authorization header |
| Spring Boot | MySQL | JDBC | Hibernate connection pool |
| React App | Google OAuth | HTTPS | OAuth 2.0 client-side flow |
| Google OAuth | Spring Boot | HTTPS | Token verification on backend |

---

## 11. REST API Endpoints Map

**Purpose:** Complete listing of all 38+ API endpoints with methods, paths, auth requirements, and descriptions.

### Authentication Endpoints (/auth)
| Method | Endpoint | Auth | Request Body | Response | Description |
|--------|----------|------|-------------|----------|-------------|
| POST | /auth/register | Public | {email, password, firstName, lastName, phone} | {message} | Register new customer |
| POST | /auth/login | Public | {email, password} | {token, user} | Login and get JWT |
| GET | /auth/me | JWT | — | {user details} | Get current user profile |
| POST | /auth/refresh | JWT | — | {new token} | Refresh JWT token |
| POST | /auth/forgot-password | Public | {email} | {message} | Send OTP to email |
| POST | /auth/verify-otp | Public | {email, otp} | {message} | Verify OTP code |
| POST | /auth/reset-password | Public | {email, otp, newPassword} | {message} | Reset password |
| POST | /auth/google-login | Public | {credential} | {token, user} | Google OAuth login |
| POST | /auth/google-register | Public | {credential} | {message} | Google OAuth register |

### Product Endpoints (/products)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /products | Public | Get all products (paginated) |
| GET | /products/{id} | Public | Get product by ID |
| GET | /products/search?query= | Public | Search products by name/description |
| GET | /products/category/{categoryId} | Public | Filter products by category |
| POST | /products | ADMIN | Create new product |
| PUT | /products/{id} | ADMIN | Update product |
| DELETE | /products/{id} | ADMIN | Delete product |
| PATCH | /products/{id}/toggle-active | ADMIN | Toggle product active/inactive |
| GET | /products/admin/all | ADMIN | Get all products (including inactive) |
| GET | /products/admin/low-stock | ADMIN | Get products with low stock |

### Category Endpoints (/categories)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /categories | Public | Get all active categories |
| GET | /categories/{id} | Public | Get category by ID |
| POST | /categories | ADMIN | Create new category |
| PUT | /categories/{id} | ADMIN | Update category |
| DELETE | /categories/{id} | ADMIN | Delete category |
| PATCH | /categories/{id}/toggle-active | ADMIN | Toggle category active/inactive |
| GET | /categories/admin/all | ADMIN | Get all categories (including inactive) |

### Cart Endpoints (/cart)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /cart | CUSTOMER | Get user's cart items |
| POST | /cart | CUSTOMER | Add product to cart |
| PUT | /cart/{cartItemId}?quantity= | CUSTOMER | Update cart item quantity |
| DELETE | /cart/{cartItemId} | CUSTOMER | Remove item from cart |
| DELETE | /cart | CUSTOMER | Clear entire cart |

### Order Endpoints (/orders)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /orders | CUSTOMER | Get user's orders |
| GET | /orders/{id} | CUSTOMER | Get order details |
| GET | /orders/order-number/{orderNumber} | CUSTOMER | Get order by order number |
| POST | /orders | CUSTOMER | Place new order |
| PATCH | /orders/{id}/cancel | CUSTOMER | Cancel pending order |
| GET | /orders/admin/all | ADMIN | Get all orders |
| PUT | /orders/{id}/status?status= | ADMIN | Update order status |
| GET | /orders/admin/stats | ADMIN | Get order statistics |

### Address Endpoints (/addresses)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /addresses | CUSTOMER | Get user's addresses |
| GET | /addresses/{id} | CUSTOMER | Get address by ID |
| POST | /addresses | CUSTOMER | Add new address |
| PUT | /addresses/{id} | CUSTOMER | Update address |
| DELETE | /addresses/{id} | CUSTOMER | Delete address |

---

## Frontend Pages Mapping

| # | Route | Component | Access | Features |
|---|-------|-----------|--------|----------|
| 1 | /login | Login | Public | Email/password login, Google OAuth, Remember Me |
| 2 | /register | Register | Public | New account registration, Google OAuth |
| 3 | /forgot-password | ForgotPassword | Public | OTP-based password reset |
| 4 | / , /home | Home | Customer | Hero section, featured products, categories |
| 5 | /products | Products | Public | Product grid, category filter, search, pagination |
| 6 | /products/:id | ProductDetail | Public | Product details, add to cart |
| 7 | /cart | Cart | Customer | Cart items, qty update, remove, totals |
| 8 | /checkout | Checkout | Customer | Address selection, order placement |
| 9 | /orders | Orders | Customer | Order list with status |
| 10 | /orders/:id | OrderDetail | Customer | Full order details, cancel option |
| 11 | /profile | Profile | Customer | User info, address management |
| 12 | /admin/dashboard | Dashboard | Admin | Stats cards, recent orders, low stock, analytics |
| 13 | /admin/products | Products | Admin | Product CRUD, toggle active |
| 14 | /admin/categories | Categories | Admin | Category CRUD, toggle active |
| 15 | /admin/orders | Orders | Admin | All orders, status updates |

---

*Generated for: MVE Commerce Project | Date: March 2026*
