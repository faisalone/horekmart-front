'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'

export default function AdminVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('identifier') || '')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  
  // Determine the mode based on URL params
  const from = searchParams.get('from') // 'login' or 'register'
  const isLoginMode = from === 'login'
  const isRegisterMode = from === 'register'

  useEffect(() => {
    // Redirect to login if no identifier is provided
    if (!email) {
      router.push('/admin/login')
    }
  }, [email, router])

  const handleNext = () => {
    if (isLoginMode && password) {
      // Simulate login
      setTimeout(() => router.push('/admin/dashboard'), 500)
    } else if (isRegisterMode && otp) {
      // Simulate registration completion
      setTimeout(() => router.push('/admin/dashboard'), 500)
    }
  }

  const handleEmailClick = () => {
    // Go back to login/register with the contact
    if (isLoginMode) {
      router.push(`/admin/login?identifier=${encodeURIComponent(email)}`)
    } else {
      router.push(`/admin/register?identifier=${encodeURIComponent(email)}`)
    }
  }

  const getTitle = () => {
    if (isLoginMode) return 'Welcome'
    if (isRegisterMode) return 'Verify Account'
    return 'Verify'
  }

  const getDescription = () => {
    if (isLoginMode) return 'Enter your password to complete login'
    if (isRegisterMode) return 'Enter the verification code sent to your email'
    return 'Verify your account'
  }

  const getInputLabel = () => {
    if (isLoginMode) return 'Password'
    if (isRegisterMode) return 'Enter Verification Code'
    return 'Code'
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
                {getTitle()}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                {getDescription()}
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-8 flex flex-col justify-center h-full">
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {/* Email dropdown */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <div 
                    onClick={handleEmailClick}
                    className="w-full h-12 px-4 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-300">{email}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {isLoginMode ? (
                  <FloatingInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label={getInputLabel()}
                  />
                ) : (
                  <FloatingInput
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    label={getInputLabel()}
                    className="text-center tracking-widest"
                    maxLength={6}
                  />
                )}
                
                <div className="flex justify-end">
                  <Link 
                    href="/admin/forgot" 
                    className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                  >
                    {isLoginMode ? 'Forgot password?' : 'Resend code'}
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {isLoginMode 
                    ? 'Your account is protected with secure authentication.'
                    : 'Didn\'t receive the code? Check your spam folder or request a new one.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-end space-x-6">
            <button 
              onClick={handleEmailClick}
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Back
            </button>
            <Button 
              onClick={handleNext}
              disabled={isLoginMode ? !password : !otp}
              className="px-12 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            >
              {isLoginMode ? 'Sign in' : 'Verify'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
