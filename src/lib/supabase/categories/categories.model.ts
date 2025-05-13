import { supabase } from '../client/client.model';
import { Category } from '@/types/category/category.model';

export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
    return { data, error };
}

export async function getCategoryById(id: number) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('category_id', id)
        .single();
    return { data, error };
}

export async function deleteCategory(id: number) {
    const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('category_id', id);
    return { data, error };
}

export async function createCategory(categoryData: Omit<Category, 'category_id'>) {
    const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select();
    return { data, error };
}

export async function updateCategory(id: number, categoryData: Partial<Omit<Category, 'category_id'>>) {
    const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('category_id', id)
        .select();
    return { data, error };
} 