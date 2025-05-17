'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Home, ShoppingCart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-xl"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="relative w-64 h-64"
          >
            <Image
              src="https://placekitten.com/400/400"
              alt="Cute cat 404 image"
              width={256}
              height={256}
              className="object-contain rounded-full"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-0 right-0 w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl"
            >
              404
            </motion.div>
          </motion.div>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">Ối! Trang này không tồn tại</h1>
        <p className="text-lg text-gray-600 mb-8">
          Có vẻ như bạn đang tìm kiếm một món hàng đã cháy hàng trong kho của chúng tôi!
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center justify-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-amber-600 transition-colors">
              <Home size={20} />
              Về trang chủ
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/products" className="flex items-center justify-center gap-2 bg-white text-amber-500 border border-amber-500 px-6 py-3 rounded-lg font-medium hover:bg-amber-50 transition-colors">
              <ShoppingCart size={20} />
              Xem sản phẩm
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-gray-500"
        >
          <p className="text-sm">Đừng lo, đây chỉ là lỗi nhỏ trong hành trình mua sắm của bạn</p>
          <p className="text-xs mt-2">Mã lỗi: 404-giỏ-hàng-trống-rỗng</p>
        </motion.div>
      </motion.div>
    </div>
  );
} 