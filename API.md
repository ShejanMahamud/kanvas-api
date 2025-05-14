# Wallpaper API Documentation

## Base URL

```
https://api.wallpaper-app.com/v1
```

## Health Check

### Get API Status

```http
GET /health
```

Response (200 OK):

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-03-20T10:00:00Z",
  "services": {
    "database": "healthy",
    "storage": "healthy",
    "cache": "healthy"
  }
}
```

### Get API Metrics

```http
GET /health/metrics
```

Response (200 OK):

```json
{
  "uptime": "99.99%",
  "responseTime": {
    "avg": 150,
    "p95": 250,
    "p99": 500
  },
  "requests": {
    "total": 1000000,
    "successful": 990000,
    "failed": 10000
  },
  "resources": {
    "cpu": {
      "usage": "45%",
      "load": 2.5
    },
    "memory": {
      "used": "4.2GB",
      "total": "8GB"
    },
    "storage": {
      "used": "750GB",
      "total": "1TB"
    }
  }
}
```

## Rate Limits

The API implements rate limiting to ensure fair usage and system stability:

- Free tier: 100 requests per hour
- Basic tier: 500 requests per hour
- Premium tier: 2000 requests per hour

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1616245200
```

## Authentication

Most endpoints require authentication using a Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Token Format

The JWT token has the following structure:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Token Expiration

- Access tokens expire after 24 hours
- Refresh tokens expire after 30 days
- Token refresh endpoint available at `/auth/refresh`

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authentication token"
  }
}
```

### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "requiredTier": "premium"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "resource": "wallpaper",
    "id": "507f1f77bcf86cd799439011"
  }
}
```

### 429 Too Many Requests

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retryAfter": 3600
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_123456789"
  }
}
```

## Endpoints

### Authentication

#### Register User

```http
POST /auth/register
```

Request body:

```json
{
  "name": "string", // 2-50 characters
  "email": "string", // valid email format
  "password": "string", // min 8 chars, must contain uppercase, lowercase, number, and special char
  "confirmPassword": "string" // must match password
}
```

Response (200 OK):

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "subscriptionTier": "free",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Possible errors:

- `400` - Invalid input data
- `409` - Email already registered
- `429` - Too many registration attempts

#### Login

```http
POST /auth/login
```

Request body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response (200 OK):

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "subscriptionTier": "premium",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Possible errors:

- `400` - Invalid credentials
- `401` - Account locked (too many failed attempts)
- `429` - Too many login attempts

#### Refresh Token

```http
POST /auth/refresh
```

Request body:

```json
{
  "refreshToken": "string"
}
```

Response (200 OK):

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Wallpapers

#### List Wallpapers

```http
GET /wallpapers
```

Query parameters:

- `category` (optional) - Filter by category
- `search` (optional) - Search term
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (1-50, default: 10)
- `sort` (optional) - Sort order: "newest", "popular", "downloads", "trending" (default: "newest")
- `resolution` (optional) - Filter by resolution (e.g., "1920x1080")
- `aspectRatio` (optional) - Filter by aspect ratio (e.g., "16:9")
- `color` (optional) - Filter by dominant color (e.g., "blue", "red")
- `minDownloads` (optional) - Minimum number of downloads
- `minLikes` (optional) - Minimum number of likes
- `isPremium` (optional) - Filter by premium status
- `createdAfter` (optional) - Filter by creation date (ISO 8601)
- `createdBefore` (optional) - Filter by creation date (ISO 8601)

Response (200 OK):

```json
{
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "resolution": "1920x1080",
      "aspectRatio": "16:9",
      "fileSize": 2048576,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z",
      "metadata": {
        "camera": "Canon EOS R5",
        "exposure": "1/125s",
        "focalLength": "24mm",
        "iso": 100,
        "aperture": "f/2.8",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.006,
          "name": "New York City"
        }
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10,
    "hasNext": true,
    "hasPrevious": false
  },
  "filters": {
    "categories": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Nature",
        "count": 50
      }
    ],
    "resolutions": ["1920x1080", "2560x1440", "3840x2160"],
    "aspectRatios": ["16:9", "4:3", "21:9"]
  }
}
```

#### Get Trending Wallpapers

```http
GET /wallpapers/trending
```

Query parameters:

- `timeframe` (optional) - Time period: "day", "week", "month" (default: "week")
- `limit` (optional) - Number of wallpapers (1-100, default: 10)

Response (200 OK):

```json
{
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "resolution": "1920x1080",
      "aspectRatio": "16:9",
      "fileSize": 2048576,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z",
      "metadata": {
        "camera": "Canon EOS R5",
        "exposure": "1/125s",
        "focalLength": "24mm",
        "iso": 100,
        "aperture": "f/2.8",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.006,
          "name": "New York City"
        }
      }
    }
  ]
}
```

#### Get Similar Wallpapers

```http
GET /wallpapers/:wallpaperId/similar
```

Query parameters:

- `limit` (optional) - Number of wallpapers (1-50, default: 10)
- `similarityThreshold` (optional) - Minimum similarity score (0-1, default: 0.7)

Response (200 OK):

```json
{
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "resolution": "1920x1080",
      "aspectRatio": "16:9",
      "fileSize": 2048576,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z",
      "metadata": {
        "camera": "Canon EOS R5",
        "exposure": "1/125s",
        "focalLength": "24mm",
        "iso": 100,
        "aperture": "f/2.8",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.006,
          "name": "New York City"
        }
      }
    }
  ]
}
```

#### Get Wallpaper Collections

```http
GET /wallpapers/collections
```

Query parameters:

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (1-50, default: 10)
- `category` (optional) - Filter by category
- `isPremium` (optional) - Filter by premium status

Response (200 OK):

```json
{
  "collections": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Nature's Finest",
      "description": "A curated collection of the best nature wallpapers",
      "coverImage": "https://api.wallpaper-app.com/collections/nature-cover.jpg",
      "wallpaperCount": 25,
      "isPremium": false,
      "category": "nature",
      "tags": ["nature", "landscape", "outdoors"],
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Collection Wallpapers

```http
GET /wallpapers/collections/:collectionId
```

Query parameters:

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (1-50, default: 10)

Response (200 OK):

```json
{
  "collection": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Nature's Finest",
    "description": "A curated collection of the best nature wallpapers",
    "coverImage": "https://api.wallpaper-app.com/collections/nature-cover.jpg",
    "wallpaperCount": 25,
    "isPremium": false,
    "category": "nature",
    "tags": ["nature", "landscape", "outdoors"],
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  },
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "resolution": "1920x1080",
      "aspectRatio": "16:9",
      "fileSize": 2048576,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z",
      "metadata": {
        "camera": "Canon EOS R5",
        "exposure": "1/125s",
        "focalLength": "24mm",
        "iso": 100,
        "aperture": "f/2.8",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.006,
          "name": "New York City"
        }
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Search Wallpapers

```http
GET /wallpapers/search
```

Query parameters:

- `query` (optional) - Search query (min 2 characters)
- `category` (optional) - Filter by category
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (1-50, default: 10)

Response (200 OK):

```json
{
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Get Wallpaper Categories

```http
GET /wallpapers/categories
```

Response (200 OK):

```json
{
  "categories": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Nature",
      "slug": "nature",
      "description": "Beautiful nature wallpapers",
      "wallpaperCount": 150,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Abstract",
      "slug": "abstract",
      "description": "Abstract art wallpapers",
      "wallpaperCount": 75,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

#### Get Popular Wallpapers

```http
GET /wallpapers/popular
```

Query parameters:

- `limit` (optional) - Number of wallpapers (1-100, default: 10)

Response (200 OK):

```json
{
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

#### Get Most Downloaded Wallpapers

```http
GET /wallpapers/most-downloaded
```

Query parameters:

- `limit` (optional) - Number of wallpapers (1-100, default: 10)

#### Get Wallpaper by ID

```http
GET /wallpapers/:wallpaperId
```

Response (200 OK):

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Mountain Sunset",
  "description": "Beautiful sunset over mountain landscape",
  "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
  "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
  "category": "nature",
  "tags": ["mountains", "sunset", "landscape"],
  "isPremium": false,
  "subscriptionTier": "free",
  "downloads": 1500,
  "likes": 320,
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

#### Get Wallpaper Stats

```http
GET /wallpapers/:wallpaperId/stats
```

Response (200 OK):

```json
{
  "downloads": 1500,
  "likes": 320,
  "views": 5000,
  "saves": 250,
  "dailyStats": [
    {
      "date": "2024-03-20",
      "downloads": 50,
      "views": 200,
      "likes": 10
    }
  ]
}
```

#### Upload Wallpaper

```http
POST /wallpapers
```

Requires authentication and premium subscription.
Request body (multipart/form-data):

- `image` - Image file (max 10MB, supported formats: JPG, PNG, WEBP)
- `title` - String (3-100 characters)
- `description` - String (10-500 characters)
- `category` - String (2-50 characters)
- `tags` - Array of strings (1-10 tags, 2-30 characters each)
- `isPremium` - Boolean
- `subscriptionTier` - Enum: "free", "basic", "premium"
- `resolution` - String (e.g., "1920x1080")
- `aspectRatio` - String (e.g., "16:9")

Response (201 Created):

```json
{
  "id": "507f1f77bcf86cd799439011",
  "title": "Mountain Sunset",
  "description": "Beautiful sunset over mountain landscape",
  "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
  "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
  "category": "nature",
  "tags": ["mountains", "sunset", "landscape"],
  "isPremium": false,
  "subscriptionTier": "free",
  "downloads": 0,
  "likes": 0,
  "resolution": "1920x1080",
  "aspectRatio": "16:9",
  "fileSize": 2048576,
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

Possible errors:

- `400` - Invalid input data
- `401` - Unauthorized
- `403` - Premium subscription required
- `413` - File too large
- `415` - Unsupported file format
- `429` - Rate limit exceeded

#### Save Wallpaper

```http
POST /wallpapers/:wallpaperId/save
```

Requires authentication.

Response (200 OK):

```json
{
  "message": "Wallpaper saved successfully",
  "saved": true
}
```

#### Unsave Wallpaper

```http
DELETE /wallpapers/:wallpaperId/save
```

Requires authentication.

#### Delete Wallpaper

```http
DELETE /wallpapers/:wallpaperId
```

Requires authentication.

#### Get Saved Wallpapers

```http
GET /wallpapers/saved
```

Requires authentication.

Response (200 OK):

```json
{
  "wallpapers": [
    {
      "id": "507f1f77bcf86cd799439011",
      "title": "Mountain Sunset",
      "description": "Beautiful sunset over mountain landscape",
      "imageUrl": "https://api.wallpaper-app.com/images/mountain-sunset.jpg",
      "thumbnailUrl": "https://api.wallpaper-app.com/thumbnails/mountain-sunset.jpg",
      "category": "nature",
      "tags": ["mountains", "sunset", "landscape"],
      "isPremium": false,
      "subscriptionTier": "free",
      "downloads": 1500,
      "likes": 320,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

### Categories

#### List Categories

```http
GET /categories
```

Response (200 OK):

```json
{
  "categories": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Nature",
      "slug": "nature",
      "description": "Beautiful nature wallpapers",
      "wallpaperCount": 150,
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Create Category

```http
POST /categories
```

Requires authentication.
Request body:

```json
{
  "name": "string",
  "slug": "string",
  "description": "string"
}
```

Response (201 Created):

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "Nature",
  "slug": "nature",
  "description": "Beautiful nature wallpapers",
  "wallpaperCount": 0,
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

#### Get Category by ID

```http
GET /categories/:categoryId
```

#### Get Category by Slug

```http
GET /categories/slug/:slug
```

#### Update Category

```http
PUT /categories/:categoryId
```

Requires authentication.
Request body:

```json
{
  "name": "string",
  "slug": "string",
  "description": "string"
}
```

#### Delete Category

```

```
