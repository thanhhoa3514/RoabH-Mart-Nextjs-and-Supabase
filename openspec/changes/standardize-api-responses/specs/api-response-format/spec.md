# API Response Format Specification

## Overview

This specification defines the standardized response format for all API endpoints in the RoabH Mart e-commerce platform. All API routes must return responses using the `ResponseHelper` utility class to ensure consistency, traceability, and improved developer experience.

---

## ADDED Requirements

### Requirement: Standardized Success Response Structure

All successful API responses MUST follow the `ApiResponse<T>` interface format with the following structure:

```typescript
{
  success: true,
  data: T,
  meta: {
    timestamp: string,      // ISO 8601 format
    requestId: string,      // Unique identifier
    pagination?: {          // Optional for paginated responses
      page: number,
      limit: number,
      total: number,
      totalPages: number,
      hasNext: boolean,
      hasPrev: boolean
    }
  }
}
```

#### Scenario: Fetching a single product

**Given** a client requests product details via `GET /api/products/123`  
**When** the product exists in the database  
**Then** the API returns a 200 status with:
```json
{
  "success": true,
  "data": {
    "product_id": 123,
    "name": "Sample Product",
    "price": 29.99
  },
  "meta": {
    "timestamp": "2025-12-26T14:12:00.000Z",
    "requestId": "req_abc123xyz"
  }
}
```

#### Scenario: Fetching a paginated product list

**Given** a client requests products via `GET /api/products?page=2&limit=10`  
**When** there are 45 total products in the database  
**Then** the API returns a 200 status with:
```json
{
  "success": true,
  "data": [
    { "product_id": 11, "name": "Product 11" },
    { "product_id": 12, "name": "Product 12" }
  ],
  "meta": {
    "timestamp": "2025-12-26T14:12:00.000Z",
    "requestId": "req_xyz789abc",
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

---

### Requirement: Standardized Error Response Structure

All error responses MUST follow the `ApiResponse<null>` interface format with error details:

```typescript
{
  success: false,
  error: {
    code: string,           // Error code enum
    message: string,        // Human-readable message
    details?: unknown,      // Optional error context
    stack?: string          // Stack trace (development only)
  },
  meta: {
    timestamp: string,
    requestId: string
  }
}
```

#### Scenario: Resource not found

**Given** a client requests a non-existent product via `GET /api/products/999`  
**When** product ID 999 does not exist  
**Then** the API returns a 404 status with:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": {
      "productId": 999
    }
  },
  "meta": {
    "timestamp": "2025-12-26T14:12:00.000Z",
    "requestId": "req_def456ghi"
  }
}
```

#### Scenario: Validation error

**Given** a client submits invalid product data via `POST /api/products`  
**When** the request body fails validation (missing required fields)  
**Then** the API returns a 422 status with:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        { "field": "name", "message": "Name is required" },
        { "field": "price", "message": "Price must be positive" }
      ]
    }
  },
  "meta": {
    "timestamp": "2025-12-26T14:12:00.000Z",
    "requestId": "req_jkl012mno"
  }
}
```

#### Scenario: Unauthorized access

**Given** a client attempts to update an order without authentication  
**When** no valid auth token is provided  
**Then** the API returns a 401 status with:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Please log in"
  },
  "meta": {
    "timestamp": "2025-12-26T14:12:00.000Z",
    "requestId": "req_pqr345stu"
  }
}
```

---

### Requirement: ResponseHelper Utility Usage

All API route handlers MUST use the `ResponseHelper` class methods instead of direct `NextResponse.json()` calls.

#### Scenario: Using ResponseHelper for success response

**Given** an API route needs to return successful data  
**When** the handler processes the request  
**Then** it uses `ResponseHelper.success(data)` instead of `NextResponse.json({ data })`

**Example:**
```typescript
// ✅ CORRECT
return ResponseHelper.success(productData);

// ❌ INCORRECT
return NextResponse.json({ data: productData });
```

#### Scenario: Using ResponseHelper for error response

**Given** an API route encounters a not found error  
**When** the handler needs to return an error  
**Then** it uses `ResponseHelper.notFound(message)` instead of manual error construction

**Example:**
```typescript
// ✅ CORRECT
return ResponseHelper.notFound('Product not found');

// ❌ INCORRECT
return NextResponse.json({ error: 'Not found' }, { status: 404 });
```

---

### Requirement: Unique Request ID Generation

Every API response MUST include a unique `requestId` in the metadata for request tracking and debugging.

#### Scenario: Request ID uniqueness

**Given** multiple concurrent API requests  
**When** responses are generated  
**Then** each response has a unique `requestId` (UUID v4 format)

#### Scenario: Request ID in logs

**Given** an error occurs during request processing  
**When** the error is logged  
**Then** the log includes the `requestId` for correlation

**Example:**
```typescript
console.error(`[${meta.requestId}] Failed to process order:`, error);
```

---

### Requirement: ISO 8601 Timestamp Format

All timestamps in API responses MUST use ISO 8601 format with timezone information.

#### Scenario: Timestamp format

**Given** any API response  
**When** the response is generated  
**Then** `meta.timestamp` is in ISO 8601 format (e.g., `"2025-12-26T14:12:00.000Z"`)

---

### Requirement: HTTP Status Code Consistency

API responses MUST use appropriate HTTP status codes that match the response type.

#### Scenario: Success status codes

**Given** successful operations  
**Then** the following status codes are used:
- `200 OK` - Successful GET, PUT, PATCH requests
- `201 Created` - Successful POST requests creating resources
- `204 No Content` - Successful DELETE requests

#### Scenario: Error status codes

**Given** error conditions  
**Then** the following status codes are used:
- `400 Bad Request` - Invalid input or malformed request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource does not exist
- `409 Conflict` - Resource already exists
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server-side errors

---

### Requirement: Error Code Enumeration

All error responses MUST use standardized error codes from the `ErrorCode` enum.

#### Scenario: Using error codes

**Given** different error conditions  
**Then** the appropriate error code is used:
- `BAD_REQUEST` - Invalid request format
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Not authorized
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Duplicate resource
- `VALIDATION_ERROR` - Input validation failed
- `INTERNAL_SERVER_ERROR` - Unexpected server error

---

### Requirement: Development Mode Stack Traces

Error responses in development mode MUST include stack traces for debugging.

#### Scenario: Stack trace in development

**Given** an error occurs in development environment (`NODE_ENV=development`)  
**When** the error response is generated  
**Then** the response includes `error.stack` with the full stack trace

#### Scenario: No stack trace in production

**Given** an error occurs in production environment (`NODE_ENV=production`)  
**When** the error response is generated  
**Then** the response does NOT include `error.stack`

---

### Requirement: Pagination Metadata Calculation

Paginated responses MUST include complete pagination metadata calculated using `ResponseHelper.calculatePagination()`.

#### Scenario: Pagination metadata completeness

**Given** a paginated API response  
**When** the response is generated  
**Then** `meta.pagination` includes:
- `page` - Current page number
- `limit` - Items per page
- `total` - Total number of items
- `totalPages` - Total number of pages
- `hasNext` - Boolean indicating if next page exists
- `hasPrev` - Boolean indicating if previous page exists

---

### Requirement: Type Safety with TypeScript

All API responses MUST be properly typed using the `ApiResponse<T>` generic interface.

#### Scenario: Typed success response

**Given** an API route returns product data  
**When** using ResponseHelper  
**Then** the return type is `NextResponse<ApiResponse<Product>>`

**Example:**
```typescript
export async function GET(): Promise<NextResponse<ApiResponse<Product>>> {
  const product = await fetchProduct();
  return ResponseHelper.success<Product>(product);
}
```

---

### Requirement: Consistent Error Handling Pattern

All API routes MUST follow a consistent try-catch error handling pattern.

#### Scenario: Standard error handling

**Given** any API route handler  
**When** an error occurs during processing  
**Then** the error is caught and returned using appropriate `ResponseHelper` error method

**Example:**
```typescript
export async function GET() {
  try {
    const data = await fetchData();
    if (!data) {
      return ResponseHelper.notFound('Resource not found');
    }
    return ResponseHelper.success(data);
  } catch (error) {
    return ResponseHelper.internalServerError('Failed to fetch data', error);
  }
}
```

---

### Requirement: No Direct NextResponse.json() Usage

API routes MUST NOT use `NextResponse.json()` directly except for webhook endpoints that require specific formats.

#### Scenario: Prohibited direct JSON response

**Given** a standard API route (not a webhook)  
**When** returning a response  
**Then** `ResponseHelper` methods are used instead of `NextResponse.json()`

#### Scenario: Webhook exception

**Given** a webhook endpoint (e.g., `/api/webhooks/stripe`)  
**When** returning a response to third-party service  
**Then** direct `NextResponse.json()` MAY be used if required by the service

---

### Requirement: Client-Side Response Handling

Client-side code MUST handle the standardized `ApiResponse<T>` format.

#### Scenario: Checking response success

**Given** a client makes an API request  
**When** the response is received  
**Then** the client checks `response.success` to determine success/failure

**Example:**
```typescript
const response = await fetch('/api/products');
const data: ApiResponse<Product[]> = await response.json();

if (data.success) {
  setProducts(data.data);
} else {
  showError(data.error.message);
}
```

---

## MODIFIED Requirements

None - This is a new specification.

---

## REMOVED Requirements

None - This is a new specification.

---

## Related Specifications

- **order-management** - Order API endpoints will use standardized responses
- **payment-integration** - Payment/checkout endpoints will use standardized responses

---

## Implementation Notes

1. Start with core business APIs (orders, products, checkout, cart)
2. Update client-side code in parallel with API changes
3. Exclude webhook endpoints from standardization
4. Test thoroughly to ensure no breaking changes to functionality
5. Update API documentation with new response format examples
