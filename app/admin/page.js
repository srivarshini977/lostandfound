'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
    LayoutDashboard, Shield, Package, Bell, TrendingUp, Activity, Lock
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const [stats, setStats] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        if (isLoaded && user) {
            Promise.all([
                fetch('/api/admin/stats').then(res => res.json()),
                fetch('/api/admin/users').then(res => res.json())
            ]).then(([statsData, usersData]) => {
                if (statsData.error) throw new Error(statsData.error);
                setStats(statsData.stats);
                setTimeline(statsData.timeline);
                setUsers(usersData);
                setLoading(false);
            }).catch(err => {
                setError(err.message);
                setLoading(false);
            });
        }
    }, [isLoaded, user]);

    if (!isLoaded) return null;
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
            <Lock size={48} className="text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">{error}</h1>
            <Link href="/dashboard" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar (Simplified for Admin) */}
            <aside className="hidden lg:flex flex-col w-64 bg-gray-900 text-white fixed h-full z-10">
                <div className="p-6 border-b border-gray-800">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <Shield size={24} className="text-red-500" /> Admin Panel
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <LayoutDashboard size={20} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                        <Package size={20} /> Users
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 sm:p-8">
                {activeTab === 'overview' ? (
                    <>
                        <header className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                            <p className="text-gray-500">Global statistics for Campus Lost & Found.</p>
                        </header>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Total Items Reported</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats?.totalItems || 0}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Active Items</p>
                                <h3 className="text-3xl font-bold text-blue-600">{stats?.activeItems || 0}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Items Recovered</p>
                                <h3 className="text-3xl font-bold text-green-600">{stats?.resolvedItems || 0}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <p className="text-sm text-gray-500 font-medium mb-1">Total Alerts Sent</p>
                                <h3 className="text-3xl font-bold text-purple-600">{stats?.totalAlerts || 0}</h3>
                            </div>
                        </div>

                        {/* System Activity */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                                <Activity size={20} className="text-blue-500" /> Live System Activity
                            </h3>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse"></div>)}
                                </div>
                            ) : (
                                <div className="space-y-0 divide-y divide-gray-100">
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="py-4 flex gap-4 items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                                ${item.type === 'ITEM_POSTED' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                {item.type === 'ITEM_POSTED' ? <Package size={18} /> : <Bell size={18} />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {item.type === 'ITEM_POSTED'
                                                        ? `New Item Reported: ${item.itemName} (${item.category})`
                                                        : `Alert Triggered: For item "${item.lostItemId?.itemName || 'Unknown'}"`
                                                    }
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.date).toLocaleString()} • {item.type === 'ITEM_POSTED' ? `By ${item.ownerEmail}` : `Found by ${item.finderEmail}`}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.type === 'ITEM_POSTED' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                    {item.type === 'ITEM_POSTED' ? 'POST' : 'ALERT'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <header className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-500">View and manage all registered users.</p>
                        </header>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Email</th>
                                            <th className="px-6 py-4">Reputation</th>
                                            <th className="px-6 py-4">Badges</th>
                                            <th className="px-6 py-4">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {users.map(u => (
                                            <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                        {u.email[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{u.fullName || 'Unknown'}</span>
                                                </td>
                                                <td className="px-6 py-4">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-bold text-xs">{u.reputationPoints || 0} pts</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {u.badges && u.badges.length > 0 ? u.badges.map(b => (
                                                            <span key={b} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs border border-green-200">
                                                                {b}
                                                            </span>
                                                        )) : <span className="text-gray-400 italic">None</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
