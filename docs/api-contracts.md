# API Contracts (Request / Response JSON)
## Healthy Meal Ordering & Subscription Management System

**Base URL:** `/api`  
**Auth:** JWT Bearer Token  
`Authorization: Bearer <accessToken>`

**Conventions**
- Success:
```json
{ "success": true, "data": {} }

	•	Error:
    {
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [{ "field": "name", "issue": "Required" }]
  }
}

1) Authentication

POST /auth/login

Login for admin or customer.

Request
{
  "identifier": "user@email.com",
  "password": "password"
}
Response 200
{
  "success": true,
  "data": {
    "accessToken": "JWT_TOKEN",
    "user": {
      "id": "64f0c1...",
      "name": "User Name",
      "role": "admin",
      "email": "user@email.com",
      "phone": "+9665xxxxxxx"
    }
  }
}
Response 401
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid login credentials"
  }
}
2) Meals

GET /meals

Returns meals list for both admin & customer.

Query Params (optional)
	•	availability=daily|weekly|monthly
	•	category=protein|carb|snack
	•	isActive=true|false
	•	q=searchText

Response 200
{
  "success": true,
  "data": [
    {
      "id": "meal_1",
      "name": "Grilled Chicken Meal",
      "description": "Grilled chicken with brown rice",
      "calories": 520,
      "imageUrl": "https://res.cloudinary.com/.../meal.jpg",
      "availability": "daily",
      "category": "protein",
      "isActive": true,
      "createdAt": "2025-12-23T08:12:00.000Z"
    }
  ]
}

POST /meals (Admin only)

Create a new meal.

Request
{
  "name": "Grilled Chicken",
  "description": "High-protein meal",
  "calories": 520,
  "availability": "daily",
  "category": "protein",
  "isActive": true
}
Response 201
{
  "success": true,
  "data": {
    "id": "meal_2",
    "name": "Grilled Chicken",
    "category": "protein",
    "calories": 520,
    "imageUrl": null,
    "createdAt": "2025-12-23T09:00:00.000Z"
  }
}
Response 400
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid meal payload",
    "details": [
      { "field": "name", "issue": "Required" }
    ]
  }
}

PUT /meals/:id (Admin only)

Update a meal.

Request (partial update allowed)
{
  "name": "Grilled Chicken (Updated)",
  "calories": 550,
  "isActive": true
}
Response 200
{
  "success": true,
  "data": {
    "id": "meal_2",
    "updated": true
  }
}

DELETE /meals/:id (Admin only)

Delete a meal.

Response 200
{
  "success": true,
  "data": {
    "id": "meal_2",
    "deleted": true
  }
}

⸻

POST /meals/:id/image (Admin only)

Upload meal image.

Content-Type: multipart/form-data
Form field: image

Response 200
{
  "success": true,
  "data": {
    "id": "meal_2",
    "imageUrl": "https://res.cloudinary.com/.../meal_2.png"
  }
}


⸻

3) Subscriptions (Admin only)

POST /subscriptions

Create a subscription for a customer.

Implementation note: if customer already exists by phone/email, reuse the existing customer.

Request
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
Response 201
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1",
    "customerId": "cus_1",
    "status": "active"
  }
}


⸻

GET /subscriptions

List subscriptions.

Query Params (optional)
	•	status=active|paused
	•	q=searchText
	•	endsBefore=YYYY-MM-DD

Response 200
{
  "success": true,
  "data": [
    {
      "id": "sub_1",
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
      "startDate": "2025-12-23",
      "endDate": "2026-01-23",
      "status": "active",
      "createdAt": "2025-12-23T09:30:00.000Z"
    }
  ]
}

PATCH /subscriptions/:id

Update subscription status or dates.

Request
{
  "status": "paused",
  "endDate": "2026-01-31"
}
Response 200
{
  "success": true,
  "data": {
    "id": "sub_1",
    "updated": true
  }
}

⸻

4) Orders

POST /orders (Customer only)

Create a daily order.

Request
{
  "orderDate": "2025-12-26",
  "selections": [
    { "proteinMealId": "meal_p1", "carbMealId": "meal_c2" },
    { "proteinMealId": "meal_p3", "carbMealId": "meal_c1" }
  ],
  "snackMealIds": ["meal_s1"],
  "notes": "No sauce"
}
Response 201
{
  "success": true,
  "data": {
    "orderId": "ord_1",
    "status": "pending",
    "createdAt": "2025-12-23T09:10:00.000Z"
  }
}
Response 409 (Duplicate order same day)
{
  "success": false,
  "error": {
    "code": "ORDER_ALREADY_EXISTS",
    "message": "An order already exists for this date"
  }
}


⸻

GET /orders/today (Admin only)

Get today’s orders (grouped and ready for mobile UI).

Query Params (optional)
	•	date=YYYY-MM-DD
	•	status=pending|preparing|ready|completed

Response 200
{
  "success": true,
  "data": {
    "date": "2025-12-26",
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


⸻

GET /orders/my (Customer only)

Get customer orders history.

Query Params (optional)
	•	from=YYYY-MM-DD
	•	to=YYYY-MM-DD
	•	limit=20

Response 200
{
  "success": true,
  "data": [
    {
      "id": "ord_1",
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

⸻

PATCH /orders/:id/status (Admin only)

Update order status.

Request
{
  "status": "ready"
}
Response 200
{
  "success": true,
  "data": {
    "orderId": "ord_1",
    "status": "ready",
    "updatedAt": "2025-12-23T10:20:00.000Z"
  }
}


⸻

POST /orders/:id/notify (Admin only)

Send internal notification to the customer (MVP).

Later, can be replaced/extended by SMS or WhatsApp Business API.

Request
{
  "type": "READY_FOR_PICKUP",
  "message": "Your order is ready for pickup ✅"
}
Response 200
{
  "success": true,
  "data": {
    "notificationId": "not_1",
    "sent": true
  }
}


⸻

5) Notifications (Recommended for MVP)

GET /notifications/my (Customer only)

List customer notifications.

Response 200
{
  "success": true,
  "data": [
    {
      "id": "not_1",
      "message": "Your order is ready for pickup ✅",
      "orderId": "ord_1",
      "isRead": false,
      "createdAt": "2025-12-23T10:22:00.000Z"
    }
  ]
}


⸻

PATCH /notifications/:id/read (Customer only)

Mark notification as read.

Request
{
  "isRead": true
}
Response 200
{
  "success": true,
  "data": {
    "id": "not_1",
    "updated": true
  }
}


⸻

6) Authorization Summary
	•	Admin-only: /meals (create/update/delete/image), /orders/today, /orders/:id/status, /orders/:id/notify, /subscriptions/

	•	Customer-only: /orders (create), /orders/my, /notifications

⸻

7) Notes for Implementation (Express + Mongoose)
	•	Use centralized error handler and return the standard error shape.
	•	Validate payloads (zod/joi or manual checks).
	•	Prevent customers from accessing other customers’ data.
	•	Image upload: return a public imageUrl and store it in Meal.