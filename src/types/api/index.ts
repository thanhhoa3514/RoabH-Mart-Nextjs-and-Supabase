
/**
 * ApiResponse with formatted response
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta: ApiMeta;
}

/**
 * ApiError with formatted error
 */
export interface ApiError {
    code: string;
    message: string;
    details?: any;
    stack?: string; // Chỉ có trong development
}

/**
 * ApiMeta with formatted meta
 */
export interface ApiMeta {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
    [key: string]: any; // Allow additional meta fields
}

/**
 * PaginationMeta with formatted pagination
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * PaginatedResponse with formatted pagination
 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
    meta: ApiMeta;
}