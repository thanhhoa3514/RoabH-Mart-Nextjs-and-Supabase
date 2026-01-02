# Change: Add Stripe Order Processing with Checkout Integration

## Why

Currently, the RoabH Mart platform has a checkout page with mock payment processing that doesn't actually charge customers or create real orders. Users can go through the checkout flow, but no payment is collected and orders are created without payment verification. This prevents the platform from being production-ready and handling real e-commerce transactions.

We need to integrate Stripe Checkout to enable secure payment processing, create orders with proper status tracking, and handle payment webhooks to update order states based on payment outcomes.

## What Changes

- **Add Stripe Checkout Integration**: Implement Stripe Checkout (hosted payment page) for secure payment processing
- **Order Creation Flow**: Create orders with `pending` status before payment, update to `paid` after successful payment
- **Order Status Management**: Implement full order lifecycle: `pending` → `paid` → `processing` → `shipped` → `delivered`
- **Webhook Handler**: Create `/api/webhooks/stripe` endpoint to handle Stripe payment events
- **Environment Configuration**: Add Stripe API keys and webhook secret to environment variables
- **Cart Integration**: Accept cart data as parameters for flexible order creation
- **Order Confirmation**: Redirect users to order confirmation page after successful payment
- **Admin Order Management**: Update admin panel to display and manage orders with payment status

## Impact

### Affected Specs
- **New**: `order-management` - Order creation, status tracking, and lifecycle management
- **New**: `payment-integration` - Stripe Checkout integration and webhook handling

### Affected Code
- **New Files**:
  - `src/app/api/checkout/route.ts` - Create Stripe Checkout session
  - `src/app/api/webhooks/stripe/route.ts` - Handle Stripe webhook events
  - `src/services/stripe/stripe.service.ts` - Stripe service layer
  - `src/services/stripe/stripe.config.ts` - Stripe configuration
  - `src/types/order/order-status.enum.ts` - Order status enum
  
- **Modified Files**:
  - `src/app/checkout/page.tsx` - Update to use Stripe Checkout instead of mock payment
  - `src/services/supabase/orders/order.service.ts` - Add order status update methods
  - `package.json` - Add `stripe` dependency
  - `.env.local` - Add Stripe environment variables

### Breaking Changes
None - This is a new feature addition that enhances existing checkout functionality

### Dependencies
- **New**: `stripe` (^14.x) - Stripe Node.js SDK
- **Environment Variables**:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (client-side)
  - `STRIPE_SECRET_KEY` - Stripe secret key (server-side)
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

### Testing Requirements
- Test with Stripe CLI for local webhook testing
- Use Stripe test mode before production deployment
- Test order creation with pending status
- Test webhook handling for successful and failed payments
- Test order status transitions
