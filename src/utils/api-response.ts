import { ApiResponse, ApiMeta, ApiError, PaginationMeta } from "@/types/api";
import { NextResponse } from "next/server";
import { ERROR_STATUS_MAP, ErrorCode } from "./response-helper";
import { generateRequestId, getDefaultHeaders } from "./helpers";

export class ResponseHelper {
    static success<T>(data: T, status: number = 200, meta?: Partial<ApiMeta>): NextResponse<ApiResponse<T>> {
        return NextResponse.json({
            success: true,
            data,
            meta: {
                timestamp: new Date().toISOString(),
                requestId: generateRequestId(),
                ...meta
            }
        }, { status, headers: getDefaultHeaders(), });
    }

    /**
   * Created response (201)
   */
    static created<T>(
        data: T,
        meta?: Partial<ApiMeta>
    ): NextResponse<ApiResponse<T>> {
        return this.success(data, 201, meta);
    }

    /**
     * No content response (204)
     */
    static noContent(): NextResponse {
        return new NextResponse(null, {
            status: 204,
            headers: getDefaultHeaders(),
        });
    }
    // ============================================
    // ERROR RESPONSES
    // ============================================

    /**
     * Generic error response
     */
    static error(
        message: string,
        code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
        details?: unknown,
        customStatus?: number
    ): NextResponse<ApiResponse<null>> {
        const status = customStatus || ERROR_STATUS_MAP[code] || 500;

        const error: ApiError = {
            code,
            message,
            details,
        };

        // Thêm stack trace trong development
        if (process.env.NODE_ENV === 'development' && details instanceof Error) {
            error.stack = details.stack;
        }

        return NextResponse.json(
            {
                success: false,
                error,
                meta: {
                    timestamp: new Date().toISOString(),
                    requestId: generateRequestId(),
                },
            },
            {
                status,
                headers: getDefaultHeaders(),
            }
        );
    }
    // ============================================
    // SPECIFIC ERROR METHODS (Better DX)
    // ============================================

    /**
     * Bad Request (400)
     */
    static badRequest(
        message: string = 'Bad request',
        details?: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.BAD_REQUEST, details);
    }

    /**
     * Unauthorized (401)
     */
    static unauthorized(
        message: string = 'Unauthorized',
        details?: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.UNAUTHORIZED, details);
    }

    /**
     * Forbidden (403)
     */
    static forbidden(
        message: string = 'Forbidden',
        details?: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.FORBIDDEN, details);
    }

    /**
     * Not Found (404)
     */
    static notFound(
        message: string = 'Not found',
        details?: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.NOT_FOUND, details);
    }

    /**
     * Internal Server Error (500)
     */
    static internalServerError(
        message: string = 'Internal server error',
        details?: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.INTERNAL_SERVER_ERROR, details);
    }
    /**
   * Conflict (409)
   */
    static conflict(
        message: string = 'Resource already exists',
        details?: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.CONFLICT, details);
    }

    /**
     * Validation Error (422)
     */
    static validationError(
        message: string = 'Validation failed',
        errors: unknown
    ): NextResponse<ApiResponse<null>> {
        return this.error(message, ErrorCode.VALIDATION_ERROR, { errors });
    }

    /**
   * Calculate pagination metadata
   */
    static calculatePagination(
        page: number,
        limit: number,
        total: number
    ): PaginationMeta {
        const totalPages = Math.ceil(total / limit);

        return {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
    }
}
