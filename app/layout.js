import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { Search, Menu } from 'lucide-react'
import UserSync from '@/components/UserSync'

// Typography: Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Campus Lost & Found',
  description: 'Secure, private platform for reconnecting lost items on campus.',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#2563eb',
          colorTextOnPrimaryBackground: 'white',
        }
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} antialiased font-sans`}>
          <UserSync />
          {/* We will handle specific layout headers inside page groups if needed, 
                but keeping a minimal global header helps for now */}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
