'use client';

import { useState } from 'react';
import { MapPin, Calendar, Tag, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import AlertModal from './AlertModal';

export default function ItemCard({ item }) {
    const { user } = useUser();
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const isOwner = user?.emailAddresses[0]?.emailAddress === item.ownerEmail;

    return (
        <>
            <div className="group bg-white rounded-2xl shadow-sm hover:shadow-[0_0_20px_rgba(37,99,235,0.15)] hover:border-indigo-300 transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden relative">
                {/* Trusted Badge for Found Items */}
                {item.reportType === 'found' && item.ownerBadges?.includes('Trusted Finder') && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-emerald-500 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                            <Shield size={12} fill="currentColor" /> Trusted Finder
                        </span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 right-4 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-indigo-50">
                        <Tag size={12} /> {item.category}
                    </span>
                </div>

                {/* Image or Decorative Header */}
                <div className="h-48 bg-gray-100 relative overflow-hidden group-hover:h-52 transition-all duration-300">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-white/50">
                                <Tag size={32} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center text-gray-400 text-xs font-medium mb-3 gap-2">
                        <Calendar size={14} />
                        {new Date(item.dateLost).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                        {item.itemName}
                    </h3>

                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                        {item.description}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-3 mb-5 flex items-start gap-2.5">
                        <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Last Seen</p>
                            <p className="text-sm font-medium text-gray-800">{item.lastSeenLocation}</p>
                        </div>
                    </div>

                    <div className="pt-2 mt-auto">
                        {isOwner ? (
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (confirm('Are you sure you want to delete this item?')) {
                                            fetch(`/api/items/${item._id}/delete`, { method: 'DELETE' })
                                                .then(res => {
                                                    if (res.ok) window.location.reload();
                                                    else alert('Failed to delete');
                                                });
                                        }
                                    }}
                                    className="flex-1 py-2.5 px-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2"
                                >
                                    Delete
                                </button>
                                {/* Edit button could go here */}
                                <div className="flex-1 py-2.5 px-4 bg-gray-50 text-gray-400 rounded-xl text-sm font-medium text-center border border-gray-100 cursor-default">
                                    Your Post
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAlertOpen(true)}
                                className="w-full py-2.5 px-4 bg-gray-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg shadow-gray-200 hover:shadow-indigo-200 hover:-translate-y-0.5"
                            >
                                <AlertCircle size={16} />
                                I Found This
                                <ArrowRight size={14} className="opacity-0 -ml-2 group-hover/btn:opacity-100 group-hover/btn:ml-0 transition-all" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isAlertOpen && (
                <AlertModal item={item} onClose={() => setIsAlertOpen(false)} />
            )}
        </>
    );
}
