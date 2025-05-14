export interface DbCustomer {
    user_id: number;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    created_at: string;
    updated_at: string;
    is_active: boolean;
} 