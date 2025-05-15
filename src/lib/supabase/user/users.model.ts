import { supabase } from '../client/client.model';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Interface for the user profile as stored in the database
 */
export interface DbUserProfile {
  profile_id: number;
  user_id: number;
  full_name: string | null;
  phone_number: string | null;
  email: string | null;
  date_of_birth: string | null;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Interface for the user address as stored in the database
 */
export interface DbUserAddress {
  address_id: number;
  user_id: number;
  street_address: string;
  city: string;
  district: string | null;
  province: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

/**
 * Interface for the user data in the database
 */
export interface DbUser {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

/**
 * Interface for the complete user data including profile and addresses
 */
export interface CompleteUserData {
  user: DbUser | null;
  profile: DbUserProfile | null;
  addresses: DbUserAddress[];
}

/**
 * Interface for creating a user
 */
export interface CreateUserData {
  email: string;
  username: string;
  fullName?: string;
  phoneNumber?: string;
}

/**
 * Get complete user data including profile and addresses
 * @param userId The database user ID
 */
export async function getUserData(userId: number): Promise<{ data: CompleteUserData | null; error: PostgrestError | Error | null }> {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {  // PGRST116 is "no rows returned" error
      throw profileError;
    }

    // Get user addresses
    const { data: addressesData, error: addressesError } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId);

    if (addressesError) {
      throw addressesError;
    }

    return {
      data: {
        user: userData,
        profile: profileData,
        addresses: addressesData || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Get user database ID from Supabase auth user
 * @param supabaseUser The Supabase auth user object
 */
export async function getUserIdFromAuth(supabaseUser: SupabaseUser): Promise<{ userId: number | null; error: PostgrestError | Error | null }> {
  try {
    if (!supabaseUser?.email) {
      console.error('No email found in the Supabase user object');
      return { userId: null, error: new Error('No email provided') };
    }

    // Debug email value
    console.log('Searching for user with email:', supabaseUser.email);
    
    // Try to find the user by email
    const { data, error } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', supabaseUser.email);

    // Log detailed information about the response
    console.log('Search result data:', data);
    console.log('Search result error:', JSON.stringify(error, null, 2));

    if (error) {
      throw error;
    }

    // Nếu không có kết quả trả về hoặc mảng rỗng
    if (!data || data.length === 0) {
      console.log('No user found with email:', supabaseUser.email);
      return { userId: null, error: null };
    }

    // Lấy user_id từ kết quả đầu tiên
    const userId = data[0]?.user_id || null;
    console.log('Found user ID:', userId);
    
    return { userId, error: null };
  } catch (error) {
    console.error('Error getting user ID:', error);
    return { userId: null, error: error as Error };
  }
}

/**
 * Update user's last login timestamp
 * @param userId The database user ID
 */
export async function updateLastLogin(userId: number): Promise<{ success: boolean; error: PostgrestError | Error | null }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Create a new user record in the users table
 * @param email User's email address
 * @param username Username (defaults to the first part of email)
 */
export async function createUser(email: string, username?: string): Promise<{ userId: number | null; error: PostgrestError | Error | null }> {
  try {
    // If username not provided, use the part before @ in email
    const defaultUsername = username || email.split('@')[0];
    
    console.log('Creating user with:', { email, username: defaultUsername });
    
    // Insert new user into users table - sử dụng mật khẩu ngẫu nhiên thay vì managed-by-auth
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: email,
        username: defaultUsername,
        password_hash: `hash_${Date.now()}`, // Sử dụng một giá trị giả vì Auth quản lý password thực
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select('user_id');

    console.log('Create user result:', { data, error: JSON.stringify(error, null, 2) });

    if (error) {
      throw error;
    }

    // Supabase luôn trả về mảng khi dùng .select(), nên lấy phần tử đầu tiên
    const userId = data?.[0]?.user_id || null;
    return { userId, error: null };
  } catch (error) {
    console.error('Error creating user:', error);
    return { userId: null, error: error as Error };
  }
}

/**
 * Create a user profile
 * @param userId User ID from users table
 * @param profileData Profile data such as full name
 */
export async function createUserProfile(
  userId: number, 
  profileData: { fullName?: string; phoneNumber?: string; email?: string }
): Promise<{ success: boolean; error: PostgrestError | Error | null }> {
  try {
    const now = new Date().toISOString();
    
    console.log('Creating user profile:', { userId, ...profileData });
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        full_name: profileData.fullName || null,
        phone_number: profileData.phoneNumber || null,
        email: profileData.email || null,
        created_at: now,
        updated_at: now
      })
      .select();

    console.log('Profile creation result:', { data, error: JSON.stringify(error, null, 2) });

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Register a complete user with their profile
 * This is called after Supabase Auth registration
 * @param userData User registration data
 */
export async function registerUser(userData: CreateUserData): Promise<{ success: boolean; error: PostgrestError | Error | null }> {
  try {
    console.log('Starting user registration for:', userData.email);
    
    // Create the user record
    const { userId, error: userError } = await createUser(userData.email, userData.username);
    
    if (userError) {
      console.error('Failed to create user record:', userError);
      return { success: false, error: userError };
    }
    
    if (!userId) {
      console.error('User created but no user ID returned');
      return { success: false, error: new Error('No user ID returned after creation') };
    }
    
    console.log('User created successfully with ID:', userId);
    
    // Create the user profile
    const { error: profileError } = await createUserProfile(userId, {
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      email: userData.email
    });
    
    if (profileError) {
      console.error('Failed to create user profile:', profileError);
      // Đã tạo user nhưng không tạo được profile - vẫn coi là thành công một phần
      return { success: true, error: { 
        message: 'User created but profile creation failed', 
        details: profileError 
      } as unknown as Error };
    }
    
    console.log('User profile created successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error during user registration:', error);
    return { success: false, error: error as Error };
  }
} 