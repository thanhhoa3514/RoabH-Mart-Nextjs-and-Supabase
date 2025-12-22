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
    postal_code: string | null;
    country: string;
    is_default: boolean;
}

// Đây là Type phản ánh đúng kết quả "select *, user_profiles(*)" từ bảng users
export interface CompleteUserData extends DbUser {
    user_profiles: DbUserProfile | null;
    addresses?: DbUserAddress[];
}