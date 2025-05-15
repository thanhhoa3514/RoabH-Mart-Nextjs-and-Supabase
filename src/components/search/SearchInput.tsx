'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

interface SearchInputProps {
  initialQuery?: string;
  className?: string;
}

export default function SearchInput({ initialQuery = '', className = '' }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      // Navigate to search page with query
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      // If empty query, show all products
      router.push('/search');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for products..."
        className="w-full px-4 py-3 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Search"
      />
      <button 
        type="submit" 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary"
        aria-label="Submit search"
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
} 