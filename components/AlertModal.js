'use client';

import { useState } from 'react';
import { X, Send, AlertCircle, UploadCloud } from 'lucide-react';

export default function AlertModal({ item, onClose }) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        foundLocation: '',
        mobile: '',
        department: '',
        message: '',
        imageUrl: ''
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert('File size exceeds 5MB limit'); return; }
        const reader = new FileReader();
        reader.onloadend = () => { setFormData({ ...formData, imageUrl: reader.result }); };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/items/alert-owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lostItemId: item._id,
                    ...formData
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2500);
            } else {
                alert('Failed to send alert. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                        <Send size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Alert Sent!</h3>
                    <p className="text-gray-500">The owner has been sent the details and photo of the found item.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-200">

                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">I Found This!</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 flex gap-3 items-start">
                        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold">{item.itemName}</p>
                            <p className="opacity-80">Help the owner verify it's theirs by providing details.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                                <input required type="tel" className="input-base text-sm" placeholder="Your Phone"
                                    value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input required type="text" className="input-base text-sm" placeholder="Your Dept"
                                    value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Where did you find it?</label>
                            <input required type="text" className="input-base" placeholder="Exact location..."
                                value={formData.foundLocation} onChange={e => setFormData({ ...formData, foundLocation: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Found Image</label>
                            <label className="flex items-center gap-3 border border-gray-300 border-dashed rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                                    {formData.imageUrl ? (
                                        <img src={formData.imageUrl} alt="Found" className="w-full h-full object-cover" />
                                    ) : (
                                        <UploadCloud size={20} />
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium text-indigo-600">Click to upload</span> photo of item
                                </div>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                            <textarea className="input-base h-20 resize-none" placeholder="Any extra details..."
                                value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-indigo-200 mt-2">
                            {loading ? 'Sending to Owner...' : 'Notify Owner'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
