// Site metadata
export const SITE_NAME = 'RoabH Mart';
export const SITE_DESCRIPTION = 'Your one-stop shop for all your needs';
export const SITE_URL = 'https://roabh-mart.vercel.app';

// Navigation
export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Auth related
export const AUTH_REDIRECT_PATH_COOKIE = 'redirectPath';

// Orders
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

// Products
export const PRODUCTS_PER_PAGE = 12;
export const PRODUCT_SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'popularity', label: 'Popularity' },
];

// Pagination
export const PAGINATION_DEFAULT_PAGE_SIZE = 10;

// Form validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_MIN_LENGTH = 8;

// API Endpoints
export const API_ROUTES = {
  REVALIDATE: '/api/revalidate',
  WEBHOOKS: {
    STRIPE: '/api/webhooks/stripe',
  },
};

// Media
export const DEFAULT_AVATAR = '/images/default-avatar.png';
export const DEFAULT_PRODUCT_IMAGE = '/images/default-product.png';

// Timeout durations
export const DEBOUNCE_TIMEOUT = 300; // ms
export const SESSION_REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour in ms
