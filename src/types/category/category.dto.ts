import { z } from 'zod';

/**
 * Category DTOs
 */

export const CreateCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    display_order: z.number().int().default(0),
});

export type CreateCategoryDTO = z.input<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type UpdateCategoryDTO = z.input<typeof UpdateCategorySchema>;

/**
 * Subcategory DTOs
 */

export const CreateSubcategorySchema = z.object({
    category_id: z.number().int('Category ID must be an integer'),
    name: z.string().min(1, 'Subcategory name is required').max(100),
    description: z.string().nullable().optional(),
    image: z.string().nullable().optional(),
    is_active: z.boolean().default(true),
    display_order: z.number().int().default(0),
});

export type CreateSubcategoryDTO = z.input<typeof CreateSubcategorySchema>;

export const UpdateSubcategorySchema = CreateSubcategorySchema.partial();

export type UpdateSubcategoryDTO = z.input<typeof UpdateSubcategorySchema>;
