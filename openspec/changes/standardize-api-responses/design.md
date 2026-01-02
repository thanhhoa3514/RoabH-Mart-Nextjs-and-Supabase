# Design: Standardize API Responses

## Architecture Overview

This design establishes a consistent API response format across all endpoints using the existing `ResponseHelper` utility class. The standardization ensures predictable client-server communication, improved debugging, and better developer experience.

## Response Format Specification

### Success Response Structure

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;        // ISO 8601 format
    requestId: string;        // Unique identifier for request tracking
    pagination?: {            // Optional, for paginated responses
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "Product Name"
  },
  "meta": {
    "timestamp": "2025-12-26T14:06:00.000Z",
    "requestId": "req_abc123xyz"
  }
}
```

### Error Response Structure

```typescript
interface ApiResponse<null> {
  success: false;
  error: {
    code: string;            // Error code (e.g., "NOT_FOUND", "VALIDATION_ERROR")
    message: string;         // Human-readable error message
    details?: unknown;       // Additional error context
    stack?: string;          // Stack trace (development only)
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": {
      "productId": 123
    }
  },
  "meta": {
    "timestamp": "2025-12-26T14:06:00.000Z",
    "requestId": "req_abc123xyz"
  }
}
```

## ResponseHelper API

### Success Methods

```typescript
// Generic success (200)
ResponseHelper.success<T>(data: T, status?: number, meta?: Partial<ApiMeta>)

// Created (201)
ResponseHelper.created<T>(data: T, meta?: Partial<ApiMeta>)

// No content (204)
ResponseHelper.noContent()
```

### Error Methods

```typescript
// Generic error
ResponseHelper.error(message: string, code: ErrorCode, details?: unknown, customStatus?: number)

// Specific errors
ResponseHelper.badRequest(message?: string, details?: unknown)           // 400
ResponseHelper.unauthorized(message?: string, details?: unknown)         // 401
ResponseHelper.forbidden(message?: string, details?: unknown)            // 403
ResponseHelper.notFound(message?: string, details?: unknown)             // 404
ResponseHelper.conflict(message?: string, details?: unknown)             // 409
ResponseHelper.validationError(message?: string, errors: unknown)        // 422
ResponseHelper.internalServerError(message?: string, details?: unknown)  // 500
```

### Pagination Helper

```typescript
ResponseHelper.calculatePagination(page: number, limit: number, total: number): PaginationMeta
```

## Error Code System

### Standard Error Codes

```typescript
enum ErrorCode {
  // Client Errors (4xx)
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Server Errors (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
```

### Error Code Mapping

```typescript
const ERROR_STATUS_MAP = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
```

## Implementation Patterns

### Pattern 1: Simple GET Request

```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return ResponseHelper.success(data);
  } catch (error) {
    return ResponseHelper.internalServerError('Failed to fetch data', error);
  }
}
```

### Pattern 2: GET with Validation

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return ResponseHelper.badRequest('ID is required');
    }
    
    const data = await fetchById(id);
    
    if (!data) {
      return ResponseHelper.notFound('Resource not found');
    }
    
    return ResponseHelper.success(data);
  } catch (error) {
    return ResponseHelper.internalServerError('Failed to fetch resource', error);
  }
}
```

### Pattern 3: POST with Creation

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return ResponseHelper.validationError(
        'Invalid input',
        validation.error.errors
      );
    }
    
    // Create resource
    const created = await createResource(validation.data);
    
    return ResponseHelper.created(created);
  } catch (error) {
    if (error.code === 'UNIQUE_VIOLATION') {
      return ResponseHelper.conflict('Resource already exists');
    }
    return ResponseHelper.internalServerError('Failed to create resource', error);
  }
}
```

### Pattern 4: DELETE with No Content

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const deleted = await deleteResource(id);
    
    if (!deleted) {
      return ResponseHelper.notFound('Resource not found');
    }
    
    return ResponseHelper.noContent();
  } catch (error) {
    return ResponseHelper.internalServerError('Failed to delete resource', error);
  }
}
```

### Pattern 5: Paginated List

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const { data, total } = await fetchPaginated(page, limit);
    
    const pagination = ResponseHelper.calculatePagination(page, limit, total);
    
    return ResponseHelper.success(data, 200, { pagination });
  } catch (error) {
    return ResponseHelper.internalServerError('Failed to fetch data', error);
  }
}
```

### Pattern 6: Authentication Check

```typescript
export async function PATCH(request: NextRequest) {
  try {
    // Authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return ResponseHelper.unauthorized('Please log in');
    }
    
    // Authorization
    const roleError = await requireRole(user.id, ['admin', 'manager']);
    if (roleError) {
      return ResponseHelper.forbidden(roleError.error);
    }
    
    // Process request
    const result = await updateResource();
    return ResponseHelper.success(result);
  } catch (error) {
    return ResponseHelper.internalServerError('Failed to update resource', error);
  }
}
```

## Client-Side Integration

### API Client Wrapper

```typescript
// utils/api-client.ts
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(url, options);
  const data: ApiResponse<T> = await response.json();
  
  if (!data.success) {
    throw new ApiError(data.error);
  }
  
  return data;
}

// Custom error class
export class ApiError extends Error {
  constructor(public error: ApiError) {
    super(error.message);
    this.name = 'ApiError';
  }
}
```

### Usage in Components

```typescript
// Before
const fetchProducts = async () => {
  const res = await fetch('/api/products');
  const data = await res.json();
  setProducts(data.data || data); // Inconsistent!
};

// After
const fetchProducts = async () => {
  try {
    const response = await apiRequest<Product[]>('/api/products');
    setProducts(response.data);
    console.log('Request ID:', response.meta.requestId);
  } catch (error) {
    if (error instanceof ApiError) {
      toast.error(error.error.message);
      console.error('Error code:', error.error.code);
    }
  }
};
```

## Metadata Features

### Request ID Tracking

- Generated using UUID v4
- Included in every response
- Useful for debugging and log correlation
- Can be sent to error tracking services

### Timestamps

- ISO 8601 format
- Server-side generation ensures consistency
- Useful for caching and debugging

### Pagination Metadata

- Automatically calculated
- Includes navigation helpers (`hasNext`, `hasPrev`)
- Consistent across all paginated endpoints

## Development vs Production

### Development Mode Features

```typescript
if (process.env.NODE_ENV === 'development' && details instanceof Error) {
  error.stack = details.stack;  // Include stack trace
}
```

- Stack traces included in error responses
- Detailed error information
- Helpful for debugging

### Production Mode

- Stack traces excluded
- Minimal error details
- Security-focused error messages

## Migration Strategy

### Gradual Rollout

1. **Phase 1**: Core business-critical APIs (orders, products, checkout)
2. **Phase 2**: Secondary APIs (upload, cart, etc.)
3. **Phase 3**: Client-side updates
4. **Phase 4**: Testing and validation

### Backward Compatibility

- No backward compatibility needed (internal API)
- Client and server updated together
- Breaking changes acceptable for internal use

### Testing Strategy

- Unit tests for `ResponseHelper` methods
- Integration tests for each API route
- Manual testing of complete flows
- Verify response format consistency

## Security Considerations

### Error Information Disclosure

- Production: Generic error messages
- Development: Detailed error information
- Never expose sensitive data in error details
- Sanitize error messages before sending

### Request ID Security

- UUIDs are non-sequential
- No sensitive information in request IDs
- Safe to expose to clients
- Useful for support and debugging

## Performance Considerations

### Response Size

- Minimal overhead from metadata (~100 bytes)
- Pagination reduces payload size
- Consistent structure enables better caching

### Request ID Generation

- UUID v4 generation is fast
- Negligible performance impact
- Can be optimized if needed (e.g., use shorter IDs)

## Monitoring & Debugging

### Request Tracking

```typescript
// Log with request ID
console.log(`[${meta.requestId}] Processing request`);
```

### Error Tracking

```typescript
// Send to error tracking service
if (error) {
  errorTracker.captureException(error, {
    requestId: meta.requestId,
    errorCode: error.code,
  });
}
```

### Analytics

- Track error rates by error code
- Monitor response times
- Analyze pagination usage

## Future Enhancements

### Possible Additions

1. **Response Versioning**: Add `meta.version` for API versioning
2. **Rate Limiting**: Include rate limit info in metadata
3. **Deprecation Warnings**: Add `meta.deprecated` flag
4. **Performance Metrics**: Include server-side timing data
5. **Links**: HATEOAS-style links for related resources

### Extensibility

The `meta` object allows additional fields:
```typescript
meta: {
  timestamp: string;
  requestId: string;
  [key: string]: unknown;  // Allow custom fields
}
```

## Trade-offs

### Pros

✅ Consistent API responses  
✅ Better debugging with request IDs  
✅ Type-safe client integration  
✅ Improved error handling  
✅ Easier testing  
✅ Better developer experience  

### Cons

❌ Slight increase in response size  
❌ Migration effort required  
❌ Breaking changes to existing clients  
❌ Additional boilerplate in some cases  

## Conclusion

This design provides a robust, consistent, and developer-friendly API response format. The existing `ResponseHelper` utility is well-designed and ready for adoption across all endpoints. The migration will improve code quality, debugging capabilities, and overall developer experience.
