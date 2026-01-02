## Context

RoabH Mart currently has a checkout flow with mock payment processing. To enable real e-commerce transactions, we need to integrate Stripe Checkout for payment processing. This change introduces a complete order lifecycle management system with payment verification through Stripe webhooks.

### Background
- Existing checkout page collects shipping and payment information but doesn't process real payments
- Order service exists but creates orders without payment verification
- No webhook infrastructure for handling asynchronous payment events
- Cart system is functional and provides cart data through React Context

### Constraints
- Must use Stripe Checkout (hosted payment page) for PCI compliance and simplicity
- Must support Stripe CLI for local webhook testing before production
- Must maintain backward compatibility with existing order service
- Must handle asynchronous payment confirmation via webhooks
- Database already has orders, payments, and shipping_info tables

### Stakeholders
- **Customers**: Need secure payment processing and order confirmation
- **Admin**: Need to track payment status and manage order lifecycle
- **Developers**: Need clear webhook handling and error recovery

## Goals / Non-Goals

### Goals
1. Enable secure payment processing using Stripe Checkout
2. Create orders with proper status tracking (pending → paid → processing → shipped → delivered)
3. Handle payment webhooks to update order status asynchronously
4. Provide clear order confirmation to customers
5. Enable admin to manage order lifecycle
6. Support local development and testing with Stripe CLI

### Non-Goals
- Custom payment form with Stripe Elements (using Stripe Checkout instead)
- Subscription or recurring payment support (one-time payments only)
- Multi-currency support (USD only for now)
- Refund processing (can be added later)
- Partial payments or payment plans
- Integration with shipping carriers for tracking

## Decisions

### Decision 1: Use Stripe Checkout (Hosted Payment Page)
**Rationale**: 
- Simplifies PCI compliance (Stripe handles sensitive card data)
- Reduces frontend complexity (no custom payment form needed)
- Provides mobile-optimized payment experience
- Faster implementation than Stripe Elements
- Built-in support for multiple payment methods

**Alternatives Considered**:
- **Stripe Elements**: More customization but requires handling sensitive data and more complex frontend
- **Stripe Payment Intents API**: Full control but significantly more complex implementation

### Decision 2: Create Order Before Payment (Pending Status)
**Rationale**:
- Allows tracking of attempted purchases even if payment fails
- Provides order ID for Stripe session metadata
- Enables better analytics on conversion rates
- Simplifies webhook handling (order already exists)

**Alternatives Considered**:
- **Create order after payment**: Simpler but loses data on failed payments and complicates webhook handling

### Decision 3: Use Webhooks for Payment Confirmation
**Rationale**:
- Stripe recommends webhooks as the source of truth for payment status
- Handles edge cases (user closes browser, network issues)
- Asynchronous processing doesn't block user experience
- More reliable than client-side confirmation

**Alternatives Considered**:
- **Client-side confirmation only**: Unreliable if user closes browser or network fails

### Decision 4: Order Status Lifecycle
**States**: `pending` → `paid` → `processing` → `shipped` → `delivered`

**Rationale**:
- `pending`: Order created, awaiting payment
- `paid`: Payment confirmed, ready for fulfillment
- `processing`: Order being prepared
- `shipped`: Order dispatched to customer
- `delivered`: Order received by customer

This provides clear visibility into order progress for both customers and admin.

### Decision 5: Flexible Cart Data Passing
**Rationale**:
- Accept cart data as API parameters instead of reading from cart provider
- Allows checkout from different sources (cart, buy now, etc.)
- Easier to test and more maintainable
- Decouples checkout from cart implementation

## Technical Architecture

### Payment Flow
```
1. User completes checkout form
2. Frontend calls POST /api/checkout with cart data
3. Backend creates order with status='pending'
4. Backend creates Stripe Checkout session with order metadata
5. Backend returns session URL
6. Frontend redirects to Stripe Checkout
7. User completes payment on Stripe
8. Stripe sends webhook to /api/webhooks/stripe
9. Webhook handler verifies signature
10. Webhook updates order status to 'paid'
11. Webhook updates payment record
12. Stripe redirects user to success URL
13. User sees order confirmation page
```

### Database Schema Changes
```sql
-- Add Stripe session tracking to orders table
ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN stripe_checkout_url TEXT;

-- Add Stripe payment intent to payments table
ALTER TABLE payments ADD COLUMN stripe_payment_intent_id VARCHAR(255);

-- Ensure order status supports full lifecycle
-- (Assuming status is already a string column)
```

### API Endpoints

#### POST /api/checkout
**Request**:
```typescript
{
  cartItems: Array<{
    product_id: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}
```

**Response**:
```typescript
{
  sessionId: string;
  sessionUrl: string;
  orderId: number;
  orderNumber: string;
}
```

#### POST /api/webhooks/stripe
**Headers**: `stripe-signature`
**Body**: Stripe webhook event payload

**Events Handled**:
- `checkout.session.completed`: Update order to paid
- `payment_intent.succeeded`: Confirm payment success
- `payment_intent.payment_failed`: Mark payment as failed

### Environment Variables
```env
# Client-side (public)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Server-side (secret)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Risks / Trade-offs

### Risk 1: Webhook Delivery Failures
**Mitigation**: 
- Stripe retries webhooks automatically
- Implement idempotency checks (don't update order twice)
- Log all webhook events for debugging
- Provide admin interface to manually verify payment status

### Risk 2: Order Created but Payment Never Attempted
**Impact**: Database fills with pending orders
**Mitigation**:
- Add created_at timestamp to orders
- Implement cleanup job to cancel orders pending > 24 hours
- Track Stripe session expiration (24 hours)

### Risk 3: Race Conditions (User Returns Before Webhook)
**Impact**: User sees "pending" status briefly
**Mitigation**:
- Order confirmation page polls for status updates
- Show "Payment processing..." message
- Webhook typically arrives within seconds

### Risk 4: Stripe API Changes
**Impact**: Breaking changes in Stripe SDK
**Mitigation**:
- Pin Stripe SDK version in package.json
- Monitor Stripe changelog
- Test thoroughly before upgrading

### Trade-off: Hosted Checkout vs Custom Form
**Chosen**: Hosted Checkout
**Pros**: Faster implementation, PCI compliant, mobile-optimized
**Cons**: Less UI customization, redirect flow (not embedded)

## Migration Plan

### Phase 1: Development Setup
1. Install Stripe SDK
2. Add environment variables
3. Set up Stripe test account
4. Install Stripe CLI for webhook testing

### Phase 2: Backend Implementation
1. Create Stripe service layer
2. Implement checkout API route
3. Implement webhook handler
4. Update order service

### Phase 3: Frontend Integration
1. Update checkout page
2. Remove mock payment form
3. Add Stripe redirect flow
4. Update order confirmation page

### Phase 4: Testing
1. Test with Stripe test cards
2. Test webhook handling with Stripe CLI
3. Test order status transitions
4. Test error scenarios

### Phase 5: Production Deployment
1. Add production Stripe keys
2. Configure production webhook endpoint
3. Test with real Stripe account (test mode)
4. Monitor first transactions closely

### Rollback Plan
If issues arise:
1. Revert checkout page to mock payment (disable Stripe redirect)
2. Orders will still be created but marked as "pending"
3. Admin can manually verify payments
4. Fix issues and redeploy

## Open Questions

1. **Should we send order confirmation emails?**
   - Not in this change; can be added in future iteration
   
2. **How to handle inventory reservation during pending payment?**
   - Not in this change; inventory is checked at order creation but not reserved
   
3. **Should we support multiple payment methods (PayPal, etc.)?**
   - Not in this change; Stripe Checkout supports cards only initially
   
4. **What happens if webhook fails permanently?**
   - Admin can manually check Stripe dashboard and update order status
   - Future: Implement sync job to reconcile orders with Stripe

5. **Should we clear cart after order creation or after payment?**
   - Clear after successful payment (webhook confirmation)
   - Allows user to retry if payment fails
