'use client';

import { useEffect, useState } from 'react';
import { useUser, UserProfile } from '@clerk/nextjs';
import { Trash2, CheckCircle, Clock, Search, Settings, AlertTriangle, Shield, Archive } from 'lucide-react';
import Link from 'next/link';

export default function MyItemsPage() {
    const { user, isLoaded } = useUser();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('lost'); // 'lost', 'alerts', 'settings'
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'Active', 'Found'

    useEffect(() => {
        if (isLoaded && user) {
            fetchMyItems();
        }
    }, [isLoaded, user]);

    const fetchMyItems = async () => {
        try {
            const email = user.emailAddresses[0].emailAddress;
            const res = await fetch(`/api/items/lost?ownerEmail=${email}`);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        if (!confirm('Mark this item as resolved/found?')) return;
        try {
            await fetch('/api/items/lost', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            fetchMyItems();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this post?')) return;
        try {
            await fetch(`/api/items/lost?id=${id}`, { method: 'DELETE' });
            fetchMyItems();
        } catch (err) { console.error(err); }
    };

    // Filter logic
    const filteredItems = items.filter(item => {
        if (filterStatus === 'All') return true;
        if (filterStatus === 'Active') return !item.isResolved;
        if (filterStatus === 'Found') return item.isResolved;
        return true;
    });

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Simple Header for Profile Page */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <Link href="/dashboard" className="text-xl font-bold text-[#2563eb] flex items-center gap-2">
                        <Shield size={24} /> CampusFind
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-900">Feed</Link>
                        <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">

                    {/* Profile Sidebar */}
                    <div className="w-full md:w-64 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                        <img src={user?.imageUrl} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-50" />
                        <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
                        <p className="text-sm text-gray-500 mb-6">{user?.emailAddresses[0]?.emailAddress}</p>

                        <div className="space-y-1 text-left">
                            <button
                                onClick={() => setActiveTab('lost')}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'lost' ? 'bg-blue-50 text-[#2563eb]' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Archive size={18} /> My Lost Items
                            </button>
                            <button
                                onClick={() => setActiveTab('alerts')}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'alerts' ? 'bg-blue-50 text-[#2563eb]' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <AlertTriangle size={18} /> Alerts Sent
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-[#2563eb]' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Settings size={18} /> Account Settings
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 w-full">
                        {activeTab === 'lost' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h1 className="text-2xl font-bold text-gray-900">My Lost Items</h1>
                                    <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                                        {['All', 'Active', 'Found'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setFilterStatus(status)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === status ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>)}
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                        <Archive size={48} className="text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                                        <p className="text-gray-500 mb-6">You haven't reported any items in this category.</p>
                                        <Link href="/post-item" className="btn-primary py-2 px-4 text-sm">
                                            Report an Item
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredItems.map(item => (
                                            <div key={item._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-5 hover:border-blue-200 transition-colors">
                                                {/* Status Icon */}
                                                <div className="shrink-0">
                                                    {item.isResolved ? (
                                                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                                            <CheckCircle size={20} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                                                            <Clock size={20} />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="text-lg font-bold text-gray-900">{item.itemName}</h3>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.isResolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {item.isResolved ? 'Found' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500 text-sm mb-4 line-clamp-1">{item.description}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span>{new Date(item.dateLost).toLocaleDateString()}</span>
                                                        <span>•</span>
                                                        <span>{item.category}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row sm:flex-col gap-2 justify-center">
                                                    {!item.isResolved && (
                                                        <button onClick={() => handleResolve(item._id)} className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                            Mark Found
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(item._id)} className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'alerts' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                <AlertTriangle size={48} className="text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Alert History</h3>
                                <p className="text-gray-500">Feature coming soon: Track alerts you've sent to other owners.</p>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                                {/* We use Clerk's prebuilt profile component here */}
                                <UserProfile routing="hash" />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
