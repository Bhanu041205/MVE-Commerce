# MVE Commerce Frontend

React-based frontend for the MVE Commerce e-commerce platform with customer and admin dashboards.

## Project Setup

### Prerequisites
- Node.js 16+ and npm

### Installation

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
# .env
REACT_APP_API_URL=http://localhost:8080/api
```

4. **Start the development server**
```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance with interceptors
│   │   └── endpoints.js      # API endpoint functions
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── Footer.js
│   │   └── Spinner.js
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── customer/
│   │   │   ├── Home.js
│   │   │   ├── Products.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── Orders.js
│   │   │   ├── OrderDetail.js
│   │   │   └── Profile.js
│   │   └── admin/
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Categories.js
│   │       └── Orders.js
│   ├── store/
│   │   ├── authSlice.js
│   │   ├── cartSlice.js
│   │   └── index.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Key Features

### Customer Features
- Browse products with pagination
- Filter by category
- Search products
- Add/remove items from cart
- View shopping cart
- Checkout and place orders
- Track order status
- Manage delivery addresses
- View order history

### Admin Features
- Dashboard with analytics
- Product management (CRUD)
- Category management
- Inventory management
- Order monitoring and updates
- Customer management

## Technology Stack

- **React 18** - Frontend framework
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Build for Production

```bash
npm run build
```

This creates a production build in the `build` directory.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token and user information
3. Token is stored in localStorage
4. Token is sent with every API request via Authorization header
5. On token expiration, user is redirected to login

## API Integration

All API calls are made through the `api/endpoints.js` file which uses Axios with:
- Base URL configuration
- Request/response interceptors
- Automatic token injection
- Error handling

## Environment Variables

Create a `.env` file in the frontend root:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Troubleshooting

### Port Already in Use
```bash
PORT=3001 npm start
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues
- Verify backend is running on `http://localhost:8080`
- Check `REACT_APP_API_URL` in `.env`
- Verify CORS is enabled in backend

## Demo Credentials

**Customer Account:**
- Email: customer@demo.com
- Password: password123

**Admin Account:**
- Email: admin@demo.com
- Password: password123

## Performance Tips

1. Use React DevTools to monitor render performance
2. Implement code splitting with React.lazy() for page routes
3. Use Redux for efficient state management
4. Optimize images and assets
5. Implement pagination for large datasets

## Deployment

The React app can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

---

**Last Updated**: February 2026
**Version**: 1.0.0
