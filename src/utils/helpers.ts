/**
 * Collection of pure helper functions for the application
 */

/**
 * Creates a slug from a string
 */
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Truncate text to a specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get URL-friendly query string from objects
 */
export const getQueryString = (params: Record<string, string | number | boolean | undefined>): string => {
  const validParams = Object.entries(params).filter(([, value]) => value !== undefined);

  if (validParams.length === 0) return '';

  return '?' + validParams
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
};

/**
 * Check if a value is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const generateRequestId = (): string => {
  // Option 1: Simple timestamp-based
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Option 2: UUID (requires 'uuid' package)
  // return uuidv4();
}

export const getDefaultHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    // CORS headers (adjust based on your needs)
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
