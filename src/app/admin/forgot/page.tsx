'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'
import ProgressBar from '@/components/ui/ProgressBar'

export default function AdminForgotPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: new password
  const [progress, setProgress] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')

  const handleNext = () => {
    if (step === 1 && email) {
      setStep(2)
      // Animate progress bar
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 2
        setProgress(currentProgress)
        if (currentProgress >= 100) {
          clearInterval(interval)
        }
      }, 20)
    } else if (step === 2 && otp) {
      setStep(3)
    } else if (step === 3 && password) {
      // Simulate password reset
      setTimeout(() => router.push('/admin/login'), 500)
    }
  }

  const getTitle = () => {
    switch (step) {
      case 1: return 'Reset Password'
      case 2: return 'Verify Reset'  
      case 3: return 'New Password'
      default: return 'Reset Password'
    }
  }

  const getDescription = () => {
    switch (step) {
      case 1: return 'Enter your email address and we\'ll send you a reset code.'
      case 2: return 'Enter the reset code sent to your email address.'
      case 3: return 'Create a new password for your account.'
      default: return 'Reset your password'
    }
  }

  const getButtonText = () => {
    switch (step) {
      case 1: return 'Send Code'
      case 2: return 'Verify'
      case 3: return 'Reset Password'
      default: return 'Next'
    }
  }

  const isFormValid = () => {
    switch (step) {
      case 1: return email
      case 2: return otp
      case 3: return password
      default: return false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <ProgressBar progress={progress} show={step === 2} />
      
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
              <div className="space-y-4">
                {step === 1 && (
                  <FloatingInput
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    label="Email or phone"
                  />
                )}
                
                {step === 2 && (
                  <FloatingInput
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    label="Enter Reset Code"
                    className="text-center tracking-widest"
                    maxLength={6}
                  />
                )}
                
                {step === 3 && (
                  <FloatingInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="New Password"
                  />
                )}
                
                <div className="flex justify-end">
                  <button className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                    {step === 2 ? 'Resend Code' : 'Need help?'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step !== 1 
                    ? 'Didn\'t receive the code? Check your spam folder or request a new one.'
                    : 'We\'ll send you a secure code to reset your password.'
                  }
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
              Back to login
            </Link>
            <Button 
              onClick={handleNext}
              disabled={!isFormValid()}
              className="px-12 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
