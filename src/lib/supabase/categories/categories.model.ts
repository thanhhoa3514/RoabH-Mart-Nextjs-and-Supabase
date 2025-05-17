import { supabase } from '../client/client.model';
import { Category } from '@/types/category/category.model';

/**
 * Fetch all categories from the database
 */
export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
    return { data, error };
}

/**
 * Fetch categories with complete image URLs
 * This transforms the image field to include the full Supabase storage URL if needed
 */
export async function getCategoriesWithImages() {
    const { data, error } = await getCategories();
    
    if (error || !data) {
        return { data, error };
    }
    
    // Transform the image URLs to full Supabase storage URLs if they're storage references
    const categoriesWithImages = data.map(category => {
        if (!category.image) {
            return category;
        }
        
        // If the image is already a full URL, return it as is
        if (category.image.startsWith('http')) {
            return category;
        }
        
        // If it's a Supabase storage path, create the full URL
        const { data: imageUrl } = supabase.storage
            .from('roabh-mart')
            .getPublicUrl(`category-images/${category.image}`);
            
        return {
            ...category,
            image: imageUrl.publicUrl
        };
    });
    
    return { data: categoriesWithImages, error: null };
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(id: number) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('category_id', id)
        .single();
    return { data, error };
}

/**
 * Fetch a single category with full image URL
 */
export async function getCategoryWithImageById(id: number) {
    const { data, error } = await getCategoryById(id);
    
    if (error || !data) {
        return { data, error };
    }
    
    if (!data.image) {
        return { data, error };
    }
    
    // If the image is already a full URL, return it as is
    if (data.image.startsWith('http')) {
        return { data, error };
    }
    
    // If it's a Supabase storage path, create the full URL
    const { data: imageUrl } = supabase.storage
        .from('roabh-mart')
        .getPublicUrl(`category-images/${data.image}`);
        
    return { 
        data: {
            ...data,
            image: imageUrl.publicUrl
        }, 
        error 
    };
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number) {
    const { data, error } = await supabase
        .from('categories')
        .delete()
        .eq('category_id', id);
    return { data, error };
}

/**
 * Create a new category
 * If an image file is provided, it will be uploaded to Supabase storage
 */
export async function createCategory(categoryData: Omit<Category, 'category_id'>, imageFile?: File) {
    try {
        console.log('Creating category with data:', JSON.stringify(categoryData));
        
        // If there's an image file, upload it to Supabase storage first
        let imagePath = categoryData.image;
        
        if (imageFile) {
            const fileName = `${Date.now()}-${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('roabh-mart')
                .upload(`category-images/${fileName}`, imageFile);
                
            if (uploadError) {
                console.error('Image upload error:', uploadError);
                return { data: null, error: uploadError };
            }
            
            // Get the public URL for the uploaded image
            const { data: publicUrlData } = supabase.storage
                .from('roabh-mart')
                .getPublicUrl(`category-images/${fileName}`);
                
            imagePath = publicUrlData.publicUrl;
        }
        
        // Create a clean object for the database
        // Make sure we don't include any category_id that might be in the data
        const { category_id, ...rest } = categoryData as any;
        
        const categoryToInsert = {
            name: rest.name,
            description: rest.description || null,
            image: imagePath || null,
            is_active: rest.is_active !== undefined ? rest.is_active : true,
            display_order: rest.display_order || 0
        };
        
        console.log('Inserting category:', JSON.stringify(categoryToInsert));
        
        // Now create the category with the image path
        const { data, error } = await supabase
            .from('categories')
            .insert([categoryToInsert])
            .select();
            
        if (error) {
            console.error('Category insert error:', JSON.stringify(error));
        } else {
            console.log('Category created successfully:', data);
        }
            
        return { data, error };
    } catch (err) {
        console.error('Exception in createCategory:', err);
        return { 
            data: null, 
            error: { message: err instanceof Error ? err.message : 'Unknown error in category creation' } 
        };
    }
}

/**
 * Update an existing category
 * If an image file is provided, it will be uploaded to Supabase storage
 */
export async function updateCategory(
    id: number, 
    categoryData: Partial<Omit<Category, 'category_id'>>,
    imageFile?: File
) {
    // If there's an image file, upload it to Supabase storage first
    let imagePath = categoryData.image;
    
    if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('roabh-mart')
            .upload(`category-images/${fileName}`, imageFile);
            
        if (uploadError) {
            return { data: null, error: uploadError };
        }
        
        // Get the public URL for the uploaded image
        const { data: publicUrlData } = supabase.storage
            .from('roabh-mart')
            .getPublicUrl(`category-images/${fileName}`);
            
        imagePath = publicUrlData.publicUrl;
    }
    
    // Now update the category with the new data
    const updateData = imageFile 
        ? {...categoryData, image: imagePath}
        : categoryData;
        
    const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('category_id', id)
        .select();
        
    return { data, error };
} 