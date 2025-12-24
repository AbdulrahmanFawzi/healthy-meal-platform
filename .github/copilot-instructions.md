# Copilot Instructions
## Project: Healthy Meal Ordering & Subscription Management System

### 1) Product Summary
This project replaces WhatsApp-based meal ordering with a structured system:
- Admin (restaurant owner/staff) publishes meal menus (daily/weekly/monthly), manages subscriptions, manages orders, and sends "ready" notifications.
- Customers (subscribers) browse the menu mainly on mobile, select daily meals, and track order status.
- Primary goal: prevent order confusion and missed orders.

### 2) Key Requirement (Mobile-First)
MOST USERS WILL USE MOBILE PHONES.
- Frontend must be designed and implemented **mobile-first**.
- All screens must be responsive on common mobile widths (360–430px).
- Desktop/tablet layouts should be adaptive, but mobile UX is the priority.
- Avoid desktop-only UI patterns (wide tables without fallback). Provide mobile alternatives:
  - Use cards, accordions, drawers, bottom sheets, and sticky action bars.
  - If a table is used on desktop, render a card/list view on mobile.

### 3) Tech Stack
#### Frontend
- Angular + TypeScript + SCSS
- Arabic RTL support
- Angular Router + Guards
- HttpClient + JWT Interceptor
- Component state + Services (no heavy state management in MVP)

#### Backend
- Node.js + Express.js
- MongoDB (Atlas) + Mongoose
- JWT Auth (Bearer)
- File upload: Multer
- Images: Cloudinary (preferred) or local storage (MVP)

### 4) Roles & Authorization
- Roles: `admin`, `customer`
- Admin-only:
  - Create/update/delete meals
  - Upload meal images
  - Manage subscriptions
  - View today’s orders
  - Update order status
  - Send ready notifications
- Customer-only:
  - Browse meals
  - Create daily order
  - View own orders
  - View/mark notifications as read

### 5) Domain Enums (Use exact values)
- `MealAvailability`: `daily` | `weekly` | `monthly`
- `OrderStatus`: `pending` | `preparing` | `ready` | `completed`
- `SubscriptionStatus`: `active` | `paused`
- Notification type (MVP): `READY_FOR_PICKUP`

### 6) API Conventions
- Base path: `/api`
- Request/response is JSON (except image upload uses multipart/form-data)
- Auth header: `Authorization: Bearer <token>`
- Success response shape:
```json
{ "success": true, "data": {} }
	•	Error response shape:
  {
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Human readable message",
    "details": [{ "field": "name", "issue": "Required" }]
  }
}
7) API Endpoints (MVP)

Auth:
	•	POST /api/auth/login

Meals:
	•	GET /api/meals
	•	POST /api/meals (admin)
	•	PUT /api/meals/:id (admin)
	•	DELETE /api/meals/:id (admin)
	•	POST /api/meals/:id/image (admin, multipart: image)

Orders:
	•	POST /api/orders (customer)
	•	GET /api/orders/today (admin)
	•	GET /api/orders/my (customer)
	•	PATCH /api/orders/:id/status (admin)
	•	POST /api/orders/:id/notify (admin)

Subscriptions:
	•	POST /api/subscriptions (admin)
	•	GET /api/subscriptions (admin)
	•	PATCH /api/subscriptions/:id (admin)

Notifications (recommended for mobile UX):
	•	GET /api/notifications/my (customer)
	•	PATCH /api/notifications/:id/read (customer)

8) Data Models (High Level)
	•	User: name, phone, email, role
	•	Meal: name, description, price, calories, imageUrl, availability, isActive
	•	Subscription: customerId, startDate, endDate, status
	•	Order: customerId, items[{mealId, quantity}], status, orderDate, notes
	•	Notification: customerId, orderId, message, isRead, createdAt

9) Frontend Structure Expectations (Angular)

Use a feature-based structure:
	•	src/app/core/ (auth, guards, interceptors)
	•	src/app/shared/ (ui components, pipes, models, utils)
	•	src/app/admin/ (dashboard, meals, orders, subscriptions)
	•	src/app/customer/ (menu/home, my-orders, history, notifications)

Routing:
	•	Separate routes for admin and customer
	•	Protect with guards (role-based)

RTL:
	•	All UI must support Arabic RTL:
	•	Use dir="rtl" at app root (or per layout)
	•	Ensure icons/arrows align correctly in RTL

Mobile UX:
	•	Use sticky bottom action bar for primary actions (e.g., “Submit Order”)
	•	Use safe spacing, large tap targets (44px+)
	•	Avoid heavy modals on mobile; prefer bottom sheets/drawers

10) Backend Structure Expectations (Express)

Use modular architecture:
	•	src/modules/<feature>/
	•	*.model.js (Mongoose schema/model)
	•	*.service.js (business logic)
	•	*.controller.js (http handlers)
	•	*.routes.js (Express router)
	•	src/middlewares/
	•	auth.middleware.js (JWT verify)
	•	role.middleware.js (admin/customer)
	•	error.middleware.js (centralized error handler)
	•	src/config/db.js (Mongo connection)

11) Validation & Security Rules
	•	Validate all incoming payloads (zod/joi or manual checks)
	•	Sanitize and validate IDs
	•	Enforce role checks on protected endpoints
	•	Do not expose internal error stacks to clients in production
	•	Ensure customers can only access their own resources

12) Image Handling Rules
	•	Upload meal images via /api/meals/:id/image
	•	Store only imageUrl in MongoDB
	•	Cloudinary is preferred in production; allow local storage for MVP
	•	Frontend should preview image before uploading

13) Definition of Done (For each task)

A task is done when:
	•	Endpoint/UI implemented according to contracts
	•	Validated inputs + correct auth/role protection
	•	Returns the expected response shape
	•	Mobile-first responsive behavior verified
	•	RTL verified on key screens

14) Instruction for Copilot When Generating Code

When asked to implement a feature:
	•	Follow this file exactly
	•	Follow docs/api-contracts.md (if present) for exact request/response shapes
	•	Keep code clean and modular
	•	Prefer clarity and maintainability over cleverness