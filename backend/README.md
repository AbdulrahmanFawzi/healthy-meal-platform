# Healthy Meal Platform - Backend API

Backend service for the Healthy Meal Ordering & Subscription Management System.

---

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas) + Mongoose *(not implemented yet)*
- **Authentication**: JWT *(not implemented yet)*
- **File Upload**: Multer *(not implemented yet)*
- **Image Storage**: Cloudinary *(not implemented yet)*

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Minimal configuration for MVP:

```env
PORT=4000
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

### 4. Verify Health Check

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "message": "Backend is running 🚀",
    "timestamp": "2025-12-26T...",
    "environment": "development"
  }
}
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js                      # Express app entry point
│   ├── routes/
│   │   └── index.js                # Main router (mounts all routes)
│   ├── middlewares/
│   │   └── error.middleware.js     # Centralized error handler
│   └── modules/                    # Feature modules (to be implemented)
│       ├── auth/                   # Authentication (login, JWT)
│       ├── meals/                  # Meals CRUD + image upload
│       ├── orders/                 # Orders management
│       ├── subscriptions/          # Subscription management
│       └── notifications/          # Notification system
├── .env.example                    # Environment variables template
├── package.json
└── README.md
```

---

## 🛣️ API Endpoints

### Base URL: `/api`

### Current Endpoints

| Method | Endpoint       | Description          | Auth Required |
|--------|----------------|----------------------|---------------|
| GET    | `/api/health`  | Health check         | No            |

### Planned Endpoints (MVP)

#### **Authentication**
- `POST /api/auth/login` - Admin/Customer login

#### **Meals** (Admin only)
- `GET /api/meals` - List meals
- `POST /api/meals` - Create meal
- `PUT /api/meals/:id` - Update meal
- `DELETE /api/meals/:id` - Delete meal
- `POST /api/meals/:id/image` - Upload meal image

#### **Orders**
- `POST /api/orders` - Create order (Customer)
- `GET /api/orders/today` - Today's orders (Admin)
- `GET /api/orders/my` - My orders (Customer)
- `PATCH /api/orders/:id/status` - Update order status (Admin)
- `POST /api/orders/:id/notify` - Send ready notification (Admin)

#### **Subscriptions** (Admin only)
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions` - List subscriptions
- `PATCH /api/subscriptions/:id` - Update subscription

#### **Notifications** (Customer only)
- `GET /api/notifications/my` - Get my notifications
- `PATCH /api/notifications/:id/read` - Mark as read

---

## 📐 API Response Conventions

### Success Response

```json
{
  "success": true,
  "data": {
    // Response payload
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": [
      {
        "field": "fieldName",
        "issue": "Validation issue description"
      }
    ]
  }
}
```

---

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with nodemon (auto-reload)
- `npm start` - Start production server
- `npm test` - Run tests *(not implemented yet)*

### Environment Variables

See `.env.example` for all available configuration options.

**Required for MVP**:
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - Environment (development/production)

**Required for Full Implementation**:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CLOUDINARY_*` - Cloudinary credentials (image storage)
- `ALLOWED_ORIGINS` - CORS allowed origins

---

## 📝 Implementation Status

- [x] Project skeleton
- [x] Express server setup
- [x] Health check endpoint
- [x] Error handling middleware
- [x] CORS configuration
- [ ] MongoDB connection
- [ ] Authentication (JWT)
- [ ] User model
- [ ] Meals module
- [ ] Orders module
- [ ] Subscriptions module
- [ ] Notifications module
- [ ] Image upload (Multer + Cloudinary)

---

## 🔐 Authentication Flow (Planned)

1. Admin/Customer sends `POST /api/auth/login` with credentials
2. Backend validates credentials against User collection
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend includes token in `Authorization: Bearer <token>` header
6. Backend validates token via JWT middleware on protected routes

---

## 📚 Additional Documentation

- [API Contracts](../docs/api-contracts.md) - Detailed request/response schemas
- [PRD](../docs/healthy-meal-PRD.md) - Product requirements
- [Copilot Instructions](../.github/copilot-instructions.md) - Development guidelines

---

## 🚧 Next Steps

1. Implement MongoDB connection
2. Create User model and authentication endpoints
3. Implement JWT middleware
4. Create Meal model and CRUD endpoints
5. Implement image upload for meals
6. Create Order model and endpoints
7. Create Subscription model and endpoints
8. Implement notification system

---

## 📞 Support

For questions or issues, refer to the project documentation or contact the development team.
