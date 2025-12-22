export interface DbOrder {
    order_id: number;
    user_id: number;
    order_number: string;
    total_amount: number;
    status: string;
    order_date: string;
    deleted_at: string | null;
    shipping_address_id: number | null;
    billing_address_id: number | null;
    payment_method_id: number | null;
    discount_amount: number;
    tax_amount: number;
    shipping_cost: number;
    notes: string | null;
    cancelled_at: string | null;
    cancelled_reason: string | null;
}
