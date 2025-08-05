'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'

export default function AdminRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState(searchParams.get('identifier') || '')
  const [password, setPassword] = useState('')

  const handleNext = () => {
    if (fullName && email && password) {
      // Pass identifier to verify page for OTP verification
      router.push(`/admin/verify?identifier=${encodeURIComponent(email)}&from=register`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && fullName && email && password) {
      handleNext()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-5xl bg-gray-900 text-white rounded-3xl shadow-2xl border-0">
        <LogoHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {/* Left Column - Welcome Text */}
          <div className="p-8 flex flex-col justify-center space-y-3">
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-4">
                Create Account
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Join Horekmart and manage your admin account with ease.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-8 flex flex-col justify-center h-full">
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                <FloatingInput
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  label="Full Name"
                />
                
                <FloatingInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  label="Email or phone"
                />
                
                <FloatingInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  label="Password"
                />
                
                <div className="flex justify-end">
                  <Link 
                    href="/admin/login" 
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    Already have account?
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-end space-x-6">
            <Link 
              href="/admin/login" 
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Sign in instead
            </Link>
            <Button 
              onClick={handleNext}
              disabled={!fullName || !email || !password}
              className="px-12 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}