'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
    type: AlertType;
    message: string;
    duration?: number; // in milliseconds, default is 5000 (5 seconds)
    onClose?: () => void;
    isOpen?: boolean;
}

export default function Alert({
    type,
    message,
    duration = 5000,
    onClose,
    isOpen = true
}: AlertProps) {
    const [visible, setVisible] = useState(isOpen);

    // Set up auto-dismiss
    useEffect(() => {
        setVisible(isOpen);

        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                setVisible(false);
                if (onClose) onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, isOpen, onClose]);

    // Handle manual close
    const handleClose = () => {
        setVisible(false);
        if (onClose) onClose();
    };

    // Return null if not visible
    if (!visible) return null;

    // Get the appropriate styles and icon based on type
    const alertStyles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-400',
            text: 'text-green-800',
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-400',
            text: 'text-red-800',
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-400',
            text: 'text-yellow-800',
            icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            text: 'text-blue-800',
            icon: <Info className="h-5 w-5 text-blue-500" />,
        },
    };

    const { bg, border, text, icon } = alertStyles[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-4 right-4 z-50 max-w-md shadow-lg rounded-lg border-l-4 ${border} ${bg}`}
            >
                <div className="flex items-start p-4">
                    <div className="flex-shrink-0">{icon}</div>
                    <div className="ml-3 flex-1">
                        <p className={`text-sm font-medium ${text}`}>{message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleClose}
                            className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
} 