'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          RoabH Mart
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="hover:text-secondary-foreground transition-colors">
            All Products
          </Link>
          <Link href="/products?category=electronics" className="hover:text-secondary-foreground transition-colors">
            Electronics
          </Link>
          <Link href="/products?category=clothing" className="hover:text-secondary-foreground transition-colors">
            Clothing
          </Link>
          <Link href="/products?category=home" className="hover:text-secondary-foreground transition-colors">
            Home & Garden
          </Link>
        </nav>

        {/* Search, Cart, and User */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/search" className="hover:text-secondary-foreground transition-colors">
            <Search className="w-6 h-6" />
          </Link>
          <Link href="/cart" className="hover:text-secondary-foreground transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-accent-foreground text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              0
            </span>
          </Link>
          
          {/* User Menu */}
          <div className="relative">
            {user ? (
              <div>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="hover:text-secondary-foreground transition-colors focus:outline-none"
                >
                  <User className="w-6 h-6" />
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                    <Link 
                      href="/account" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link 
                      href="/account/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hover:text-secondary-foreground transition-colors">
                <User className="w-6 h-6" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/products"
              className="text-white hover:text-secondary-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            <Link
              href="/products?category=electronics"
              className="text-white hover:text-secondary-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Electronics
            </Link>
            <Link
              href="/products?category=clothing"
              className="text-white hover:text-secondary-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Clothing
            </Link>
            <Link
              href="/products?category=home"
              className="text-white hover:text-secondary-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home & Garden
            </Link>

            <div className="flex items-center space-x-6 pt-2 border-t border-primary-foreground">
              <Link
                href="/search"
                className="text-white hover:text-secondary-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="w-6 h-6" />
              </Link>
              <Link
                href="/cart"
                className="text-white hover:text-secondary-foreground transition-colors relative"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 bg-accent-foreground text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  0
                </span>
              </Link>
              
              {user ? (
                <div className="flex flex-col space-y-2 pt-2 border-t border-primary-foreground w-full">
                  <p className="text-sm text-white">{user.email}</p>
                  <Link
                    href="/account"
                    className="text-white hover:text-secondary-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="text-white hover:text-secondary-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="text-left text-red-300 hover:text-red-100 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-white hover:text-secondary-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-6 h-6" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 