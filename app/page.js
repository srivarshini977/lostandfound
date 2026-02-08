import Link from 'next/link';
import { Shield, Lock, Bell, Search, ArrowRight, CheckCircle } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Navbar Overlay */}
      <nav className="absolute w-full z-10 p-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="text-2xl font-bold text-[#2563eb] flex items-center gap-2">
          <Shield size={28} /> CampusFind
        </div>
        <div className="flex items-center gap-6">
          <Link href="/feed" className="text-gray-600 hover:text-[#2563eb] font-medium hidden sm:block">Browse Items</Link>
          <SignedIn>
            <Link href="/dashboard" className="text-gray-600 hover:text-[#2563eb] font-medium hidden sm:block">Dashboard</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="text-gray-600 hover:text-[#2563eb] font-medium">Log In</Link>
            <Link href="/sign-up" className="btn-primary py-2 px-5 text-sm">Sign Up</Link>
          </SignedOut>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Column */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2563eb] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Shield size={16} /> 100% Secure & Private
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                Reconnect <span className="text-[#2563eb]">Lost Items</span> on Campus.
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
                The secure, private platform exclusively for the .edu community. Find what you lost, or help a peer out.
              </p>

              <ul className="space-y-3 mb-10 text-gray-600">
                {['.edu email verification required', 'Private communication channels', 'Instant email alerts', 'Supported by Campus Security'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[#10b981]" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up" className="btn-primary text-center">
                  Get Started
                </Link>
                <Link href="/feed" className="btn-secondary text-center">
                  Browse Lost Items
                </Link>
              </div>
            </div>

            {/* Right Column (Visual) */}
            <div className="relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl -z-10 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-100 rounded-full blur-3xl -z-10 opacity-50"></div>

              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-md mx-auto relative transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Mock Item Card */}
                <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-400">Item Image</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900">MacBook Pro Charger</h3>
                  <span className="bg-blue-50 text-[#2563eb] text-xs px-2 py-1 rounded-full">Electronics</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Found in the library 2nd floor study area...</p>
                <button className="w-full bg-[#2563eb] text-white py-2 rounded-lg font-medium text-sm">
                  Alert Owner
                </button>

                {/* Floating Success Badge */}
                <div className="absolute -right-8 top-12 bg-white p-3 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3 animate-bounce-slow">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Bell size={16} className="text-[#10b981]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Owner Notified!</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#f0f9ff] py-16 border-y border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { label: 'Items Reconnected', value: '1,234+' },
              { label: 'Campuses Supported', value: '50+' },
              { label: 'Avg. Response Time', value: '< 24 hrs' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-bold text-[#2563eb] mb-2">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Simple, secure, and effective. We handle the privacy layer so you can focus on getting your stuff back.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Search, title: 'Report Lost Item', desc: 'Post details about what you lost and where. Securely verify your .edu identity.' },
              { icon: Shield, title: 'Community Finds It', desc: 'Secure community members search the database when they find an item.' },
              { icon: Bell, title: 'Get Alerted Privately', desc: 'Receive an instant email with the finder’s details without exposing yours publicly.' },
            ].map((feature, i) => (
              <div key={i} className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-[#2563eb]">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#111827] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to find your lost items?</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Join thousands of students and faculty using CampusFind to secure their belongings.</p>
          <Link href="/sign-up" className="inline-block bg-[#2563eb] hover:bg-blue-600 text-white font-bold py-4 px-10 rounded-full transition-all hover:scale-105">
            Sign Up Free
          </Link>
        </div>
      </section>
    </div>
  );
}
