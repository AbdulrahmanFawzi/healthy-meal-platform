# Product Requirements Document (PRD)

## Healthy Meal Ordering & Subscription Management System

---

## 1. Problem Statement

Many healthy meal restaurants rely on WhatsApp for daily or weekly meal ordering. This causes:

- Order confusion between customers  
- Lost orders due to message overload  
- No clear order status tracking  
- No images for meals  
- Manual and error-prone workflow  

---

## 2. Goals & Objectives

Build a modern digital system that:

- Organizes meal menus (daily / weekly / monthly)
- Allows customers to select meals easily
- Prevents order confusion
- Enables restaurant staff to manage orders and subscriptions
- Provides clear order status updates

---

## 3. Target Users

### Admin (Restaurant Owner / Staff)
- Manage meals
- Manage subscriptions
- View and update orders
- Notify customers when meals are ready

### Customer (Subscriber)
- View menu
- Select daily meals
- Track order status

---

## 4. System Architecture Overview
Angular Frontend (RTL - Arabic)
↓ REST API
Node.js + Express Backend
↓
MongoDB Database
↓
Image Storage (Cloudinary or Local for MVP)
---

## 5. Frontend (Client Side)

### Technology Stack
- Framework: Angular
- Language: TypeScript
- Styling: SCSS
- Layout: RTL (Arabic)
- State Handling: Component State + Services
- HTTP: Angular HttpClient
- Authentication: JWT + HTTP Interceptor
- Routing: Angular Router + Guards

---

## 5.1 Frontend Modules & Pages

### Authentication
- Login page (Admin / Customer)
- JWT stored in localStorage (MVP)

### Admin (Restaurant Owner)
**Dashboard**
- Orders today
- Meals count
- Active subscriptions
- Orders status overview

**Meals Management**
- Add new meal
- Edit meal
- Delete meal
- Upload meal image
- Meal availability:
  - daily
  - weekly
  - monthly

**Orders Management**
- View today’s orders
- Group orders by customer
- Update order status:
  - pending
  - preparing
  - ready
  - completed
- Send “Ready” notification

**Subscriptions**
- Add new subscriber
- Set subscription start date
- Set subscription end date
- Pause / activate subscription

---

### Customer

**Home / Menu**
- View today’s menu
- Meal cards with image
- Select meals and quantity

**My Orders**
- View current order
- Order status timeline

**Order History**
- Previous orders list

---

## 6. Backend (Server Side)

### Technology Stack
- Runtime: Node.js
- Framework: Express.js
- Authentication: JWT
- ORM: Mongoose
- Database: MongoDB (Atlas)
- File Upload: Multer
- Images: Cloudinary (recommended)

---

## 7. Database Design (MongoDB Schemas)

### User
```ts
{
  _id,
  name,
  phone,
  email,
  role: 'admin' | 'customer',
  createdAt
}
Meal
{
  _id,
  name,
  description,
  price,
  calories,
  imageUrl,
  availability: 'daily' | 'weekly' | 'monthly',
  isActive,
  createdAt
}

Subscription
{
  _id,
  customerId,
  startDate,
  endDate,
  status: 'active' | 'paused',
  createdAt
}

Order
{
  _id,
  customerId,
  meals: [
    {
      mealId,
      quantity
    }
  ],
  status: 'pending' | 'preparing' | 'ready' | 'completed',
  orderDate,
  createdAt
}

Notification (MVP Internal)
{
  _id,
  customerId,
  orderId,
  message,
  isRead,
  createdAt
}
8. API Contracts (Request / Response)

8.1 Authentication

POST /api/auth/login
Request
{
  "identifier": "user@email.com",
  "password": "password"
}

Response
{
  "accessToken": "JWT_TOKEN",
  "user": {
    "id": "...",
    "role": "admin"
  }
}

8.2 Meals

GET /api/meals
Response
[
  {
    "id": "meal_1",
    "name": "Healthy Chicken Meal",
    "price": 35,
    "calories": 520,
    "availability": "daily"
  }
]

POST /api/meals
Request
{
  "name": "Salmon Meal",
  "price": 45,
  "calories": 600,
  "availability": "daily"
}
8.3 Orders

POST /api/orders
Request
{
  "orderDate": "2025-12-23",
  "items": [
    { "mealId": "meal_1", "quantity": 1 }
  ]
}
PATCH /api/orders/:id/status
Request
{
  "status": "ready"
}
8.4 Subscriptions

POST /api/subscriptions
Request
{
  "customerId": "cus_1",
  "startDate": "2025-12-23",
  "endDate": "2026-01-23"
}

9. MVP Scope

Included
	•	Meals management
	•	Orders flow
	•	Subscriptions
	•	Status updates
	•	Internal notifications

Not Included (Later Phase)
	•	Online payments
	•	WhatsApp API
	•	Multi-restaurant support
	•	Advanced analytics

⸻

10. Deployment
	•	Frontend: Netlify / Vercel
	•	Backend: Render / Railway
	•	Database: MongoDB Atlas

⸻

11. Final Notes

This PRD is designed to:
	•	Be easy to understand
	•	Be Copilot-friendly
	•	Support incremental development
	•	Focus on Frontend–Backend integration