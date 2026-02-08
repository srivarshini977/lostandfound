import { SignIn } from "@clerk/nextjs";
import Link from 'next/link';
import { Shield, ArrowRight } from 'lucide-react';

export default function Page() {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side (Brand/Info) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <Link href="/" className="text-2xl font-bold flex items-center gap-2">
                        <Shield size={28} className="text-[#2563eb]" /> CampusFind
                    </Link>
                </div>

                <div className="z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Welcome Back.</h1>
                    <p className="text-gray-400 text-xl mb-8">Log in to manage your lost items, check for updates, or report something you've found.</p>

                    <Link href="/feed" className="inline-flex items-center gap-2 text-[#2563eb] font-semibold hover:gap-3 transition-all">
                        Browse Public Feed <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="z-10 text-sm text-gray-500">
                    © {new Date().getFullYear()} Campus Lost & Found
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#2563eb] opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

            {/* Right Side (Clerk Auth) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-gray-50/50">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <Shield className="mx-auto text-[#2563eb] mb-2" size={40} />
                        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                    </div>

                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-[#2563eb] hover:bg-blue-700 text-sm normal-case',
                                card: 'shadow-xl border border-gray-100 rounded-2xl bg-white',
                                headerTitle: 'hidden',
                                headerSubtitle: 'hidden',
                                rootBox: 'w-full',
                            }
                        }}
                    />

                    <p className="text-center text-gray-400 text-xs mt-6">
                        Don't have an account? <Link href="/sign-up" className="text-[#2563eb] hover:underline">Sign up for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
