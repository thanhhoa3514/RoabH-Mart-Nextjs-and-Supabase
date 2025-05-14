export interface DbOrder {
    order_id: number;
    user_id: number;
    order_number: string;
    total_amount: number;
    status: string;
    order_date: string;
}
