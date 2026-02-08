'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, MapPin, Calendar, Smartphone, MessageSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ClaimPage() {
    const { alertId } = useParams();
    const router = useRouter();
    const [alertData, setAlertData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [meetingDetails, setMeetingDetails] = useState('');
    const [showAcceptForm, setShowAcceptForm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!alertId) return;

        // Fetch Alert and Item Details
        fetch(`/api/alerts/${alertId}`)
            .then(res => {
                if (!res.ok) throw new Error('Alert not found');
                return res.json();
            })
            .then(data => {
                setAlertData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Invalid or expired claim link.');
                setLoading(false);
            });
    }, [alertId]);

    const handleMatch = async () => {
        if (!confirm("This will mark the item as found and delete it from the database. Are you sure?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/alerts/${alertId}/match`, { method: 'POST' });
            if (res.ok) setSuccess('match');
            else alert('Failed to match.');
        } catch (err) {
            console.error(err);
            alert('Error processing match.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnmatch = async () => {
        if (!confirm("This will notify the finder that this is NOT your item. Proceed?")) return;
        setActionLoading(true);
        try {
            const res = await fetch(`/api/alerts/${alertId}/unmatch`, { method: 'POST' });
            if (res.ok) setSuccess('unmatch');
            else alert('Failed to unmatch.');
        } catch (err) {
            console.error(err);
            alert('Error processing unmatch.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center p-4">Loading verification details...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center p-4 text-red-500 font-bold">{error}</div>;
    if (!alertData) return null;

    const { alert, item } = alertData;

    if (success === 'match') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Verified!</h1>
                    <p className="text-gray-600 mb-6">
                        Great! We've notified the finder. The item has been removed from the database.
                        Please coordinate with the finder to pick it up.
                    </p>
                    <Link href="/dashboard" className="text-indigo-600 font-medium hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    if (success === 'unmatch') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Unmatch Confirmed</h1>
                    <p className="text-gray-600 mb-6">
                        We've let the finder know this isn't your item. Thanks for verifying!
                    </p>
                    <Link href="/dashboard" className="text-indigo-600 font-medium hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <h1 className="text-2xl font-bold">Verify Found Item</h1>
                    <p className="text-indigo-100 text-sm mt-1">Someone believes they found your item. Please review the details below.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-0 md:divide-x divide-gray-100">
                    {/* Your Lost Item */}
                    <div className="p-8 bg-gray-50/50">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Your Lost Item</h2>
                        <div className="flex gap-4 mb-6">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{item.itemName}</h3>
                                <p className="text-sm text-gray-500">{item.category}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p className="flex gap-2"><MapPin size={16} className="text-indigo-500" /> Lost at: <span className="font-medium text-gray-900">{item.lastSeenLocation}</span></p>
                            <p className="flex gap-2"><Calendar size={16} className="text-indigo-500" /> Date: <span className="font-medium text-gray-900">{new Date(item.dateLost).toLocaleDateString()}</span></p>
                        </div>
                    </div>

                    {/* What They Found */}
                    <div className="p-8">
                        <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">What They Found</h2>

                        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                            {alert.foundImageUrl ? (
                                <img src={alert.foundImageUrl} alt="Found Item" className="w-full h-64 object-contain bg-black/5" />
                            ) : (
                                <div className="h-40 flex items-center justify-center text-gray-400 text-sm italic">No photo provided</div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <p className="text-xs text-indigo-800 font-bold mb-1 uppercase">Location Found</p>
                                <p className="text-gray-900 font-medium">{alert.foundLocation}</p>
                            </div>

                            {alert.message && (
                                <div>
                                    <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Message</p>
                                    <p className="text-gray-700 italic">"{alert.message}"</p>
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                {alert.mobile && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                                        <Smartphone size={14} /> {alert.mobile}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-8 border-t border-gray-100 bg-white">
                    {!showAcceptForm ? (
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={handleUnmatch}
                                disabled={actionLoading}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">
                                {actionLoading ? 'Processing...' : 'Unmatch (Not mine)'}
                            </button>
                            <button
                                onClick={handleMatch}
                                disabled={actionLoading}
                                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50">
                                <CheckCircle size={18} />
                                {actionLoading ? 'Processing...' : 'Match (It\'s mine!)'}
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
