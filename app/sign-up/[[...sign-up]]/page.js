import { SignUp } from "@clerk/nextjs";
import Link from 'next/link';
import { CheckCircle, Shield } from 'lucide-react';

export default function Page() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side (Brand/Info) */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#2563eb] text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="z-10">
                    <Link href="/" className="text-2xl font-bold flex items-center gap-2">
                        <Shield size={28} /> CampusFind
                    </Link>
                </div>

                <div className="z-10 max-w-lg">
                    <h1 className="text-4xl font-bold mb-6">Join your campus community.</h1>
                    <p className="text-blue-100 text-lg mb-8">Create an account to verify your .edu status and start helping peers secure their belongings.</p>

                    <ul className="space-y-4">
                        {[
                            'Exclusive to .edu community',
                            'Post unlimited lost items',
                            'Help fellow students recover items',
                            'No personal info shared publicly'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-lg font-medium">
                                <CheckCircle className="text-[#10b981] bg-white rounded-full p-0.5" size={24} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="z-10 text-sm opacity-70">
                    Already have an account? <Link href="/sign-in" className="underline hover:text-white">Sign In</Link>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
            </div>

            {/* Right Side (Clerk Auth) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="lg:hidden text-center mb-8">
                        <Shield className="mx-auto text-[#2563eb] mb-2" size={40} />
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                    </div>

                    <SignUp
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-[#2563eb] hover:bg-blue-700 text-sm normal-case',
                                card: 'shadow-xl border border-gray-100 rounded-2xl',
                                rootBox: 'w-full',
                            }
                        }}
                    />

                    <p className="text-center text-gray-400 text-xs mt-6">
                        By joining, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
