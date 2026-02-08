'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Search, Filter, Shield } from 'lucide-react';
import ItemCard from '@/components/ItemCard';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';



export default function FeedPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Found


    useEffect(() => {
        // Load saved search preference
        const savedCategory = localStorage.getItem('cf_category');
        const savedSearch = localStorage.getItem('cf_search');
        const savedStatus = localStorage.getItem('cf_status');

        if (savedCategory) setCategory(savedCategory);
        if (savedSearch) setSearch(savedSearch);
        if (savedStatus) setStatusFilter(savedStatus);
    }, []);

    useEffect(() => {
        fetchItems();
        localStorage.setItem('cf_category', category);
        localStorage.setItem('cf_search', search);
        localStorage.setItem('cf_status', statusFilter);
    }, [category, statusFilter, search]); // Added search to dependency to save it on change (debounce ideally, but simple here)

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== 'All') params.append('category', category);
            if (search) params.append('search', search);

            // Client-side status filtering for now since API might not support it yet
            // In a real app, pass status to API: if (statusFilter !== 'All') params.append('status', statusFilter);

            const res = await fetch(`/api/items/lost?${params.toString()}`);
            let data = await res.json();

            // Client-side filtering for status
            if (statusFilter === 'Active') data = data.filter(i => !i.isResolved);
            if (statusFilter === 'Found') data = data.filter(i => i.isResolved);

            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchItems();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navigation for Feed */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-[#2563eb] flex items-center gap-2">
                        <Shield size={24} /> CampusFind
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/post-item" className="btn-primary py-2 px-4 text-sm hidden sm:block">
                            Post Lost Item
                        </Link>
                        <SignedIn>
                            <Link href="/dashboard" className="text-gray-600 font-medium hover:text-[#2563eb]">Dashboard</Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-gray-600 font-medium hover:text-[#2563eb]">Sign In</button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>
            </nav>

            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Filters
                        </h3>

                        {/* Status Filter */}
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                            <div className="space-y-2">
                                {['All', 'Active', 'Found'].map(status => (
                                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={statusFilter === status}
                                            onChange={() => setStatusFilter(status)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                            <div className="space-y-1">
                                {['All', 'Electronics', 'Clothing', 'Books', 'Accessories', 'Other'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Feed Content */}
                <div className="flex-1">
                    {/* Search & Toolbar */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search lost items..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>


                    </div>

                    {/* Results Info */}
                    <div className="mb-4 flex gap-2 items-center text-sm text-gray-500">
                        <span>Showing {items.length} results</span>
                        {category !== 'All' && <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 text-xs">{category}</span>}
                        {statusFilter !== 'All' && <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700 text-xs">{statusFilter}</span>}
                    </div>

                    <div>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <Search size={48} className="text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                                <p className="text-gray-500">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map(item => (
                                    <ItemCard key={item._id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
