export interface User {
    id: string;
    email: string;
    fullName?: string;
    avatar?: string;
}

export interface DbUser {
    user_id: number;
    username: string;
    email: string;
    created_at: string;
    last_login: string | null;
    is_active: boolean;
}

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

export interface CompleteUserData {
    user_id?: number;
    username?: string;
    email?: string;
    phone?: string;
    user: DbUser | null;
    profile: DbUserProfile | null;
    addresses: DbUserAddress[];
}