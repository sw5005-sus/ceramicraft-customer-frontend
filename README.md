# CeramiCraft Customer Frontend

[ English | [简体中文](./README_zh.md) ]

## 📖 Project Overview

CeramiCraft is a professional e-commerce platform customer application for handcrafted ceramics. Built with modern frontend technologies, it provides users with a seamless shopping experience, including product browsing, cart management, order processing, review system, and other complete e-commerce features.

### ✨ Key Features

- 🛍️ **Product Display** - Beautiful product listings and detail pages
- 🛒 **Cart Management** - Real-time cart synchronization and price calculation
- 💳 **Order Processing** - Complete order placement, payment, and tracking workflow
- 👤 **User Center** - Profile management, address management, balance top-up
- ⭐ **Review System** - Order reviews and review history viewing
- 📱 **Responsive Design** - Adapts to various device screens
- 🔐 **Secure Authentication** - JWT Token authentication and permission management

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite 7.1.2
- **Language**: TypeScript 5.8.3
- **Router**: Vue Router 4.5.1
- **UI Library**: Element Plus 2.11.2
- **HTTP Client**: Axios 1.12.0
- **Icons**: Font Awesome 7.0.1
- **Code Quality**: ESLint 9.35.0
- **Testing**: Vitest 3.2.4 + Vue Test Utils

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:5173` and automatically proxy API requests to the backend server.

### Production Build

```bash
npm run build
```

Build artifacts will be output to the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

Preview server will start at `http://localhost:4173`.

### Code Linting

```bash
npm run lint
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
# Using the provided script
./build_dkimg.sh

# Or build manually
docker build -t ceramicraft-customer-frontend .
```

### Run Container

```bash
docker run -p 8080:8080 ceramicraft-customer-frontend
```

The application will be accessible at `http://localhost:8080`.

## 🔧 Configuration

### API Configuration

API endpoint configuration is located in `src/config/api-endpoints.ts`, including the following microservices:

- **User Service** (`user-ms`): User authentication, registration, profile management
- **Product Service** (`product-ms`): Product display, cart management
- **Payment Service** (`payment-ms`): Order processing, payment account management

### Environment Variables

Development environment handles API requests through Vite proxy configuration (`vite.config.ts`):

```typescript
proxy: {
  '/api': {
    target: 'http://47.129.72.211',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
}
```

Production environment uses the configured backend domain directly.

## 📱 Main Feature Modules

### 1. User Authentication
- User registration (email verification)
- Login/Logout
- Password management

### 2. Product Browsing
- Product list display
- Product search and filtering
- Product detail viewing
- Product image preview

### 3. Shopping Cart
- Add products to cart
- Modify product quantities
- Remove cart items
- Real-time price calculation

### 4. Order Management
- Create orders
- Select delivery address
- Order payment
- View order list
- View order details
- Track order status

### 5. User Center
- Profile management
- Delivery address management
- Payment account balance viewing
- Account top-up
- Password change

### 6. Review System
- Order reviews
- View review history
- Review management

## 🎨 UI Component Library

The project uses Element Plus as the UI component library. Main components used include:

- **Navigation**: Menu, Breadcrumb
- **Forms**: Form, Input, Select, DatePicker
- **Data Display**: Table, Card, Tag, Avatar
- **Feedback**: Message, Dialog, Loading, Notification
- **Layout**: Container, Row, Col

## 🔐 Permission Control

Permission control is implemented through route guards:

```typescript
meta: { requiresAuth: true }  // Requires login to access
```

Pages requiring authentication include:
- User Profile
- Shopping Cart
- Checkout Page
- Order Management
- My Reviews

## 📝 Development Guidelines

### Code Style

- Use TypeScript for type constraints
- Follow ESLint rules
- Write components using Composition API
- Use PascalCase for component naming
- Use kebab-case for file naming

### Git Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Refactoring
test: Testing related
chore: Build/toolchain update
```

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 👥 Contributing

Issues and Pull Requests are welcome!

## 📧 Contact

For questions, please contact the development team.

---

**CeramiCraft** - Bringing Handcrafted Art to Life 🎨
