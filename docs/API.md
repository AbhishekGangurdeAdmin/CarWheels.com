# CarWheels API Documentation

Complete API reference for CarWheels.com backend.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe",
  "phone": "+91-9876543210",
  "city": "Mumbai",
  "state": "Maharashtra"
}

Response: 201 Created
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  },
  "token": "eyJhbGc..."
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response: 200 OK
{
  "user": {...},
  "token": "eyJhbGc..."
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+91-9876543210",
    "city": "Mumbai",
    "avatar_url": null,
    "role": "user"
  }
}
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe Updated",
  "city": "Bangalore"
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": {...}
}
```

---

## Vehicle Endpoints

### List Vehicles
```http
GET /vehicles?page=1&limit=12&category=SUV&fuelType=Diesel&sortBy=price_low

Query Parameters:
- page: number (default: 1)
- limit: number (default: 12, max: 100)
- category: string (SUV, Sedan, Hatchback, etc.)
- fuelType: string (Petrol, Diesel, Electric)
- transmission: string (Manual, Automatic)
- minPrice: number
- maxPrice: number
- sortBy: string (popularity, price_low, price_high, rating)

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "name": "Swift",
      "brand_name": "Maruti Suzuki",
      "category": "Hatchback",
      "fuel_type": "Petrol",
      "transmission": "Manual",
      "starting_price": 550000,
      "average_rating": 4.5,
      "rating_count": 1200,
      "image_url": "https://...",
      "seating_capacity": 5,
      "mileage": "23.2 km/l"
    }
  ],
  "total": 2000,
  "page": 1,
  "pages": 167
}
```

### Get Vehicle Details
```http
GET /vehicles/maruti-swift

Response: 200 OK
{
  "vehicle": {
    "id": 1,
    "name": "Swift",
    "slug": "maruti-swift",
    "brand_id": 1,
    "brand_name": "Maruti Suzuki",
    "category": "Hatchback",
    "fuel_type": "Petrol",
    "transmission": "Manual",
    "body_type": "Hatchback",
    "seating_capacity": 5,
    "engine_displacement": 1197,
    "max_power": "82 bhp",
    "max_torque": "113 Nm",
    "mileage": "23.2 km/l",
    "acceleration_0_100": "10.2 seconds",
    "top_speed": "180 km/h",
    "weight": 860,
    "boot_space": 268,
    "tank_capacity": 42,
    "ground_clearance": "170 mm",
    "warranty_basic": "3 years/100,000 km",
    "warranty_powertrain": "5 years/100,000 km",
    "starting_price": 550000,
    "average_rating": 4.5,
    "rating_count": 1200,
    "image_url": "https://..."
  },
  "variants": [
    {
      "id": 1,
      "name": "LXi",
      "price": 550000,
      "features": "Power Steering, Power Windows",
      "transmission": "Manual",
      "mileage": "23.2 km/l"
    }
  ],
  "similar": [
    // Similar vehicles in same category
  ]
}
```

### Search Vehicles
```http
GET /vehicles/search?q=swift

Response: 200 OK
{
  "vehicles": [
    {
      "id": 1,
      "name": "Swift",
      "brand_name": "Maruti Suzuki",
      ...
    }
  ]
}
```

### Get Categories
```http
GET /vehicles/categories

Response: 200 OK
{
  "categories": [
    "SUV",
    "Sedan",
    "Hatchback",
    "MPV",
    "Cruiser",
    "Sports Bike",
    "EV"
  ]
}
```

---

## Review Endpoints

### Get Reviews
```http
GET /reviews/1?page=1

Query Parameters:
- vehicleId: number (required)
- page: number (default: 1)

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "vehicle_id": 1,
      "user_id": 5,
      "title": "Great car for city driving",
      "content": "Very comfortable and fuel efficient...",
      "rating": 4.5,
      "full_name": "John Doe",
      "avatar_url": "https://...",
      "created_at": "2026-02-10T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "pages": 15
}
```

### Add Review
```http
POST /reviews/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Excellent vehicle",
  "content": "Very satisfied with the purchase. Great performance and reliability.",
  "rating": 4.5
}

Response: 201 Created
{
  "message": "Review added successfully",
  "review": {...}
}
```

### Delete Review
```http
DELETE /reviews/1
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Review deleted successfully"
}
```

---

## Wishlist Endpoints

### Get Wishlist
```http
GET /wishlist
Authorization: Bearer <token>

Response: 200 OK
{
  "wishlist": [
    {
      "id": 1,
      "name": "Swift",
      "brand_name": "Maruti Suzuki",
      "starting_price": 550000,
      ...
    }
  ]
}
```

### Add to Wishlist
```http
POST /wishlist/1
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Added to wishlist"
}
```

### Remove from Wishlist
```http
DELETE /wishlist/1
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Removed from wishlist"
}
```

### Check if in Wishlist
```http
GET /wishlist/1/check
Authorization: Bearer <token>

Response: 200 OK
{
  "inWishlist": true
}
```

---

## Comparison Endpoints

### Create Comparison
```http
POST /comparisons
Content-Type: application/json

{
  "vehicleIds": [1, 2, 3]
}

Response: 200 OK
{
  "comparison": {
    "vehicles": [
      {"id": 1, "name": "Swift", ...},
      {"id": 2, "name": "i20", ...},
      {"id": 3, "name": "Creta", ...}
    ],
    "specs": {
      "fuelType": ["Petrol", "Petrol", "Petrol"],
      "transmission": ["Manual", "Manual", "Automatic"],
      "price": [550000, 600000, 1000000],
      ...
    }
  }
}
```

### Get Comparison
```http
GET /comparisons/1

Response: 200 OK
{
  "comparison": {...}
}
```

### Get User Comparisons
```http
GET /comparisons/user/all
Authorization: Bearer <token>

Response: 200 OK
{
  "comparisons": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Vehicle not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes
- **Header**: `X-RateLimit-Remaining`

---

## Sample cURL Requests

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","full_name":"John"}'

# Get vehicles
curl -X GET "http://localhost:5000/api/vehicles?category=SUV&page=1"

# Add review (auth required)
curl -X POST http://localhost:5000/api/reviews/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Great","content":"Excellent car","rating":4.5}'
```

---

For more help, contact: support@carwheels.com
