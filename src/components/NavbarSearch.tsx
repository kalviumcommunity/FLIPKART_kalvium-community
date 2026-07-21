'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search } from 'lucide-react';

export function NavbarSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/home?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-xl relative hidden md:block">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search for products, brands and more"
        className="w-full py-2 pl-4 pr-10 rounded-sm text-gray-800 text-sm outline-none"
      />
      <button type="submit" className="absolute right-0 top-0 h-full px-3 text-flipkart-blue">
        <Search size={18} />
      </button>
    </form>
  );
}
