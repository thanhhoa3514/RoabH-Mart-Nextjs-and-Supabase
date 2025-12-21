'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Alert, { AlertType } from '@/components/ui/alert';

interface AlertItem {
    id: string;
    type: AlertType;
    message: string;
    duration?: number;
}

interface AlertContextType {
    alerts: AlertItem[];
    showAlert: (type: AlertType, message: string, duration?: number) => void;
    hideAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<AlertItem[]>([]);

    // Generate a unique ID for each alert
    const generateId = () => `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Hide an alert by ID
    const hideAlert = useCallback((id: string) => {
        setAlerts((prevAlerts) => prevAlerts.filter(alert => alert.id !== id));
    }, []);

    // Show a new alert
    const showAlert = useCallback((type: AlertType, message: string, duration = 5000) => {
        const id = generateId();
        setAlerts((prevAlerts) => [...prevAlerts, { id, type, message, duration }]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                hideAlert(id);
            }, duration);
        }

        return id;
    }, [hideAlert]);

    return (
        <AlertContext.Provider value={{ alerts, showAlert, hideAlert }}>
            {children}

            {/* Render all active alerts */}
            <div className="alert-container">
                {alerts.map((alert, index) => (
                    <div
                        key={alert.id}
                        style={{
                            position: 'fixed',
                            top: `${(index * 80) + 16}px`,
                            right: '16px',
                            zIndex: 50
                        }}
                    >
                        <Alert
                            type={alert.type}
                            message={alert.message}
                            duration={alert.duration}
                            onClose={() => hideAlert(alert.id)}
                        />
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
}

// Custom hook to use the alert context
export function useAlert() {
    const context = useContext(AlertContext);

    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }

    return context;
}
