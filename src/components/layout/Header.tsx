'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';
import { ShoppingCart, User, Search, Menu, X, LogOut, ShoppingBag, Smartphone, Shirt, Home } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogoutClick = () => {
    setIsUserMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsLogoutModalOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          RoabH Mart
        </Link>

        {/* Modal Xác nhận đăng xuất */}
        <Modal
          isOpen={isLogoutModalOpen}
          onClose={handleCancelLogout}
          title="Xác nhận đăng xuất"
        >
          <div className="py-2">
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </Modal>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="hover:underline hover:opacity-90 transition-all flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            All Products
          </Link>
          <Link href="/products?category=electronics" className="hover:underline hover:opacity-90 transition-all flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Electronics
          </Link>
          <Link href="/products?category=clothing" className="hover:underline hover:opacity-90 transition-all flex items-center gap-2">
            <Shirt className="w-5 h-5" />
            Clothing
          </Link>
          <Link href="/products?category=home" className="hover:underline hover:opacity-90 transition-all flex items-center gap-2">
            <Home className="w-5 h-5" />
            Home & Garden
          </Link>
        </nav>

        {/* Search, Cart, and User */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hover:opacity-80 transition-all"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>
            
            {/* Desktop Search Dropdown */}
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg p-2 z-10">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-grow p-2 text-gray-900 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white p-2 rounded-r-md hover:bg-opacity-90"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
          
          <Link href="/cart" className="hover:opacity-80 transition-all relative">
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
                      onClick={handleLogoutClick}
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
            {/* Mobile Search Form */}
            <form onSubmit={handleSearch} className="flex mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-grow p-2 text-gray-900 border border-gray-300 rounded-l-md focus:outline-none"
              />
              <button
                type="submit"
                className="bg-white text-primary p-2 rounded-r-md"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
            
            <Link
              href="/products"
              className="text-white hover:underline hover:opacity-90 transition-all flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag className="w-5 h-5" />
              All Products
            </Link>
            <Link
              href="/products?category=electronics"
              className="text-white hover:underline hover:opacity-90 transition-all flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Smartphone className="w-5 h-5" />
              Electronics
            </Link>
            <Link
              href="/products?category=clothing"
              className="text-white hover:underline hover:opacity-90 transition-all flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Shirt className="w-5 h-5" />
              Clothing
            </Link>
            <Link
              href="/products?category=home"
              className="text-white hover:underline hover:opacity-90 transition-all flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              Home & Garden
            </Link>

            <div className="flex items-center space-x-6 pt-2 border-t border-primary-foreground">
              <Link
                href="/cart"
                className="text-white hover:opacity-80 transition-all relative"
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
                    onClick={handleLogoutClick}
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