'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    SquareStack,
    ShoppingBag,
    FileText,
    Users,
    Settings,
    LogOut
} from 'lucide-react';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    isActive: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
    return (
        <Link href={href}>
            <motion.div
                className={`flex items-center p-4 rounded-lg mb-2 ${isActive
                        ? 'bg-amber-100 text-amber-500'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <div className="mr-4">
                    {icon}
                </div>
                <span className={isActive ? 'font-medium' : ''}>{label}</span>
                {isActive && (
                    <motion.div
                        className="ml-auto h-2 w-2 rounded-full bg-amber-500"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    />
                )}
            </motion.div>
        </Link>
    );
};

export default function AdminSidebar() {
    const pathname = usePathname();

    const sidebarItems = [
        {
            icon: <LayoutDashboard className="h-5 w-5" />,
            label: 'Dashboard',
            href: '/admin/dashboard'
        },
        {
            icon: <SquareStack className="h-5 w-5" />,
            label: 'Category',
            href: '/admin/categories'
        },
        {
            icon: <ShoppingBag className="h-5 w-5" />,
            label: 'Products',
            href: '/admin/products'
        },
        {
            icon: <FileText className="h-5 w-5" />,
            label: 'Orders',
            href: '/admin/orders'
        },
        {
            icon: <Users className="h-5 w-5" />,
            label: 'Customers',
            href: '/admin/customers'
        },
        {
            icon: <Settings className="h-5 w-5" />,
            label: 'Settings',
            href: '/admin/settings'
        },
    ];

    return (
        <motion.div
            className="bg-white h-screen w-64 p-4 shadow-md"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-center mb-8 mt-4">
                <motion.div
                    className="text-2xl font-bold text-amber-500"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    RoabH Admin
                </motion.div>
            </div>

            <div className="space-y-1">
                {sidebarItems.map((item, index) => (
                    <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <SidebarItem
                            icon={item.icon}
                            label={item.label}
                            href={item.href}
                            isActive={pathname === item.href}
                        />
                    </motion.div>
                ))}
            </div>

            <div className="absolute bottom-8 left-0 px-4 w-56">
                <motion.button
                    className="flex items-center p-4 text-red-500 hover:bg-red-50 rounded-lg"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <LogOut className="h-5 w-5 mr-4" />
                    <span>Logout</span>
                </motion.button>
            </div>
        </motion.div>
    );
} 