import { getSupabaseClient } from '../client.factory';
import { Address, User, UserProfile } from '@/types/supabase';

// --- User Profile Functions ---

export const getUserProfile = async (userId: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
};

export const getUserIdByEmail = async (email: string) => {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', email)
        .single();
    return { userId: data?.user_id, error };
};

export const getUserFullData = async (userId: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('users')
        .select(`
            *,
            user_profiles (*)
        `)
        .eq('user_id', userId)
        .single();
};

export const updateLastLogin = async (userId: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
};

// --- Registration Logic ---

export const registerUserRecord = async (email: string, username: string) => {
    const supabase = await getSupabaseClient();
    return supabase.from('users').insert({
        email,
        username,
        is_active: true
    }).select('user_id').single();
};

export const createUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    const supabase = await getSupabaseClient();
    return supabase.from('user_profiles').insert({
        ...data,
        user_id: userId
    }).select().single();
};

export const registerUser = async (data: { email: string; username: string; full_name?: string }) => {
    const { email, username, full_name } = data;

    // 1. Create user record
    const { data: user, error: userError } = await registerUserRecord(email, username);
    if (userError) return { error: userError };

    // 2. Create user profile
    const { error: profileError } = await createUserProfile(user.user_id, {
        full_name: full_name || username
    });

    if (profileError) return { error: profileError };

    return { data: user, error: null };
};

// --- Address Management ---

export const getUserAddresses = async (userId: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);
};

export const saveUserAddress = async (address: Omit<Address, 'address_id'> & { address_id?: string }) => {
    const supabase = await getSupabaseClient();

    // 1. If updating, verify ownership first
    if (address.address_id) {
        const { data: existing, error: fetchError } = await supabase
            .from('addresses')
            .select('user_id')
            .eq('address_id', address.address_id)
            .single();

        if (fetchError || !existing) {
            return { error: fetchError || { message: 'Address not found' } };
        }

        if (existing.user_id !== address.user_id) {
            return { error: { message: 'Unauthorized: Address does not belong to this user' } };
        }
    }

    // 2. If setting as default, update all other addresses to not be default
    if (address.is_default) {
        const { error: resetError } = await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', address.user_id);

        if (resetError) {
            return { error: resetError };
        }
    }

    // 3. Insert or update address
    if (address.address_id) {
        return supabase
            .from('addresses')
            .update(address)
            .eq('address_id', address.address_id)
            .select();
    } else {
        return supabase.from('addresses').insert(address).select();
    }
};

export const deleteUserAddress = async (addressId: string, userId: string) => {
    const supabase = await getSupabaseClient();
    return supabase
        .from('addresses')
        .delete()
        .eq('address_id', addressId)
        .eq('user_id', userId); // Security check
};
