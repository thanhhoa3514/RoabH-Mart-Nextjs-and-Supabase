import { getSupabaseClient } from '../client.factory';

export const getCategories = async () => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
};

export const getCategoryById = async (id: number) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('categories')
        .select('*')
        .eq('category_id', id)
        .single();
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

export const createSubcategory = async (subcategoryData: any) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select();
};

export const updateSubcategory = async (id: number, subcategoryData: any) => {
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
