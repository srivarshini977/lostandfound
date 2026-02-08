'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { MapPin, Calendar, Image as ImageIcon, CheckCircle, ArrowRight, ArrowLeft, UploadCloud, X } from 'lucide-react';
import Link from 'next/link';

export default function PostItemPage() {
    const router = useRouter();
    const { user } = useUser();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        reportType: 'lost', // Default
        itemName: '',
        category: 'Other',
        description: '',
        dateLost: new Date().toISOString().split('T')[0],
        lastSeenLocation: '',
        imageUrl: '',
    });

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB limit');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, imageUrl: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/items/lost', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (res.ok) router.push('/dashboard');
            else {
                const err = await res.json();
                alert(err.error || 'Failed to post item');
            }
        } catch (err) { console.error(err); alert('Something went wrong'); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Progress Header */}
            <div className="max-w-4xl mx-auto mb-12">
                <Link href="/dashboard" className="text-gray-500 text-sm mb-6 inline-flex items-center gap-1 hover:text-gray-900"><ArrowLeft size={16} /> Back to Dashboard</Link>
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -z-10"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className={`flex flex-col items-center gap-2 bg-gray-50 px-2 ${step >= s ? 'text-[#2563eb]' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${step >= s ? 'bg-[#2563eb] text-white border-[#2563eb]' : 'bg-white border-gray-300'
                                }`}>
                                {step > s ? <CheckCircle size={20} /> : s}
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider bg-gray-50 px-2">
                                {s === 1 ? 'Basic Info' : s === 2 ? 'Details & Image' : 'Review'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <form onSubmit={handleSubmit}>
                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <h2 className="text-2xl font-bold text-gray-900">What happened?</h2>

                                    {/* Report Type Selection */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, reportType: 'lost' })}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${formData.reportType === 'lost'
                                                ? 'border-[#2563eb] bg-blue-50 text-[#2563eb] ring-1 ring-[#2563eb]'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                        >
                                            <span className="text-2xl block mb-2">😟</span>
                                            <span className="font-bold block">I Lost Something</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, reportType: 'found' })}
                                            className={`p-4 rounded-xl border-2 text-center transition-all ${formData.reportType === 'found'
                                                ? 'border-green-600 bg-green-50 text-green-700 ring-1 ring-green-600'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                        >
                                            <span className="text-2xl block mb-2">🎉</span>
                                            <span className="font-bold block">I Found Something</span>
                                        </button>
                                    </div>

                                    <hr className="border-gray-100" />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                                        <input required type="text" value={formData.itemName} onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                                            className="input-base text-lg font-medium" placeholder={formData.reportType === 'found' ? "E.g. Black Dell Laptop" : "E.g. Blue Hydroflask"} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['Electronics', 'Clothing', 'Books', 'Accessories', 'Other'].map(cat => (
                                                <button type="button" key={cat} onClick={() => setFormData({ ...formData, category: cat })}
                                                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${formData.category === cat
                                                        ? 'border-[#2563eb] bg-blue-50 text-[#2563eb] ring-1 ring-[#2563eb]'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}>
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-gray-400 font-normal">(Max 300 chars)</span></label>
                                        <textarea required rows={4} maxLength={300} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="input-base" placeholder="Describe any identifying marks, colors, or stickers..." />
                                        <div className="text-right text-xs text-gray-400 mt-1">{formData.description.length}/300</div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Image</h2>
                                        <label
                                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50'); }}
                                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50'); }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                    const file = e.dataTransfer.files[0];
                                                    if (file.size > 5 * 1024 * 1024) { alert('File size exceeds 5MB limit'); return; }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => { setFormData({ ...formData, imageUrl: reader.result }); };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            {formData.imageUrl ? (
                                                <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden">
                                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain bg-gray-100" />
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white font-medium flex items-center gap-2"><UploadCloud size={20} /> Change Image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-12 h-12 bg-blue-50 text-[#2563eb] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                        <UploadCloud size={24} />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                                                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                                </>
                                            )}
                                        </label>
                                        {formData.imageUrl && (
                                            <div className="flex justify-end mt-2">
                                                <button type="button" onClick={() => setFormData({ ...formData, imageUrl: '' })} className="text-xs font-medium text-red-500 hover:text-red-700">Remove Image</button>
                                            </div>
                                        )}
                                    </div>

                                    <hr className="border-gray-100" />

                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4">When and where?</h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Lost</label>
                                                <input required type="date" value={formData.dateLost} onChange={e => setFormData({ ...formData, dateLost: e.target.value })}
                                                    className="input-base" />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                                    <input required type="text" value={formData.lastSeenLocation} onChange={e => setFormData({ ...formData, lastSeenLocation: e.target.value })}
                                                        className="input-base pl-12" placeholder="E.g. Library 2nd Floor" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <h2 className="text-2xl font-bold text-gray-900">Review & Submit</h2>

                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-4">
                                        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 overflow-hidden">
                                                    {formData.imageUrl ? (
                                                        <img src={formData.imageUrl} alt="Item" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon size={24} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{formData.itemName}</h4>
                                                    <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full">{formData.category}</span>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setStep(1)} className="text-sm text-[#2563eb] font-medium hover:underline">Edit</button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 block mb-1">Date Lost</span>
                                                <span className="font-medium text-gray-900">{formData.dateLost}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block mb-1">Location</span>
                                                <span className="font-medium text-gray-900">{formData.lastSeenLocation}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-gray-500 block mb-1">Description</span>
                                            <p className="text-gray-900 text-sm">{formData.description}</p>
                                        </div>

                                        {/* Contact Review Section */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">Contact Information</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500 block mb-1">Name</span>
                                                    <span className="font-medium text-gray-900">{user?.fullName || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block mb-1">Email</span>
                                                    <span className="font-medium text-gray-900">{user?.emailAddresses[0]?.emailAddress}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                                        <CheckCircle size={20} className="text-[#2563eb] shrink-0 mt-0.5" />
                                        <p className="text-sm text-blue-800">
                                            By submitting, your item will be posted to the public feed. Your contact info remains private until you choose to reply to a finder.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                                {step > 1 ? (
                                    <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary">
                                        Previous
                                    </button>
                                ) : (
                                    <Link href="/dashboard" className="btn-secondary text-center">
                                        Cancel
                                    </Link>
                                )}

                                {step < 3 ? (
                                    <button type="button" onClick={() => {
                                        if (step === 1 && (!formData.itemName || !formData.description)) return alert('Please fill details');
                                        if (step === 2 && (!formData.lastSeenLocation)) return alert('Please fill location');
                                        setStep(step + 1);
                                    }} className="btn-primary">
                                        Next Step
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading} className="btn-primary">
                                        {loading ? 'Submitting...' : 'Submit Item'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:col-span-1 hidden lg:block">
                    <div className="sticky top-8">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Preview</h3>
                        {/* Item Card Preview reused */}
                        <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden relative opacity-80 scale-95 origin-top">
                            {formData.imageUrl ? (
                                <div className="h-48 bg-gray-100">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.itemName || 'Item Name'}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{formData.description || 'Description...'}</p>
                                <div className="flex items-center text-gray-400 text-xs font-medium gap-2">
                                    <MapPin size={14} /> {formData.lastSeenLocation || 'Location'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
