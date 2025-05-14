export interface DbShippingInfo {
    shipping_id: number;
    order_id: number;
    shipping_method: string;
    shipping_cost: number;
    tracking_number: string | null;
    status: string;
    estimated_delivery: string | null;
    actual_delivery: string | null;
} 