import { z } from "zod";

/**
 * Schema for adding an image to a product
 */
export const CreateProductImageSchema = z.object({
    product_id: z.union([z.string(), z.number()]),
    image_url: z.string().url("Invalid image URL"),
    is_primary: z.boolean().optional().default(false),
    display_order: z.number().int().optional().default(0),
});

export type CreateProductImageDTO = z.input<typeof CreateProductImageSchema>;

/**
 * Schema for creating a new product
 */
export const CreateProductSchema = z.object({
    subcategory_id: z.union([z.string(), z.number()]).optional().nullable(),
    seller_id: z.union([z.string(), z.number()]),
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional().nullable(),
    price: z.number().positive("Price must be positive"),
    stock_quantity: z.number().int().nonnegative("Stock cannot be negative"),
    discount_percentage: z.number().min(0).max(100).optional().nullable(),
    sku: z.string().optional().nullable(),
    slug: z.string().optional(),
    is_active: z.boolean().optional().default(true),
});

export type CreateProductDTO = z.input<typeof CreateProductSchema>;

/**
 * Schema for updating an existing product
 */
export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductDTO = z.input<typeof UpdateProductSchema>;

/**
 * Schema for product review
 */
export const CreateProductReviewSchema = z.object({
    product_id: z.union([z.string(), z.number()]),
    user_id: z.union([z.string(), z.number()]),
    rating: z.number().min(1).max(5),
    comment: z.string().optional().nullable(),
    is_verified_purchase: z.boolean().optional().default(false),
});

export type CreateProductReviewDTO = z.input<typeof CreateProductReviewSchema>;
