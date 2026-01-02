# Project Context

## Purpose
RoabH Mart is a modern, full-featured e-commerce platform designed to provide a seamless online shopping experience. The platform enables users to browse products, manage shopping carts, process orders, and manage their accounts. It features a green-themed UI with responsive design and includes both customer-facing and administrative functionalities.

**Key Goals:**
- Provide an intuitive and visually appealing shopping experience
- Enable efficient product catalog management with categories and subcategories
- Support secure user authentication and profile management
- Facilitate smooth checkout and order processing workflows
- Offer comprehensive admin capabilities for product and order management

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.8 (App Router) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.1 with custom green theme
- **UI Components**: Radix UI primitives (Dialog, Dropdown, Select, Toast, Tabs, Accordion, etc.)
- **Animations**: Framer Motion 12.11.0
- **State Management**: 
  - React Context API for global state
  - SWR 2.3.3 for data fetching and caching
  - nuqs 2.4.3 for URL state management
- **Form Handling**: React Hook Form 7.69.0
- **Validation**: Zod 4.2.1
- **Notifications**: React Hot Toast 2.5.2
- **Icons**: Lucide React 0.510.0, Radix Icons 1.3.2
- **Carousel**: Embla Carousel React 8.6.0

### Backend & Services
- **BaaS**: Supabase (Authentication, Database, Storage)
  - @supabase/supabase-js 2.49.4
  - @supabase/ssr 0.6.1 for server-side rendering support
- **Database**: PostgreSQL (via Supabase)

### Development Tools
- **Build Tool**: Next.js with Turbopack (--turbopack flag)
- **Linting**: ESLint 9 with Next.js config
- **CSS Processing**: PostCSS 8.5.3, Autoprefixer 10.4.21
- **Utilities**: 
  - clsx 2.1.1 & tailwind-merge 3.3.0 for className management
  - class-variance-authority 0.7.1 for component variants
  - date-fns 4.1.0 for date manipulation
  - uuid 11.1.0 for unique identifiers
  - js-cookie 3.0.5 for cookie management

## Project Conventions

### Code Style
- **Language**: TypeScript with strict mode enabled
- **Module System**: ESNext with bundler resolution
- **Target**: ES2017
- **Path Aliases**: Use `@/*` for imports from `src/` directory
- **File Naming**: 
  - Components: PascalCase (e.g., `ProductCard.tsx`)
  - Utilities/Services: kebab-case (e.g., `use-cart.ts`, `product-service.ts`)
  - Pages: kebab-case following Next.js conventions
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Tailwind utility classes with custom HSL-based color system
- **Comments**: Vietnamese comments are acceptable for internal documentation

### Architecture Patterns

#### Layered Architecture
```
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable UI components
├── services/               # Business logic and data access layer
├── hooks/                  # Custom React hooks
├── providers/              # React Context providers
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
└── lib/                    # Third-party library configurations
```

#### Key Patterns
1. **Service Layer Pattern**: Business logic separated into service modules under `src/services/`
2. **Provider Pattern**: Global state managed through React Context providers (cart, auth, etc.)
3. **Server/Client Separation**: 
   - Server Components for data fetching and SEO
   - Client Components for interactivity
   - Separate Supabase client factories for server/client contexts
4. **Type Safety**: Comprehensive TypeScript types generated from Supabase schema
5. **Middleware Pattern**: Next.js middleware for authentication and route protection
6. **Component Composition**: Radix UI primitives composed into custom components

#### Database Schema
- **Users & Auth**: users, user_profiles, roles, addresses, payment_methods
- **Products**: categories, subcategories, products, product_images, sellers
- **Shopping**: carts, cart_items
- **Orders**: orders, order_items, payments, shipping_info
- **Reviews**: reviews (with verified purchase tracking)

### Testing Strategy
- **Current State**: Testing infrastructure to be implemented
- **Planned Approach**:
  - Unit tests for utility functions and services
  - Integration tests for API routes
  - Component tests for UI components
  - E2E tests for critical user flows (checkout, authentication)

### Git Workflow
- **Repository**: GitHub (thanhhoa3514/RoabH-Mart-Nextjs-and-Supabase)
- **Branching**: Feature branches merged to main
- **Commit Style**: Descriptive commits in English or Vietnamese
- **Version Control**: Semantic versioning (currently v0.1.0)

## Domain Context

### E-Commerce Domain
- **Product Catalog**: Hierarchical organization (Category → Subcategory → Product)
- **Inventory Management**: Stock tracking with SKU support
- **Pricing**: Support for discounts via percentage-based discount_percentage field
- **User Roles**: Multi-role support (admin, customer, seller)
- **Order Lifecycle**: Pending → Processing → Shipped → Delivered
- **Payment Flow**: Order creation → Payment processing → Order confirmation
- **Seller System**: Multi-vendor support with seller verification

### Business Rules
- Products must belong to a subcategory (which belongs to a category)
- Users can have multiple addresses and payment methods with default selection
- Cart items are user-specific and persist across sessions
- Reviews can be marked as verified purchases
- Shipping information tracks status separately from order status
- Product images support primary image designation and display ordering

### User Flows
1. **Shopping Flow**: Browse → View Product → Add to Cart → Checkout → Order Confirmation
2. **Authentication Flow**: Register → Email Verification → Login → Protected Routes
3. **Admin Flow**: Login → Dashboard → Manage Products/Categories/Orders
4. **Account Management**: Profile → Addresses → Payment Methods → Order History

## Important Constraints

### Technical Constraints
- **SSR Compatibility**: Must handle localStorage polyfills for server-side rendering
- **Supabase RLS**: Row Level Security policies must be configured for data access
- **Image Storage**: Product images stored in Supabase Storage with public URLs
- **Authentication**: Relies on Supabase Auth with middleware-based route protection
- **Build Target**: ES2017 for broad browser compatibility

### Performance Constraints
- **Image Optimization**: Use Next.js Image component for automatic optimization
- **Data Fetching**: Leverage SWR for caching and revalidation
- **Bundle Size**: Monitor and optimize client-side JavaScript bundles
- **Turbopack**: Development builds use Turbopack for faster compilation

### Security Constraints
- **Password Storage**: Handled by Supabase Auth (bcrypt hashing)
- **Session Management**: HTTP-only cookies for session tokens
- **CSRF Protection**: Built into Next.js middleware
- **Input Validation**: Zod schemas for all user inputs
- **XSS Prevention**: React's built-in escaping + Content Security Policy

## External Dependencies

### Primary Services
- **Supabase**: 
  - Authentication (email/password, OAuth providers)
  - PostgreSQL database with real-time subscriptions
  - Storage for product images and user uploads
  - Row Level Security for data access control

### Third-Party Libraries
- **Radix UI**: Accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **SWR**: React Hooks for data fetching with caching
- **React Hook Form**: Performant form validation
- **Zod**: TypeScript-first schema validation

### Development Dependencies
- **Next.js**: Full-stack React framework with App Router
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code quality and consistency
- **PostCSS/Autoprefixer**: CSS processing and vendor prefixes

### Future Integrations (Planned)
- Payment gateway (Stripe, PayPal)
- Email service for transactional emails
- Analytics platform (Google Analytics, Mixpanel)
- Search service (Algolia, Meilisearch)
- CDN for static assets
