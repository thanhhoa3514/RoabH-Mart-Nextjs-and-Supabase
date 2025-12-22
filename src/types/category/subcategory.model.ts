
export interface Subcategory {
    subcategory_id: number;
    category_id: number;
    name: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    display_order: number;
}

