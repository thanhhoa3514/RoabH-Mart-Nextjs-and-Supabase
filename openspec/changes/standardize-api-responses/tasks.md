# Tasks: Standardize API Responses

## Phase 1: Core API Routes

### Orders API
- [x] Update `/api/orders/[id]` GET endpoint to use `ResponseHelper`
- [x] Update `/api/orders/[id]` PATCH endpoint to use `ResponseHelper`
- [x] Update `/api/orders/by-number/[orderNumber]` GET endpoint to use `ResponseHelper`
- [/] Test order API responses match `ApiResponse<T>` format
- [/] Verify error responses use proper error codes

### Products API
- [x] Update `/api/products` GET (list) endpoint to use `ResponseHelper`
- [x] Update `/api/products` POST (create) endpoint to use `ResponseHelper.created()`
- [x] Update `/api/products/[id]` GET endpoint to use `ResponseHelper`
- [x] Update `/api/products/[id]` PUT/PATCH endpoint to use `ResponseHelper`
- [x] Update `/api/products/[id]` DELETE endpoint to use `ResponseHelper`
- [ ] Update `/api/products/images` endpoints to use `ResponseHelper`
- [/] Test product API responses with pagination metadata
- [/] Verify product error handling uses standardized codes

### Checkout API
- [x] Update `/api/checkout` POST endpoint to use `ResponseHelper`
- [x] Handle Stripe session creation errors with `ResponseHelper.error()`
- [/] Test checkout flow with standardized responses
- [/] Verify order creation errors are properly formatted

### Cart API
- [x] Update `/api/cart` GET endpoint to use `ResponseHelper`
- [x] Update `/api/cart` POST endpoint to use `ResponseHelper` (add to cart)
- [x] Update `/api/cart` DELETE endpoint to use `ResponseHelper` (clear cart)
- [x] Update `/api/cart/items/[id]` PATCH endpoint to use `ResponseHelper`
- [x] Update `/api/cart/items/[id]` DELETE endpoint to use `ResponseHelper`
- [/] Test cart operations with standardized responses

## Phase 2: Secondary Routes

### Upload API
- [ ] Update `/api/upload` POST endpoint to use `ResponseHelper`
- [ ] Handle file validation errors with `ResponseHelper.badRequest()`
- [ ] Handle upload failures with `ResponseHelper.internalServerError()`
- [ ] Test file upload responses

### Test/Utility Endpoints
- [ ] Update `/api/test-products` endpoint to use `ResponseHelper`
- [ ] Review and update any other utility endpoints
- [ ] Remove or update development-only endpoints

## Phase 3: Client-Side Updates

### API Client Utilities
- [ ] Create/update API client wrapper to handle `ApiResponse<T>` format
- [ ] Add type-safe error extraction utilities
- [ ] Add request ID tracking for debugging
- [ ] Update fetch wrappers to expect standardized format

### Error Handling
- [ ] Update global error handler to use error codes
- [ ] Create error code to user message mapping
- [ ] Update toast notifications to use standardized error messages
- [ ] Add request ID display in error UI (development mode)

### Type Definitions
- [ ] Export `ApiResponse<T>` type for client use
- [ ] Create typed API client functions (e.g., `getProducts(): Promise<ApiResponse<Product[]>>`)
- [ ] Update existing API call sites to use new types
- [ ] Remove old response type definitions

### Component Updates
- [ ] Update product listing components to handle new response format
- [ ] Update order management components to handle new response format
- [ ] Update cart components to handle new response format
- [ ] Update checkout components to handle new response format

## Phase 4: Testing & Validation

### Unit Tests
- [ ] Add tests for `ResponseHelper` utility methods
- [ ] Test success response format
- [ ] Test error response format
- [ ] Test pagination metadata calculation

### Integration Tests
- [ ] Test complete order flow with standardized responses
- [ ] Test product CRUD operations with standardized responses
- [ ] Test cart operations with standardized responses
- [ ] Test error scenarios return proper error codes

### Manual Testing
- [ ] Test all API endpoints return consistent format
- [ ] Verify request IDs are unique and trackable
- [ ] Verify timestamps are correct
- [ ] Test error messages are user-friendly
- [ ] Verify development mode shows stack traces

## Phase 5: Documentation & Cleanup

### Documentation
- [ ] Document API response format in README or API docs
- [ ] Add JSDoc comments to `ResponseHelper` methods
- [ ] Create migration guide for developers
- [ ] Document error codes and their meanings
- [ ] Add examples of common response patterns

### Code Cleanup
- [ ] Remove unused response formatting code
- [ ] Remove old error handling utilities
- [ ] Clean up imports across API routes
- [ ] Run linter and fix any issues
- [ ] Remove any TODO comments related to response formatting

### Final Review
- [ ] Code review all changed API routes
- [ ] Verify no `NextResponse.json()` calls remain (except webhooks)
- [ ] Check TypeScript types are properly enforced
- [ ] Verify all success criteria are met
- [ ] Get final approval before merging

## Dependencies

- **Phase 1** must complete before **Phase 3** (client updates depend on API changes)
- **Phase 2** can run in parallel with **Phase 1**
- **Phase 4** depends on **Phases 1-3** completion
- **Phase 5** is final and depends on all previous phases

## Validation Checklist

After each phase:
- [ ] Run `pnpm build` - ensure no TypeScript errors
- [ ] Run `pnpm lint` - ensure code quality
- [ ] Test affected endpoints manually
- [ ] Verify response format matches `ApiResponse<T>`
- [ ] Check error responses include proper error codes
- [ ] Verify metadata (timestamp, requestId) is present

## Rollback Plan

If issues are discovered:
1. Identify affected endpoints
2. Revert specific route changes
3. Fix issues in isolation
4. Re-apply changes with fixes
5. Re-test thoroughly

## Success Metrics

- ✅ 100% of API routes use `ResponseHelper`
- ✅ 0 direct `NextResponse.json()` calls in API routes (excluding webhooks)
- ✅ All responses include required metadata fields
- ✅ Error responses use standardized error codes
- ✅ Client-side code successfully handles new format
- ✅ No breaking changes to existing functionality
- ✅ Improved debugging with request IDs
