'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
    LayoutDashboard, PlusCircle, Search, Package, Bell,
    TrendingUp, Users, Clock, Shield, Send
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Recent Item Component
const RecentItemCard = ({ item }) => (
    <div className="flex gap-4 p-4 border rounded-xl border-gray-100 bg-white hover:border-blue-100 transition-all">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
            {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Package size={24} />
                </div>
            )}
        </div>
        <div className="overflow-hidden">
            <h4 className="font-bold text-gray-900 truncate">{item.itemName}</h4>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1 inline-block">{item.category}</span>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
            </p>
        </div>
    </div>
);

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const [stats, setStats] = useState({ itemsPosted: 0, itemsRecovered: 0, alertsSent: 0 });
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            fetch('/api/user/stats')
                .then(res => res.json())
                .then(data => {
                    setStats(data.stats);
                    setTimeline(data.timeline);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isLoaded, user]);

    if (!isLoaded) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2 text-[#2563eb] font-bold text-xl">
                        <Shield size={24} /> CampusFind
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-[#2563eb] rounded-lg font-medium">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link href="/post-item" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                        <PlusCircle size={20} /> Post Item
                    </Link>
                    <Link href="/feed" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                        <Search size={20} /> Browse Feed
                    </Link>
                    <Link href="/my-items" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                        <Package size={20} /> My Items
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <img src={user?.imageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.emailAddresses[0]?.emailAddress}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 sm:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome back, {user?.firstName}!
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Overview of your lost and found activity.
                        </p>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <Package size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Items Posted</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats?.itemsPosted || 0}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Recovered</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats?.itemsRecovered || 0}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                            <Bell size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Alerts Sent</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats?.alertsSent || 0}</h3>
                        </div>
                    </div>
                    {/* Gamification Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 border-l-4 border-l-yellow-400">
                        <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Reputation</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold text-gray-900">{stats?.reputationPoints || 0}</h3>
                                {stats?.badges?.includes('Trusted Finder') && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-green-200">
                                        Trusted
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Activity Timeline */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-900 text-lg mb-6">Recent Activity</h3>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>)}
                            </div>
                        ) : timeline.length > 0 ? (
                            <div className="space-y-6">
                                {timeline.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 relative">
                                        {/* Connector Line */}
                                        {idx !== timeline.length - 1 && (
                                            <div className="absolute left-6 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                                        )}

                                        <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 
                                            ${item.type === 'ITEM_POSTED' ? 'bg-blue-100 text-blue-600' :
                                                item.type === 'ALERT_SENT' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {item.type === 'ITEM_POSTED' && <Package size={18} />}
                                            {item.type === 'ALERT_SENT' && <Send size={18} />}
                                            {item.type === 'ALERT_RECEIVED' && <Bell size={18} />}
                                        </div>
                                        <div className="pt-2 pb-2">
                                            <p className="text-gray-900 font-medium">
                                                {item.type === 'ITEM_POSTED' && `Posted: ${item.itemName}`}
                                                {item.type === 'ALERT_SENT' && `You found: ${item.lostItemId?.itemName || 'Unknown Item'}`}
                                                {item.type === 'ALERT_RECEIVED' && `Alert: Someone found your ${item.lostItemId?.itemName}`}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <Clock size={40} className="mx-auto mb-3 opacity-50" />
                                <p>No recent activity.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                            <h3 className="font-bold text-xl mb-2">Lost something?</h3>
                            <p className="text-blue-100 text-sm mb-6">Report it immediately to notify the community.</p>
                            <Link href="/post-item" className="w-full bg-white text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                <PlusCircle size={20} /> Report Item
                            </Link>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Found something?</h3>
                            <p className="text-gray-500 text-sm mb-6">Browse recent lost reports to match what you found.</p>
                            <Link href="/feed" className="w-full bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                                <Search size={20} /> Browse Feed
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
