// Export client
export { supabase } from './client/client.model';

// Export auth functions
export { signUp, signIn, signOut, getUserProfile } from './auth/auth.model';

// Export user data functions
export { 
  getUserData, 
  getUserIdFromAuth, 
  updateLastLogin,
  createUser,
  createUserProfile,
  registerUser
} from './user/users.model';

// Export product functions
export { getProducts, getProductById } from './products/products.model';

// Export order functions
export {
    getOrders,
    getOrderById,
    getOrdersByUserId,
    updateOrderStatus,
    createOrder
} from './orders/orders.model';

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
} from './customers/customers.model';

// Export dashboard functions
export {
    getDashboardStats,
    getTopProducts,
    getReviewStats,
    getQuarterlySales
} from './dashboard/dashboard.model';


