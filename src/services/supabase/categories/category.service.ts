import { getSupabaseClient } from '../client.factory';
import {
    CreateCategoryDTO,
    UpdateCategoryDTO,
    CreateSubcategoryDTO,
    UpdateSubcategoryDTO
} from '@/types/category';

export const getCategories = async () => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
};

export const getCategoriesWithImages = async () => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .not('image', 'is', null)
        .order('display_order', { ascending: true });
};

export const getCategoryById = async (id: number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .select('*')
        .eq('category_id', id)
        .single();
};

export const createCategory = async (categoryData: CreateCategoryDTO) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .insert([categoryData])
        .select();
};

export const updateCategory = async (id: number, categoryData: UpdateCategoryDTO) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .update(categoryData)
        .eq('category_id', id)
        .select();
};

export const deleteCategory = async (id: number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .update({ is_active: false })
        .eq('category_id', id);
};

export const getSubcategories = async (categoryId?: number) => {
    const supabase = await getSupabaseClient();
    let query = supabase
        .from('subcategories')
        .select('*')
        .eq('is_active', true);

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    return query.order('name');
};

export const getSubcategoryById = async (id: number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('subcategories')
        .select('*')
        .eq('subcategory_id', id)
        .single();
};

export const createSubcategory = async (subcategoryData: CreateSubcategoryDTO) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select();
};

export const updateSubcategory = async (id: number, subcategoryData: UpdateSubcategoryDTO) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('subcategories')
        .update(subcategoryData)
        .eq('subcategory_id', id)
        .select();
};

export const deleteSubcategory = async (id: number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('subcategories')
        .update({ is_active: false })
        .eq('subcategory_id', id);
};
