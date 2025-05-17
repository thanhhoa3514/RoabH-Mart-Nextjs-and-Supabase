// Export client
export { supabase } from '@/lib/supabase/client/client.model';

// Export auth functions
export { signUp, signIn, signOut, getUserProfile } from '@/lib/supabase/auth/auth.model';

// Export user data functions
export {
  getUserData, 
  getUserIdFromAuth, 
  updateLastLogin,
  createUser,
  createUserProfile,
  registerUser
} from '@/lib/supabase/user/users.model';

// Export product functions
export { getProducts, getProductById, getFeaturedProducts, createProduct, addProductImage } from '@/lib/supabase/products/products.model';

// Export order functions
export {
    getOrders,
    getOrderById,
    getOrdersByUserId,
    updateOrderStatus,
    createOrder
} from '@/lib/supabase/orders/orders.model';

// Export category functions
export { 
    getCategories, 
    getCategoriesWithImages,
    getCategoryById,
    getCategoryWithImageById, 
    deleteCategory, 
    createCategory, 
    updateCategory 
} from '@/lib/supabase/categories/categories.model';

// Export subcategory functions
export { 
    getSubcategories, 
    getSubcategoryById, 
    createSubcategory, 
    updateSubcategory, 
    deleteSubcategory 
} from '@/lib/supabase/subcategories/subcategories.model'; 

// Export customer functions
export {
    getCustomers,
    getCustomerById,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerOrders,
    getCustomerStats,
    getCustomerAddresses
} from '@/lib/supabase/customers/customers.model';

// Export dashboard functions
export {
    getDashboardStats,
    getTopProducts,
    getReviewStats,
    getQuarterlySales
} from '@/lib/supabase/dashboard/dashboard.model';

// Export review functions
export {
    getReviewsByProductId,
    addReview,
    updateReview,
    deleteReview,
    hasUserReviewed,
    getProductRatingSummary,
} from './reviews/reviews.model';


