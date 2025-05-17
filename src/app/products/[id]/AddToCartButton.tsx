'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useAlert } from '@/lib/context/alert-context';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
    product: Product;
    quantity: number;
    className?: string;
    onAddToCart?: () => void;
}

export default function AddToCartButton({ 
    product, 
    quantity, 
    className = '', 
    onAddToCart 
}: AddToCartButtonProps) {
    const [isAdding, setIsAdding] = useState(false);
    const { showAlert } = useAlert();
    const router = useRouter();

    const handleAddToCart = async () => {
        setIsAdding(true);
        
        try {
            // Check if the product is in stock
            if (product.stock_quantity < quantity) {
                showAlert('error', 'Not enough items in stock', 3000);
                return;
            }
            
            // Call API to add item to cart
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    product_id: product.product_id,
                    quantity: quantity
                }),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                
                try {
                    // Try to parse the error response
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    console.error('Failed to parse error response:', errorText);
                    throw new Error('Failed to add to cart');
                }
                
                throw new Error(errorData?.message || errorData?.error || 'Failed to add to cart');
            }
            
            // Show success message
            showAlert('success', `${quantity} ${product.name} added to your cart`, 2000);
            
            // Call the callback if provided
            if (onAddToCart) {
                onAddToCart();
            }
            
            // Optionally refresh the page data to update stock counts
            router.refresh();
        } catch (error) {
            console.error('Error adding to cart:', error);
            showAlert('error', 'Failed to add to cart. Please try again.', 3000);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-md flex items-center justify-center ${className} ${isAdding ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {isAdding ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                </>
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                </>
            )}
        </button>
    );
} 