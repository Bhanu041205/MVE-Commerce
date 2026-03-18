# 🚀 Complete Setup Guide - MVECommerce like Amazon/BigBasket

## Step 1: Create Database Tables (MUST DO FIRST)

**Go to Neon Console → SQL Editor:**

1. Copy ALL content from: `CREATE_TABLES.sql`
2. Paste in Neon Console
3. Click **Execute**

This creates:
- ✅ users table
- ✅ categories table  
- ✅ products table
- ✅ orders table
- ✅ cart table
- ✅ addresses table
- ✅ And all related tables

---

## Step 2: Add Sample Products (AFTER tables created)

**In same Neon Console:**

1. Copy ALL content from: `SAMPLE_PRODUCTS.sql`
2. Paste in Neon Console
3. Click **Execute**

This adds:
- ✅ 5 Categories
- ✅ 40 Products with:
  - Real product names
  - Descriptions
  - Prices and discounts
  - Stock quantities
  - Professional images

---

## Step 3: Create Admin User (AFTER products added)

**In Neon Console, run:**

```sql
DELETE FROM users WHERE email = 'adminbhanu@gmail.com';

INSERT INTO users (email, password, first_name, last_name, phone, role, is_active, created_at, updated_at) 
VALUES ('adminbhanu@gmail.com', '$2a$10$slYQmyNdGzin7olVN3p5be4DhxJm.P5escVIYeIVgkqsYVxMKopGm', 'Admin', 'Bhanu', '1234567890', 'ADMIN', true, NOW(), NOW());
```

**Admin Login:**
- Email: `adminbhanu@gmail.com`
- Password: `admin`

---

## Step 4: Start Backend

**Open PowerShell and run:**

```powershell
cd "D:\Java FullStack\MVECommerce\backend"
mvn spring-boot:run
```

**Expected output:**
```
...
Tomcat initialized with port 6969
Started MveCommerceApplication in X seconds
```

---

## Step 5: Start Frontend (NEW TERMINAL)

**Open NEW PowerShell and run:**

```powershell
cd "D:\Java FullStack\MVECommerce\frontend"
npm start
```

**Expected output:**
```
webpack compiled successfully
On Your Network: http://192.xxx.xxx.xxx:3000
```

Frontend will open at: http://localhost:3000

---

## ✅ Test the Full E-Commerce Flow

### 1. **Browse Products** (Like Amazon)
- Visit http://localhost:3000
- Click **Products** in navigation
- See all 40 products
- Filter by category
- Search for products

### 2. **Add to Cart** (Like Amazon)
- Click on any product
- Click **"Add to Cart"** button
- See product added notification

### 3. **View Cart**
- Click cart icon (top right)
- See all items with prices
- Update quantities
- Remove items
- See total price calculation

### 4. **Checkout Process**
- Click **"Proceed to Checkout"**
- Add delivery address (or select existing)
- Confirm order
- Order created successfully!

### 5. **View Orders** (Like Amazon My Orders)
- Click **"My Orders"** in navigation
- See all your orders
- Click to expand details
- View order status
- Cancel pending orders
- See delivery address

### 6. **Manage Profile**
- Click **"Profile"** in navigation
- View personal information
- Manage saved addresses
- Add new addresses
- Set default address

### 7. **Admin Features** (Login as Admin)
- Logout and login as admin
- **Admin Dashboard**: Overview of all orders
- **Manage Products**: 
  - Create new products
  - Edit existing products
  - Delete products
  - Manage inventory
- **Manage Categories**:
  - Create categories
  - Edit categories
  - Delete categories
- **View Orders**:
  - See all customer orders
  - Update order status
  - Track fulfillment

---

## 📊 What You'll Have

After setup, your app will have:

```
✅ 40 Premium Products
├─ Electronics (8)
├─ Fashion (8)
├─ Home & Garden (8)
├─ Sports & Outdoors (8)
└─ Books & Media (8)

✅ Full Shopping Experience
├─ Product Browsing & Search
├─ Category Filtering
├─ Shopping Cart
├─ Checkout Process
├─ Address Management
└─ Order Tracking

✅ Admin Management
├─ Product Management
├─ Category Management
├─ Order Management
├─ Inventory Tracking
└─ Admin Dashboard

✅ Customer Features
├─ User Profile
├─ Address Book
├─ Order History
└─ Order Tracking
```

---

## 🎯 Feature Breakdown (Like Amazon)

### Customer Features:
- ✅ **Browse**: See all products with details
- ✅ **Search**: Find products by name
- ✅ **Filter**: Filter by category and price
- ✅ **Cart**: Add/remove items, update quantities
- ✅ **Checkout**: Select address, place order
- ✅ **Orders**: Track all orders and status
- ✅ **Profile**: Manage addresses and info
- ✅ **Status Tracking**: See order status (Pending → Delivered)

### Admin Features:
- ✅ **Dashboard**: See business overview
- ✅ **Products**: Full CRUD (Create, Read, Update, Delete)
- ✅ **Categories**: Manage product categories
- ✅ **Orders**: View all orders
- ✅ **Status Updates**: Update order status
- ✅ **Inventory**: Monitor stock levels

---

## 🔍 Checking Everything Works

### In Backend Terminal:
```
GET /products          → Returns list of products
GET /categories        → Returns categories
POST /orders           → Creates order
GET /orders            → Gets user orders
```

### In Frontend (http://localhost:3000):
```
✅ Products load with images and prices
✅ Categories filter working
✅ Add to cart is functional
✅ Cart shows items correctly
✅ Checkout creates orders
✅ Orders appear in "My Orders"
✅ Admin can manage products
```

---

## 🚨 Troubleshooting

### "Products not loading"
```
✓ Check SAMPLE_PRODUCTS.sql was executed
✓ Verify backend is running (port 6969)
✓ Check browser console for errors
✓ Refresh page
```

### "Can't add to cart"
```
✓ Make sure you're logged in
✓ Check backend is running
✓ Try with another product
```

### "Order not saving"
```
✓ Add address before checkout
✓ Check all fields filled
✓ Verify backend connection
```

### "Admin features not showing"
```
✓ Login with admin email: adminbhanu@gmail.com
✓ Clear browser cache
✓ Use incognito window
```

---

## 📝 Important File Locations

```
D:\Java FullStack\MVECommerce\
├── CREATE_TABLES.sql           ← Run in Neon Console FIRST
├── SAMPLE_PRODUCTS.sql         ← Run after tables created
├── ADMIN_INFORMATION.md        ← Admin credentials
├── FEATURES_IMPLEMENTATION.md  ← Feature details
├── backend/                    ← API Server
│   └── src/main/resources/
│       └── application.yml     ← Neon connection config
└── frontend/                   ← React App
    └── src/
        ├── pages/customer/     ← Customer pages
        ├── pages/admin/        ← Admin pages
        └── api/endpoints.js    ← API calls
```

---

## ✨ You're All Set!

Follow these steps in order:

1. ✅ Execute **CREATE_TABLES.sql** in Neon
2. ✅ Execute **SAMPLE_PRODUCTS.sql** in Neon
3. ✅ Execute admin user SQL in Neon
4. ✅ Start backend: `mvn spring-boot:run`
5. ✅ Start frontend: `npm start`
6. ✅ Login and test!

**Your e-commerce platform is ready to go! 🚀**
