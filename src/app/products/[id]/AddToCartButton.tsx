'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/types';

interface AddToCartButtonProps {
    product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);

    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const handleAddToCart = () => {
        setIsAdding(true);

        // In a real app, this would dispatch an action to add to cart
        setTimeout(() => {
            console.log(`Added ${quantity} of ${product.name} to cart`);
            setIsAdding(false);
        }, 500);
    };

    if (product.stock <= 0) {
        return (
            <button
                className="w-full bg-gray-300 text-gray-600 py-3 rounded-md cursor-not-allowed"
                disabled
            >
                Out of Stock
            </button>
        );
    }

    return (
        <div>
            <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="mr-4">Quantity:</label>
                <div className="flex items-center border rounded-md">
                    <button
                        onClick={handleDecrement}
                        className="px-3 py-2 border-r hover:bg-gray-100"
                        disabled={quantity <= 1}
                    >
                        -
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                        onClick={handleIncrement}
                        className="px-3 py-2 border-l hover:bg-gray-100"
                        disabled={quantity >= product.stock}
                    >
                        +
                    </button>
                </div>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`w-full bg-primary text-white py-3 rounded-md flex items-center justify-center ${isAdding ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'
                    } transition-colors`}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAdding ? 'Adding...' : 'Add to Cart'}
            </button>
        </div>
    );
} 