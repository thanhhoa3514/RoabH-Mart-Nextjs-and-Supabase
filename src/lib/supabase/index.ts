// Export client
export { supabase } from './client/client.model';

// Export auth functions
export { signUp, signIn, signOut, getUserProfile } from './auth/auth.model';

// Export product functions
export { getProducts, getProductById } from './products/products.model';

// Export order functions
export { createOrder } from './orders/orders.model';

// Export category functions
export { 
    getCategories, 
    getCategoryById, 
    deleteCategory, 
    createCategory, 
    updateCategory 
} from './categories/categories.model';

// Export subcategory functions
export { 
    getSubcategories, 
    getSubcategoryById, 
    createSubcategory, 
    updateSubcategory, 
    deleteSubcategory 
} from './subcategories/subcategories.model'; 