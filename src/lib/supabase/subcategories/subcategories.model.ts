import { supabase } from '../client/client.model';
import { Subcategory } from '@/types/category/subcategory.model';

export async function getSubcategories(categoryId?: number) {
    let query = supabase.from('subcategories').select('*');
    
    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }
    
    query = query.order('display_order', { ascending: true });
    const { data, error } = await query;
    return { data, error };
}

export async function getSubcategoryById(id: number) {
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('subcategory_id', id)
        .single();
    return { data, error };
}

export async function createSubcategory(subcategoryData: Omit<Subcategory, 'subcategory_id'>) {
    const { data, error } = await supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select();
    return { data, error };
}

export async function updateSubcategory(id: number, subcategoryData: Partial<Omit<Subcategory, 'subcategory_id'>>) {
    const { data, error } = await supabase
        .from('subcategories')
        .update(subcategoryData)
        .eq('subcategory_id', id)
        .select();
    return { data, error };
}

export async function deleteSubcategory(id: number) {
    const { data, error } = await supabase
        .from('subcategories')
        .delete()
        .eq('subcategory_id', id);
    return { data, error };
} 