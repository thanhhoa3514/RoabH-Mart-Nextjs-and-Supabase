# RoabH Mart - E-commerce Platform

## Project Overview
RoabH Mart is a modern e-commerce platform built with Next.js, React, Tailwind CSS, and Supabase. The platform features a green-themed UI and includes all essential e-commerce functionalities.

## Core Features
- Product browsing and search
- Product details view
- Shopping cart functionality
- User authentication and profiles
- Order processing and history
- Product categorization
- Responsive design

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **UI Components**: Custom components with Tailwind CSS
- **Animation**: Framer Motion
- **State Management**: React Context API, nuqs for URL state
- **Backend**: Supabase (Authentication, Database, Storage)
- **Styling**: Tailwind CSS with custom green theme

## Project Structure
```
/src
  /app - Next.js App Router pages
    /products - Product listing and details
    /cart - Shopping cart
    /checkout - Checkout process
    /account - User account management
    /auth - Authentication pages
  /components - Reusable components
    /ui - Basic UI components
    /layout - Layout components
    /products - Product-related components
    /cart - Cart-related components
    /checkout - Checkout components
  /lib - Utility functions and hooks
    /supabase - Supabase client and helpers
    /utils - General utility functions
    /hooks - Custom React hooks
  /types - TypeScript type definitions
```

## Implementation Steps

### Completed
- Set up Next.js project with TypeScript and Tailwind CSS
- Created project structure
- Implemented custom green theme with Tailwind CSS
- Created TypeScript interfaces for data models
- Created Supabase client configuration
- Implemented layout components (Header, Footer)
- Created homepage with featured products and categories
- Implemented product listing page with filtering and sorting
- Created product detail page with gallery and related products
- Implemented shopping cart functionality
- Created user account pages with profile management

### Next Steps
1. **Complete Supabase Integration**
   - Create Supabase project
   - Set up database tables (products, users, orders, etc.)
   - Configure authentication
   - Replace mock data with actual Supabase queries

2. **Implement Authentication**
   - Create login and registration pages
   - Implement protected routes
   - Add user session management

3. **Complete Checkout Process**
   - Create checkout form
   - Implement order submission
   - Add payment integration

4. **Add Advanced Features**
   - Implement search functionality
   - Add product recommendations
   - Create reviews and ratings system
   - Implement order tracking
   - Add admin dashboard

5. **Optimization and Testing**
   - Performance optimization
   - Responsive design testing
   - Cross-browser compatibility
   - Accessibility improvements

6. **Deployment**
   - Configure production environment
   - Deploy to hosting platform
   - Set up monitoring and analytics

## Docker Deployment

This project has been configured to run in Docker containers. Here's how to build and run it:

### Prerequisites

- Docker
- Docker Compose

### Building and Running with Docker

1. Build and start the containers:

```bash
docker-compose up -d
```

2. The application will be available at http://localhost:3000

### Building without Docker Compose

```bash
# Build the Docker image
docker build -t roabh-mart .

# Run the container
docker run -p 3000:3000 roabh-mart
```

### Development with Docker

For development, you can use volume mounts to sync changes:

```bash
docker-compose -f docker-compose.dev.yml up
```
