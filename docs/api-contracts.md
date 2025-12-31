# API Contracts (Request / Response JSON)
## Healthy Meal Ordering & Subscription Management System
## Multi-Tenant SaaS Platform

**Base URL:** `/api`  
**Auth:** JWT Bearer Token  
`Authorization: Bearer <accessToken>`

**JWT Payload Structure:**
```json
{
  "userId": "64f0c1...",
  "role": "admin",
  "restaurantId": "64f0a8..."
}
```
_Note: `restaurantId` is `null` for `super_admin` role._

**Conventions**
- Success:
```json
{ "success": true, "data": {} }
```

- Error:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [{ "field": "name", "issue": "Required" }]
  }
}
```

---

## 1) Authentication

### POST /auth/login

Login for super_admin, admin, or customer using **phone + password**.

**Request**
```json
{
  "phone": "+9665xxxxxxx",
  "password": "password123"
}
```

**Response 200 - Admin/Customer**
```json
{
  "success": true,
  "data": {
    "accessToken": "JWT_TOKEN",
    "user": {
      "id": "64f0c1...",
      "name": "Mohammed Ahmed",
      "role": "admin",
      "phone": "+9665xxxxxxx",
      "email": "m@email.com",
      "restaurantId": "64f0a8..."
    },
    "restaurant": {
      "id": "64f0a8...",
      "name": "Healthy Bites Riyadh",
      "logoUrl": "https://res.cloudinary.com/.../logo.png"
    }
  }
}
```

**Response 200 - Super Admin**
```json
{
  "success": true,
  "data": {
    "accessToken": "JWT_TOKEN",
    "user": {
      "id": "64f0c1...",
      "name": "Platform Owner",
      "role": "super_admin",
      "phone": "+9665xxxxxxx",
      "email": "admin@platform.com",
      "restaurantId": null
    },
    "restaurant": null
  }
}
```

**Response 401**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid phone or password"
  }
}
```

---

## 2) Platform Management (Super Admin Only)

### POST /platform/restaurants

Create a new restaurant and its initial admin user.

**Auth:** super_admin only

**Request**
```json
{
  "restaurant": {
    "name": "Healthy Bites Riyadh",
    "logoUrl": "https://res.cloudinary.com/.../logo.png"
  },
  "admin": {
    "name": "Ahmed Ali",
    "phone": "+9665xxxxxxx",
    "password": "Temp@1234",
    "email": "ahmed@healthybites.com"
  }
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "restaurantId": "64f0a8...",
    "adminUserId": "64f0c1...",
    "message": "Restaurant and admin user created successfully"
  }
}
```

**Response 403**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only super admins can create restaurants"
  }
}
```

---

### GET /platform/restaurants

List all restaurants (optional MVP).

**Auth:** super_admin only

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "64f0a8...",
      "name": "Healthy Bites Riyadh",
      "logoUrl": "https://...",
      "createdAt": "2025-12-26T10:00:00.000Z",
      "stats": {
        "adminCount": 2,
        "customerCount": 45,
        "activeSubscriptions": 38
      }
    }
  ]
}
```

---

## 3) Meals (Admin Only - Restaurant Scoped)

All meal operations are automatically scoped to `req.user.restaurantId`.

### GET /meals

Returns meals for the authenticated user's restaurant.

**Auth:** admin or customer

**Query Params (optional)**
- `availability=daily|weekly|monthly`
- `category=protein|carb|snack`
- `isActive=true|false`
- `q=searchText`

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "meal_1",
      "restaurantId": "64f0a8...",
      "name": "Grilled Chicken Meal",
      "description": "Grilled chicken with brown rice",
      "calories": 520,
      "imageUrl": "https://res.cloudinary.com/.../meal.jpg",
      "availability": "daily",
      "category": "protein",
      "isActive": true,
      "createdAt": "2025-12-26T08:12:00.000Z"
    }
  ]
}
```

---

### POST /meals

Create a new meal (automatically assigned to admin's restaurant).

**Auth:** admin only

**Request**
```json
{
  "name": "Grilled Chicken",
  "description": "High-protein meal",
  "calories": 520,
  "availability": "daily",
  "category": "protein",
  "isActive": true
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "id": "meal_2",
    "restaurantId": "64f0a8...",
    "name": "Grilled Chicken",
    "category": "protein",
    "calories": 520,
    "imageUrl": null,
    "createdAt": "2025-12-26T09:00:00.000Z"
  }
}
```

**Response 400**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid meal payload",
    "details": [
      { "field": "name", "issue": "Required" },
      { "field": "category", "issue": "Must be protein, carb, or snack" }
    ]
  }
}
```

---

### PUT /meals/:id

Update a meal (must belong to admin's restaurant).

**Auth:** admin only

**Request (partial update allowed)**
```json
{
  "name": "Grilled Chicken (Updated)",
  "calories": 550,
  "isActive": true
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "meal_2",
    "updated": true
  }
}
```

**Response 404**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Meal not found or does not belong to your restaurant"
  }
}
```

---

### DELETE /meals/:id

Delete a meal (must belong to admin's restaurant).

**Auth:** admin only

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "meal_2",
    "deleted": true
  }
}
```

---

### POST /meals/:id/image

Upload meal image.

**Auth:** admin only  
**Content-Type:** multipart/form-data  
**Form field:** `image`

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "meal_2",
    "imageUrl": "https://res.cloudinary.com/.../meal_2.png"
  }
}
```

---

## 4) Subscriptions (Admin Only - Restaurant Scoped)

### POST /subscriptions

Create a subscription for a customer. If customer doesn't exist, creates User record.

**Auth:** admin only

**Request**
```json
{
  "customer": {
    "name": "Mohammed Ahmed",
    "phone": "+9665xxxxxxx",
    "email": "m@email.com",
    "password": "Temp@1234"
  },
  "plan": {
    "mealsPerDay": 2,
    "includesSnack": true
  },
  "macros": {
    "proteinGrams": 150,
    "carbsGrams": 150
  },
  "startDate": "2025-12-26",
  "endDate": "2026-01-26",
  "status": "active"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1",
    "customerId": "cus_1",
    "restaurantId": "64f0a8...",
    "status": "active"
  }
}
```

**Implementation Notes:**
- Check if customer exists by phone
- If exists and belongs to this restaurant, reuse
- If exists but belongs to different restaurant, return error
- If doesn't exist, create new User with `role: 'customer'` and link to `restaurantId`

---

### GET /subscriptions

List subscriptions for the authenticated admin's restaurant.

**Auth:** admin only

**Query Params (optional)**
- `status=active|paused`
- `q=searchText`
- `endsBefore=YYYY-MM-DD`

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "sub_1",
      "restaurantId": "64f0a8...",
      "customer": {
        "id": "cus_1",
        "name": "Mohammed Ahmed",
        "phone": "+9665xxxxxxx",
        "email": "m@email.com"
      },
      "plan": {
        "mealsPerDay": 2,
        "includesSnack": true
      },
      "macros": {
        "proteinGrams": 150,
        "carbsGrams": 150
      },
      "startDate": "2025-12-26",
      "endDate": "2026-01-26",
      "status": "active",
      "createdAt": "2025-12-26T09:30:00.000Z"
    }
  ]
}
```

---

### PATCH /subscriptions/:id

Update subscription status or dates.

**Auth:** admin only

**Request**
```json
{
  "status": "paused",
  "endDate": "2026-01-31"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "sub_1",
    "updated": true
  }
}
```

---

## 5) Orders (Restaurant Scoped)

### POST /orders

Create a daily order (customer only).

**Auth:** customer only  
**Validation:** Customer must have an active subscription in their restaurant.

**Request**
```json
{
  "orderDate": "2025-12-26",
  "selections": [
    { "proteinMealId": "meal_p1", "carbMealId": "meal_c2" },
    { "proteinMealId": "meal_p3", "carbMealId": "meal_c1" }
  ],
  "snackMealIds": ["meal_s1"],
  "notes": "No sauce"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_1",
    "restaurantId": "64f0a8...",
    "status": "pending",
    "createdAt": "2025-12-26T09:10:00.000Z"
  }
}
```

**Response 409 (Duplicate order same day)**
```json
{
  "success": false,
  "error": {
    "code": "ORDER_ALREADY_EXISTS",
    "message": "An order already exists for this date"
  }
}
```

**Response 403 (No active subscription)**
```json
{
  "success": false,
  "error": {
    "code": "NO_ACTIVE_SUBSCRIPTION",
    "message": "You must have an active subscription to place orders"
  }
}
```

**Response 400 (Validation error)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid order data",
    "details": [
      { "field": "selections", "issue": "Must match subscription.plan.mealsPerDay" },
      { "field": "snackMealIds", "issue": "Maximum 1 snack allowed" }
    ]
  }
}
```

---

### GET /orders/today

Get today's orders for the admin's restaurant.

**Auth:** admin only

**Query Params (optional)**
- `date=YYYY-MM-DD`
- `status=pending|preparing|ready|completed`

**Response 200**
```json
{
  "success": true,
  "data": {
    "date": "2025-12-26",
    "restaurantId": "64f0a8...",
    "orders": [
      {
        "id": "ord_1",
        "customer": {
          "id": "cus_1",
          "name": "Mohammed Ahmed",
          "phone": "+9665xxxxxxx"
        },
        "macroTargets": {
          "proteinGrams": 150,
          "carbsGrams": 150
        },
        "selections": [
          {
            "proteinMeal": {
              "id": "meal_p1",
              "name": "Grilled Chicken",
              "category": "protein",
              "calories": 250,
              "imageUrl": "https://..."
            },
            "carbMeal": {
              "id": "meal_c1",
              "name": "Brown Rice",
              "category": "carb",
              "calories": 200,
              "imageUrl": "https://..."
            }
          },
          {
            "proteinMeal": {
              "id": "meal_p2",
              "name": "Grilled Salmon",
              "category": "protein",
              "calories": 280,
              "imageUrl": "https://..."
            },
            "carbMeal": {
              "id": "meal_c2",
              "name": "Sweet Potato",
              "category": "carb",
              "calories": 180,
              "imageUrl": "https://..."
            }
          }
        ],
        "snacks": [
          {
            "id": "meal_s1",
            "name": "Mixed Nuts",
            "category": "snack",
            "calories": 150,
            "imageUrl": "https://..."
          }
        ],
        "status": "preparing",
        "notes": "No sauce",
        "createdAt": "2025-12-26T09:10:00.000Z"
      }
    ]
  }
}
```

---

### GET /orders/my

Get customer's order history (restaurant-scoped).

**Auth:** customer only

**Query Params (optional)**
- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`
- `limit=20`

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "ord_1",
      "restaurantId": "64f0a8...",
      "orderDate": "2025-12-26",
      "status": "ready",
      "macroTargets": {
        "proteinGrams": 150,
        "carbsGrams": 150
      },
      "selections": [
        {
          "proteinMealId": "meal_p1",
          "carbMealId": "meal_c1"
        },
        {
          "proteinMealId": "meal_p2",
          "carbMealId": "meal_c2"
        }
      ],
      "snackMealIds": ["meal_s1"],
      "notes": "No sauce",
      "createdAt": "2025-12-26T09:10:00.000Z"
    }
  ]
}
```

---

### PATCH /orders/:id/status

Update order status (admin only, restaurant-scoped).

**Auth:** admin only

**Request**
```json
{
  "status": "ready"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "orderId": "ord_1",
    "status": "ready",
    "updatedAt": "2025-12-26T10:20:00.000Z"
  }
}
```

---

### POST /orders/:id/notify

Send internal notification to the customer.

**Auth:** admin only

**Request**
```json
{
  "type": "READY_FOR_PICKUP",
  "message": "Your order is ready for pickup ✅"
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "notificationId": "not_1",
    "sent": true
  }
}
```

---

## 6) Notifications (Customer Only - Restaurant Scoped)

### GET /notifications/my

List customer notifications for their restaurant.

**Auth:** customer only

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "id": "not_1",
      "restaurantId": "64f0a8...",
      "message": "Your order is ready for pickup ✅",
      "orderId": "ord_1",
      "isRead": false,
      "createdAt": "2025-12-26T10:22:00.000Z"
    }
  ]
}
```

---

### PATCH /notifications/:id/read

Mark notification as read.

**Auth:** customer only

**Request**
```json
{
  "isRead": true
}
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "id": "not_1",
    "updated": true
  }
}
```

---

## 7) Authorization Summary

| Endpoint | super_admin | admin | customer | Scope |
|----------|-------------|-------|----------|-------|
| POST /platform/restaurants | ✅ | ❌ | ❌ | Platform |
| GET /platform/restaurants | ✅ | ❌ | ❌ | Platform |
| GET /meals | ❌ | ✅ | ✅ | Restaurant |
| POST /meals | ❌ | ✅ | ❌ | Restaurant |
| PUT /meals/:id | ❌ | ✅ | ❌ | Restaurant |
| DELETE /meals/:id | ❌ | ✅ | ❌ | Restaurant |
| POST /meals/:id/image | ❌ | ✅ | ❌ | Restaurant |
| POST /subscriptions | ❌ | ✅ | ❌ | Restaurant |
| GET /subscriptions | ❌ | ✅ | ❌ | Restaurant |
| PATCH /subscriptions/:id | ❌ | ✅ | ❌ | Restaurant |
| POST /orders | ❌ | ❌ | ✅ | Restaurant |
| GET /orders/today | ❌ | ✅ | ❌ | Restaurant |
| GET /orders/my | ❌ | ❌ | ✅ | Restaurant |
| PATCH /orders/:id/status | ❌ | ✅ | ❌ | Restaurant |
| POST /orders/:id/notify | ❌ | ✅ | ❌ | Restaurant |
| GET /notifications/my | ❌ | ❌ | ✅ | Restaurant |
| PATCH /notifications/:id/read | ❌ | ❌ | ✅ | Restaurant |

---

## 8) Multi-Tenancy Implementation Notes

### Backend Middleware
```javascript
// All restaurant-scoped routes must:
1. Extract restaurantId from JWT: req.user.restaurantId
2. Filter queries by restaurantId
3. Validate that accessed resources belong to the user's restaurant
```

### Example Query Pattern
```javascript
// Admin fetching meals
const meals = await Meal.find({ 
  restaurantId: req.user.restaurantId,
  isActive: true 
});

// Customer fetching orders
const orders = await Order.find({ 
  restaurantId: req.user.restaurantId,
  customerId: req.user.userId 
});
```

### Security Rules
- Super admin can access platform endpoints only
- Admin/Customer cannot access other restaurants' data
- All mutations must validate restaurantId ownership
- JWT must be validated and decoded on every protected route
