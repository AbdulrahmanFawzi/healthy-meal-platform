# Product Requirements Document (PRD)

## Healthy Meal Ordering & Subscription Management System
## Multi-Tenant SaaS Platform

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

Build a modern **multi-tenant SaaS** digital system that:

- Serves multiple restaurants from one backend
- Organizes meal menus (daily / weekly / monthly) per restaurant
- Allows customers to select meals easily within their restaurant
- Prevents order confusion with strict tenant isolation
- Enables restaurant staff to manage orders and subscriptions
- Provides clear order status updates
- Displays restaurant branding (logo) for each tenant

---

## 3. Target Users

### Super Admin (Platform Owner)
- Create restaurant accounts
- Create initial admin users for each restaurant
- Manage platform-level settings
- View platform analytics (future)

### Admin (Restaurant Owner / Staff)
- Manage meals for their restaurant only
- Manage subscriptions for their restaurant
- View and update orders for their restaurant
- Notify customers when meals are ready
- Create customer accounts (phone + password)

### Customer (Subscriber)
- View menu for their restaurant
- Select daily meals
- Track order status
- Receive notifications

---

## 4. System Architecture Overview

**Multi-Tenant SaaS Architecture:**
- One backend serves multiple restaurants
- Data isolation enforced via `restaurantId`
- Each restaurant has its own branding (logo)
- JWT contains: `userId`, `role`, `restaurantId`

```
Angular Frontend (RTL - Arabic)
↓ REST API (JWT with restaurantId)
Node.js + Express Backend (Multi-Tenant)
↓
MongoDB Database (Tenant-isolated collections)
↓
Image Storage (Cloudinary or Local for MVP)
```

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
- Login page (phone + password)
- JWT stored in localStorage (MVP)
- Restaurant logo displayed in header after login

---

### Super Admin (Platform Owner)

**Restaurant Management**
- Create new restaurant
- Set restaurant name and logo
- Create initial admin user (phone + password)
- View all restaurants (optional MVP)

---

### Admin (Restaurant Owner)

**Dashboard**
- Orders today (for this restaurant only)
- Meals count
- Active subscriptions
- Orders status overview

**Meals Management**
- Add new meal (scoped to restaurant)
- Edit meal
- Delete meal
- Upload meal image
- Set meal category: protein / carb / snack
- Meal availability:
  - daily
  - weekly
  - monthly

**Orders Management**
- View today's orders (restaurant-scoped)
- Group orders by customer
- Update order status:
  - pending
  - preparing
  - ready
  - completed
- Send "Ready" notification

**Subscriptions**
- Add new subscriber (create customer account)
- Set customer phone + password
- Configure plan (mealsPerDay, includesSnack)
- Set macro targets (daily proteinGrams, carbsGrams)
- Set subscription start/end dates
- Pause / activate subscription

---

### Customer

**Home / Menu**
- View available meals (restaurant-scoped, filtered by category)
- Restaurant logo displayed in header
- Select Protein meal
- Select Carb meal (after protein)
- Repeat selection based on mealsPerDay
- Optional Snack selection (max 1, if allowed by subscription)
- Review daily macro targets (Protein / Carbs - informational)

**My Orders**
- View current order
- Order status timeline

**Order History**
- Previous orders list

**Notifications**
- View notifications (e.g., "Order ready")
- Mark as read

---

## 6. Backend (Server Side)

### Technology Stack
- Runtime: Node.js
- Framework: Express.js
- Authentication: JWT (includes restaurantId)
- ORM: Mongoose
- Database: MongoDB (Atlas)
- File Upload: Multer
- Images: Cloudinary (recommended)

### Multi-Tenancy Implementation
- All protected routes filter by `req.user.restaurantId`
- Admins can only access their restaurant data
- Customers can only access their restaurant data
- Super admin can access platform-level resources

---

## 7. Database Design (MongoDB Schemas)

### Restaurant
```ts
{
  _id,
  name,                    // e.g., "Healthy Bites Riyadh"
  logoUrl,                 // optional, can be null
  createdAt
}
```

---

### User
```ts
{
  _id,
  restaurantId,            // ObjectId (null for super_admin)
  name,
  phone,                   // PRIMARY LOGIN IDENTIFIER
  password,                // hashed
  email,                   // optional (not used for login)
  role: 'super_admin' | 'admin' | 'customer',
  createdAt
}
```

**Important:**
- `restaurantId` is **required** for admin and customer
- `restaurantId` is **null** for super_admin
- Login uses `phone` + `password` (not email)

---

### Meal
```ts
{
  _id,
  restaurantId,            // ObjectId (tenant isolation)
  name,
  description,
  calories,        
  imageUrl,
  availability: 'daily' | 'weekly' | 'monthly',
  category: 'protein' | 'carb' | 'snack',
  isActive,
  createdAt
}
```

---

### Subscription
```ts
{
  _id,
  restaurantId,            // ObjectId (tenant isolation)
  customerId,              // ObjectId
  startDate,
  endDate,
  status: 'active' | 'paused',

  plan: {
    mealsPerDay: number,   // e.g. 1, 2, 3
    includesSnack: boolean // true | false
  },

  macros: {
    proteinGrams: number,  // DAILY target
    carbsGrams: number     // DAILY target
  },

  createdAt
}
```

---

### Order
```ts
{
  _id,
  restaurantId,            // ObjectId (tenant isolation)
  customerId,              // ObjectId
  orderDate,
  status: 'pending' | 'preparing' | 'ready' | 'completed',

  macroTargets: {          // Snapshot from subscription
    proteinGrams: number,
    carbsGrams: number
  },

  selections: [            // Count must equal subscription.plan.mealsPerDay
    {
      proteinMealId,       // ObjectId (category: protein)
      carbMealId           // ObjectId (category: carb)
    }
  ],

  snackMealIds: [ObjectId], // Optional, max 1
  notes,
  createdAt
}
```

---

### Notification
```ts
{
  _id,
  restaurantId,            // ObjectId (tenant isolation)
  customerId,              // ObjectId
  orderId,                 // ObjectId
  message,
  isRead,
  createdAt
}
```

---

## 8. Multi-Tenancy & Security Rules

### Tenant Isolation
- **All** records (except Restaurant and super_admin users) must include `restaurantId`
- Backend enforces filtering by `req.user.restaurantId` on all queries
- Admin/Customer can ONLY access data for their own restaurant
- Super admin can access platform resources

### JWT Payload
```ts
{
  userId: string,
  role: 'super_admin' | 'admin' | 'customer',
  restaurantId: string | null    // null for super_admin
}
```

### Authentication
- Login identifier: **phone** (not email)
- Password is hashed (bcrypt)
- Email is optional and NOT used for login

### Authorization Middleware
- Check JWT validity
- Extract `userId`, `role`, `restaurantId`
- Enforce role-based access control
- Enforce tenant-scoped queries

---

## 9. Onboarding Flow

### Restaurant Onboarding (Super Admin)
1. Super admin creates Restaurant record (name, logo)
2. Super admin creates initial Admin user:
   - Assigns phone + password
   - Links to `restaurantId`
   - Sets `role: 'admin'`
3. Admin receives credentials manually (e.g., email/WhatsApp)
4. Admin logs in and manages their restaurant

### Customer Onboarding (Admin)
1. Admin creates subscription
2. Provides customer phone + password
3. System creates User with `role: 'customer'`
4. Customer receives credentials manually
5. Customer logs in and places orders

**No public self-registration in MVP.**

---

## 10. MVP Scope

### Included
- Multi-tenant architecture (restaurantId isolation)
- Restaurant branding (logo display)
- Phone-based authentication
- Super admin: create restaurants + admin users
- Admin: manage meals, subscriptions, orders (restaurant-scoped)
- Customer: browse menu, place orders, track status (restaurant-scoped)
- Meals management with categories (protein/carb/snack)
- Flexible subscription plans (mealsPerDay, includesSnack, macros)
- Order flow with paired selections + optional snack
- Status updates
- Internal notifications

### Not Included (Later Phase)
- Online payments
- WhatsApp API integration
- Advanced analytics
- Self-service restaurant signup
- Multi-language support (English in addition to Arabic)
- Email-based password reset

---

## 11. Deployment
- Frontend: Netlify / Vercel
- Backend: Render / Railway
- Database: MongoDB Atlas

---

## 12. Final Notes

This PRD is designed to:
- Support multi-tenant SaaS architecture from day one
- Enable strict data isolation per restaurant
- Scale to serve multiple restaurants on one backend
- Be Copilot-friendly
- Support incremental development
- Focus on Frontend–Backend integration
