export interface DbPayment {
    payment_id: number;
    order_id: number;
    amount: number;
    payment_method: string;
    transaction_id: string | null;
    status: string;
    payment_date: string;
}
