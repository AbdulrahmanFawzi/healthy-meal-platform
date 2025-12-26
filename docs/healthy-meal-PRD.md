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
- View available meals (filtered by category)
- Select Protein meal
- Select Carb meal (after protein)
- Repeat selection based on mealsPerDay
- Optional Snack selection (if allowed by subscription)
- Review daily macro targets (Protein / Carbs)

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
  calories,        
  imageUrl,
  availability: 'daily' | 'weekly' | 'monthly',
  category: 'protein' | 'carb' | 'snack',
  isActive,
  createdAt
}


Subscription {
  _id,
  customerId,
  startDate,
  endDate,
  status: 'active' | 'paused',

  plan: {
  mealsPerDay: number,        // e.g. 1, 2, 3
  includesSnack: boolean      // true | false
}
  },

  macros: {
    proteinGrams: number,
    carbsGrams: number
  },

  createdAt
}

Order {
  _id,
  customerId,
  orderDate,
  status: 'pending' | 'preparing' | 'ready' | 'completed',

  macroTargets: { proteinGrams, carbsGrams }, 

  selections: [
    {
      proteinMealId,
      carbMealId
    }
  ],

  snackMealIds: [mealId],   
  notes,
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

8. MVP Scope

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

9. Deployment
	•	Frontend: Netlify / Vercel
	•	Backend: Render / Railway
	•	Database: MongoDB Atlas

⸻

10. Final Notes

This PRD is designed to:
	•	Be easy to understand
	•	Be Copilot-friendly
	•	Support incremental development
	•	Focus on Frontend–Backend integration