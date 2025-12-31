# Copilot Instructions
## Project: Healthy Meal Ordering & Subscription Management System
## Multi-Tenant SaaS Platform

### 1) Product Summary
This project is a **multi-tenant SaaS platform** that replaces WhatsApp-based meal ordering with a structured system:
- **Super Admin** (platform owner) creates restaurant accounts and initial admin users
- **Admin** (restaurant owner/staff) manages meals, subscriptions, orders, and sends "ready" notifications for their restaurant only
- **Customers** (subscribers) browse the menu, select daily meals, and track order status within their restaurant
- Primary goal: serve multiple restaurants from one backend with strict data isolation
- All data is scoped by `restaurantId` for tenant isolation

### 2) Multi-Tenancy Architecture (CRITICAL)
**This is a multi-tenant SaaS application. Every feature MUST enforce tenant isolation.**

#### Data Isolation Rules:
- All collections MUST include `restaurantId` field (except Restaurant and super_admin users)
- All queries MUST filter by `req.user.restaurantId` from JWT
- Admin can ONLY access their restaurant's data
- Customer can ONLY access their restaurant's data
- Super admin accesses platform-level resources only

#### JWT Payload Structure:
```json
{
  "userId": "string",
  "role": "super_admin" | "admin" | "customer",
  "restaurantId": "string" | null
}
```
_Note: `restaurantId` is `null` for super_admin._

#### Backend Middleware Requirements:
```javascript
// Every protected route MUST:
1. Verify JWT
2. Extract userId, role, restaurantId
3. Filter all queries by restaurantId
4. Validate resource ownership before mutations
```

### 3) Key Requirement (Mobile-First)
MOST USERS WILL USE MOBILE PHONES.
- Frontend must be designed and implemented **mobile-first**
- All screens must be responsive on common mobile widths (360–430px)
- Desktop/tablet layouts should be adaptive, but mobile UX is the priority
- Avoid desktop-only UI patterns (wide tables without fallback). Provide mobile alternatives:
  - Use cards, accordions, drawers, bottom sheets, and sticky action bars
  - If a table is used on desktop, render a card/list view on mobile

### 4) Tech Stack
#### Frontend
- Angular + TypeScript + SCSS
- Arabic RTL support
- Angular Router + Guards (role-based + tenant-aware)
- HttpClient + JWT Interceptor (includes restaurantId in context)
- Component state + Services (no heavy state management in MVP)

#### Backend
- Node.js + Express.js
- MongoDB (Atlas) + Mongoose
- JWT Auth (Bearer) - includes userId, role, restaurantId
- File upload: Multer
- Images: Cloudinary (preferred) or local storage (MVP)

### 5) Angular Coding Conventions (CRITICAL)

#### File Naming Convention:
Use **simplified naming without `.component.` in filenames**:
- ✅ Correct: `landing.ts`, `landing.html`, `landing.scss`
- ❌ Wrong: `landing.component.ts`, `landing.component.html`, `landing.component.scss`

This applies to all Angular components throughout the project.

#### Angular Control Flow:
Use **modern Angular control flow syntax** (`@if`, `@for`) instead of legacy directives:

**Conditional Rendering:**
```html
<!-- ✅ Use this -->
@if (isLoggedIn) {
  <p>Welcome back!</p>
} @else {
  <p>Please log in</p>
}

<!-- ❌ NOT this -->
<p *ngIf="isLoggedIn">Welcome back!</p>
<p *ngIf="!isLoggedIn">Please log in</p>
```

**List Rendering:**
```html
<!-- ✅ Use this -->
@for (meal of meals; track meal.id) {
  <div class="meal-card">{{ meal.name }}</div>
} @empty {
  <p>No meals available</p>
}

<!-- ❌ NOT this -->
<div *ngFor="let meal of meals" class="meal-card">{{ meal.name }}</div>
```

#### Approval Workflow (MANDATORY):
**Before implementing ANY code**, you MUST:
1. Explain **WHAT** you will implement (feature/change description)
2. Explain **WHY** it's needed (business logic, requirement)
3. List **WHICH FILES** will be created/modified (with paths)
4. **ASK FOR MY APPROVAL** explicitly
5. **WAIT** for approval confirmation
6. Only **PROCEED** after receiving approval

Example format:
```
I will implement the meal listing feature.

WHY: To allow customers to browse available meals for their restaurant.

FILES:
- src/app/customer/meals/meals.ts (new)
- src/app/customer/meals/meals.html (new)
- src/app/customer/meals/meals.scss (new)
- src/app/customer/customer.routes.ts (modify)

May I proceed with this implementation?
```

### 6) Roles & Authorization
- Roles: `super_admin`, `admin`, `customer`
- **Super Admin** (platform owner):
  - Create restaurants
  - Create initial admin users for restaurants
  - View platform analytics (future)
- **Admin** (restaurant owner/staff):
  - Create/update/delete meals (restaurant-scoped)
  - Upload meal images
  - Manage subscriptions (restaurant-scoped)
  - View today's orders (restaurant-scoped)
  - Update order status
  - Send ready notifications
  - Create customer accounts (phone + password)
- **Customer**:
  - Browse meals (restaurant-scoped)
  - Create daily order
  - View own orders
  - View/mark notifications as read

### 7) Domain Enums (Use exact values)
- `UserRole`: `super_admin` | `admin` | `customer`
- `MealAvailability`: `daily` | `weekly` | `monthly`
- `MealCategory`: `protein` | `carb` | `snack`
- `OrderStatus`: `pending` | `preparing` | `ready` | `completed`
- `SubscriptionStatus`: `active` | `paused`
- Notification type (MVP): `READY_FOR_PICKUP`

### 8) Key Business Rules (MVP)
- **Authentication**: Login uses **phone + password** (not email)
- **No public signup**: Only super_admin creates restaurants and admins; admins create customers
- **Tenant isolation**: All data operations MUST filter by restaurantId
- **Meals**: No price field, categorized by `category` field (protein/carb/snack)
- **Subscriptions**: Flexible plan structure (no fixed plan codes)
  - `plan.mealsPerDay`: number
  - `plan.includesSnack`: boolean
  - `macros.proteinGrams` and `macros.carbsGrams`: DAILY targets (informational only)
- **Orders**: Paired selections structure
  - `selections: [{ proteinMealId, carbMealId }]`
  - Count of selections MUST equal `subscription.plan.mealsPerDay`
  - `snackMealIds`: optional array (max 1 snack per day)
  - `macroTargets`: snapshot saved from subscription
- **Subscription status = 'active'** required to create orders
- **Snacks**: Optional, max 1 per day (even if `includesSnack: true`)

### 9) API Conventions
- Base path: `/api`
- Request/response is JSON (except image upload uses multipart/form-data)
- Auth header: `Authorization: Bearer <token>`
- Success response shape:
```json
{ "success": true, "data": {} }
```
- Error response shape:
```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message",
    "details": [{ "field": "name", "issue": "Required" }]
  }
}
```

### 10) API Endpoints (MVP)

#### Platform Management (super_admin only):
- POST /api/platform/restaurants (create restaurant + initial admin)
- GET /api/platform/restaurants (list all restaurants - optional MVP)

#### Auth:
- POST /api/auth/login (phone + password)

#### Meals (restaurant-scoped):
- GET /api/meals (admin, customer)
- POST /api/meals (admin)
- PUT /api/meals/:id (admin)
- DELETE /api/meals/:id (admin)
- POST /api/meals/:id/image (admin, multipart: image)

#### Orders (restaurant-scoped):
- POST /api/orders (customer)
- GET /api/orders/today (admin)
- GET /api/orders/my (customer)
- PATCH /api/orders/:id/status (admin)
- POST /api/orders/:id/notify (admin)

#### Subscriptions (restaurant-scoped, admin only):
- POST /api/subscriptions
- GET /api/subscriptions
- PATCH /api/subscriptions/:id

#### Notifications (restaurant-scoped, customer only):
- GET /api/notifications/my
- PATCH /api/notifications/:id/read

### 11) Data Models (High Level)

- **Restaurant**: name, logoUrl, createdAt
- **User**: restaurantId (null for super_admin), name, phone, password, email (optional), role, createdAt
- **Meal**: restaurantId, name, description, calories, imageUrl, availability, category, isActive, createdAt
- **Subscription**: restaurantId, customerId, startDate, endDate, status, plan (mealsPerDay, includesSnack), macros (proteinGrams, carbsGrams - daily targets), createdAt
- **Order**: restaurantId, customerId, orderDate, status, macroTargets (snapshot), selections[{proteinMealId, carbMealId}], snackMealIds[], notes, createdAt
- **Notification**: restaurantId, customerId, orderId, message, isRead, createdAt

### 12) Frontend Structure Expectations (Angular)

Use a feature-based structure:
- src/app/core/ (auth, guards, interceptors, tenant context)
- src/app/shared/ (ui components, pipes, models, utils)
- src/app/platform/ (super admin: restaurant management)
- src/app/admin/ (dashboard, meals, orders, subscriptions - restaurant-scoped)
- src/app/customer/ (menu/home, my-orders, history, notifications - restaurant-scoped)

#### Routing:
- Separate routes for super_admin, admin, and customer
- Protect with guards (role-based + tenant-aware)
- Display restaurant logo in header for admin/customer

#### RTL:
- All UI must support Arabic RTL:
  - Use dir="rtl" at app root (or per layout)
  - Ensure icons/arrows align correctly in RTL

#### Mobile UX:
- Use sticky bottom action bar for primary actions (e.g., "Submit Order")
- Use safe spacing, large tap targets (44px+)
- Avoid heavy modals on mobile; prefer bottom sheets/drawers

### 13) Backend Structure Expectations (Express)

Use modular architecture:
- src/modules/<feature>/
  - *.model.js (Mongoose schema/model with restaurantId)
  - *.service.js (business logic + tenant filtering)
  - *.controller.js (http handlers)
  - *.routes.js (Express router)
- src/middlewares/
  - auth.middleware.js (JWT verify, extract userId/role/restaurantId)
  - role.middleware.js (role checks: super_admin, admin, customer)
  - tenant.middleware.js (enforce restaurantId filtering)
  - error.middleware.js (centralized error handler)
- src/config/db.js (Mongo connection)

### 14) Tenant Isolation Implementation (CRITICAL)

#### Mongoose Schema Pattern:
```javascript
const mealSchema = new mongoose.Schema({
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Restaurant', 
    required: true,
    index: true // IMPORTANT: index for performance
  },
  name: String,
  // ... other fields
});
```

#### Query Pattern (ALWAYS):
```javascript
// Find meals for admin's restaurant
const meals = await Meal.find({ 
  restaurantId: req.user.restaurantId 
});

// Find order for customer (double isolation)
const order = await Order.findOne({ 
  _id: orderId,
  restaurantId: req.user.restaurantId,
  customerId: req.user.userId 
});
```

#### Middleware Pattern:
```javascript
// tenant.middleware.js
const tenantFilter = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    req.tenantFilter = { restaurantId: req.user.restaurantId };
  }
  next();
};
```

### 15) Validation & Security Rules
- Validate all incoming payloads (zod/joi or manual checks)
- Sanitize and validate IDs
- Enforce role checks on protected endpoints
- **Enforce tenant isolation on ALL queries** (except super_admin platform endpoints)
- Do not expose internal error stacks to clients in production
- Ensure customers can only access their own resources within their restaurant
- Ensure admins can only access their restaurant's resources
- Hash passwords with bcrypt (minimum 10 rounds)
- Validate phone number format

### 16) Image Handling Rules
- Upload meal images via /api/meals/:id/image
- Upload restaurant logos via /api/platform/restaurants (or separate endpoint)
- Store only imageUrl in MongoDB
- Cloudinary is preferred in production; allow local storage for MVP
- Frontend should preview image before uploading

### 17) Authentication & Authorization Flow

#### Login Flow:
1. User sends POST /api/auth/login with `{ phone, password }`
2. Backend validates credentials
3. Backend generates JWT with payload: `{ userId, role, restaurantId }`
4. Backend responds with: `{ accessToken, user, restaurant }`
5. Frontend stores token in localStorage
6. Frontend displays restaurant logo in header (if role !== super_admin)

#### Protected Route Flow:
1. Frontend includes `Authorization: Bearer <token>` header
2. Backend auth middleware validates JWT
3. Extracts `req.user = { userId, role, restaurantId }`
4. Tenant middleware adds filter: `req.tenantFilter = { restaurantId }`
5. Controller applies tenant filter to all queries

### 18) Definition of Done (For each task)

A task is done when:
- Endpoint/UI implemented according to contracts
- **Tenant isolation enforced** (restaurantId filtering)
- Validated inputs + correct auth/role protection
- Returns the expected response shape
- Mobile-first responsive behavior verified
- RTL verified on key screens
- Tested with multiple restaurant contexts

### 19) Instruction for Copilot When Generating Code

When asked to implement a feature:
- Follow this file exactly
- Follow docs/api-contracts-updated.md for exact request/response shapes
- **ALWAYS enforce tenant isolation** (filter by restaurantId)
- Use phone-based authentication (not email)
- Keep code clean and modular
- Prefer clarity and maintainability over cleverness
- Add comments explaining tenant isolation logic
- Include validation for restaurantId ownership
-  Do NOT use deprecated Sass functions like 	 darken() or lighten() 
- Always use modern Sass APIs:
  - @use "sass:color"
  - color.adjust()
  - color.scale()

  