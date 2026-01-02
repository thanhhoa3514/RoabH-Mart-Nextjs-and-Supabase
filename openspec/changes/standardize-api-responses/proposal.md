# Standardize API Responses

## Overview

This change standardizes all API endpoint responses across the application to use the existing `ResponseHelper` utility class defined in `src/utils/api-response.ts`. Currently, many API routes use inconsistent response formats with direct `NextResponse.json()` calls, leading to:

- **Inconsistent response structures** across different endpoints
- **Missing metadata** (timestamps, request IDs) in responses
- **Inconsistent error handling** and error response formats
- **Difficult client-side error handling** due to varying error structures
- **Poor debugging experience** without standardized request tracking

## Problem Statement

### Current State

The codebase has a well-defined `ResponseHelper` class with:
- Standardized success responses with metadata
- Consistent error responses with error codes
- Pagination support
- Request ID tracking
- Timestamp inclusion
- Development-mode stack traces

However, **most API routes bypass this utility** and use raw `NextResponse.json()` calls with ad-hoc response structures.

### Examples of Inconsistency

**Current inconsistent patterns found:**

```typescript
// Pattern 1: Simple object
return NextResponse.json({ error: 'Not found' }, { status: 404 });

// Pattern 2: With data wrapper
return NextResponse.json({ data: result });

// Pattern 3: With success flag
return NextResponse.json({ success: true, message: '...', data: ... });

// Pattern 4: Direct error
return NextResponse.json({ error: error.message }, { status: 500 });
```

**Desired standardized format:**

```typescript
// Success
return ResponseHelper.success(data);

// Error
return ResponseHelper.notFound('Resource not found');
```

## Goals

1. **Consistency**: All API responses follow the same structure
2. **Traceability**: Every response includes timestamp and request ID
3. **Type Safety**: Leverage TypeScript interfaces for response types
4. **Developer Experience**: Simplified error handling on client-side
5. **Debugging**: Better error tracking with request IDs and structured errors
6. **Maintainability**: Single source of truth for response formatting

## Scope

### In Scope

- Refactor all API routes in `src/app/api/` to use `ResponseHelper`
- Update response types to match `ApiResponse<T>` interface
- Ensure all success responses include proper metadata
- Standardize all error responses with error codes
- Update client-side API calls to handle standardized responses

### Out of Scope

- Webhook endpoints (Stripe) - these may need specific response formats
- Server actions (if any) - different from API routes
- Middleware responses - may have different requirements
- Changes to the `ResponseHelper` class itself (already well-designed)

## Affected Areas

### API Routes to Update

Based on grep search, approximately **100+ endpoints** need updates across:

- `/api/products/*` - Product CRUD operations
- `/api/orders/*` - Order management
- `/api/checkout` - Checkout process
- `/api/cart/*` - Cart operations  
- `/api/upload` - File uploads
- `/api/auth/*` - Authentication (if any)
- Other API routes

### Client-Side Updates

- Update API client utilities to expect `ApiResponse<T>` format
- Update error handling to use standardized error codes
- Update loading/success states to use metadata

## Benefits

### For Developers

- **Consistent API**: Same response structure everywhere
- **Better DX**: Helper methods like `ResponseHelper.created()`, `ResponseHelper.notFound()`
- **Type Safety**: Full TypeScript support with `ApiResponse<T>`
- **Less Boilerplate**: No need to manually construct response objects

### For Debugging

- **Request Tracking**: Every response has a unique `requestId`
- **Timestamps**: Know exactly when responses were generated
- **Structured Errors**: Consistent error codes and details
- **Stack Traces**: Automatic in development mode

### For Clients

- **Predictable Responses**: Always know the response structure
- **Easy Error Handling**: Check `response.success` and handle `response.error`
- **Metadata Access**: Pagination, timestamps, etc. always available

## Implementation Strategy

### Phase 1: Core API Routes (High Priority)

1. **Orders API** - Critical for business operations
2. **Products API** - Core catalog functionality  
3. **Checkout API** - Payment flow
4. **Cart API** - Shopping cart operations

### Phase 2: Secondary Routes (Medium Priority)

5. **Upload API** - File handling
6. **Auth API** - User authentication
7. **Other utility endpoints**

### Phase 3: Client Updates (Final)

8. Update client-side API utilities
9. Update error handling components
10. Update type definitions

## Migration Pattern

### Before

```typescript
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    
    if (!data) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### After

```typescript
import { ResponseHelper } from '@/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    
    if (!data) {
      return ResponseHelper.notFound('Resource not found');
    }
    
    return ResponseHelper.success(data);
  } catch (error) {
    return ResponseHelper.internalServerError(
      'Failed to fetch data',
      error
    );
  }
}
```

## Success Criteria

- [ ] All API routes use `ResponseHelper` for responses
- [ ] No direct `NextResponse.json()` calls in API routes (except webhooks)
- [ ] All responses include `success`, `meta.timestamp`, and `meta.requestId`
- [ ] Error responses use standardized error codes
- [ ] Client-side code handles `ApiResponse<T>` format
- [ ] TypeScript types are properly enforced
- [ ] Documentation updated with response format examples

## Risks & Mitigation

### Risk: Breaking Changes for Clients

**Mitigation**: 
- Update client-side code in the same change
- Test all API integrations thoroughly
- Consider adding response format version if needed

### Risk: Large Scope

**Mitigation**:
- Break into phases (orders → products → checkout → others)
- Use automated testing to catch regressions
- Review each route category separately

### Risk: Webhook Compatibility

**Mitigation**:
- Explicitly exclude webhook endpoints from standardization
- Document which endpoints use custom formats and why

## Questions for Clarification

1. Should webhook endpoints (`/api/webhooks/*`) also be standardized, or do they need custom formats for third-party services?
2. Are there any API routes that intentionally need different response formats?
3. Should we add response format versioning (e.g., `meta.version: 'v1'`) for future flexibility?
4. Do we need backward compatibility, or can we make breaking changes to response format?

## Next Steps

1. **Review & Approve** this proposal
2. **Create detailed tasks** in `tasks.md`
3. **Define spec requirements** for API response standardization
4. **Begin implementation** starting with Phase 1 (Orders API)
