
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'
import ProgressBar from '@/components/ui/ProgressBar'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useOtpTimer } from '@/hooks/useOtpTimer'
import { calculateRemainingSeconds } from '@/utils/time-helpers'

function AdminForgotPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { forgotPassword, resetPassword, resendOtp, isAuthenticated } = useAdminAuth()
  
  const [step, setStep] = useState(1) // 1: identifier, 2: otp, 3: new password
  const [progress, setProgress] = useState(0)
  const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '')
  const [type, setType] = useState<'email' | 'phone'>('email')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordConfirmationError, setPasswordConfirmationError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // OTP Timer
  const { timeLeft, isExpired, formattedTime, restart } = useOtpTimer({
    initialTime: 600, // 10 minutes
    onExpired: () => {
      setOtpError('Reset code expired. Please request a new one.')
    }
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const validateIdentifier = (input: string) => {
    if (!input) {
      return 'Email or phone is required'
    }
    
    // Check if input contains only digits (phone number)
    const isPhoneNumber = /^\d+$/.test(input)
    
    if (isPhoneNumber) {
      // Validate phone number (at least 10 digits)
      if (input.length < 10) {
        return 'Please enter a valid phone number (at least 10 digits)'
      }
    } else {
      // Validate email
      if (!/\S+@\S+\.\S+/.test(input)) {
        return 'Please enter a valid email address'
      }
    }
    
    return ''
  }

  const validatePassword = (password: string, confirmation: string) => {
    if (!password) {
      return 'Password is required'
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (password !== confirmation) {
      return 'Passwords do not match'
    }
    return ''
  }

  const handleStep1Submit = async () => {
    const error = validateIdentifier(identifier)
    
    if (error) {
      setIdentifierError(error)
      return
    }

    setIsLoading(true)
    setIdentifierError('')

    try {
      const result = await forgotPassword(identifier)
      setType(result.type as 'email' | 'phone')
      setStep(2)
      
      // Calculate initial timer time from server response
      if (result.expires_at) {
        const remainingSeconds = calculateRemainingSeconds(result.expires_at)
        restart(remainingSeconds > 0 ? remainingSeconds : 600) // Fallback to 10 minutes
      } else {
        restart(600) // Fallback to 10 minutes
      }
      
      // Animate progress bar
      let currentProgress = 0
      const interval = setInterval(() => {
        currentProgress += 2
        setProgress(currentProgress)
        if (currentProgress >= 100) {
          clearInterval(interval)
        }
      }, 20)
    } catch (error: any) {
      console.error('Forgot password failed:', error)
      
      if (error.response?.data?.errors?.identifier) {
        setIdentifierError(error.response.data.errors.identifier[0])
      } else {
        setIdentifierError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleStep2Submit = async () => {
    if (!otp) {
      setOtpError('Reset code is required')
      return
    }

    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit reset code')
      return
    }

    if (isExpired) {
      setOtpError('Reset code expired. Please request a new one.')
      return
    }

    setStep(3)
    setOtpError('')
  }

  const handleStep3Submit = async () => {
    const passwordValidationError = validatePassword(password, passwordConfirmation)
    
    if (passwordValidationError) {
      setPasswordError(passwordValidationError)
      return
    }

    setIsLoading(true)
    setPasswordError('')

    try {
      await resetPassword(identifier, type, otp, password, passwordConfirmation)
      
      // Success! Redirect to login
      setTimeout(() => router.push('/login?identifier=' + encodeURIComponent(identifier)), 1000)
    } catch (error: any) {
      console.error('Password reset failed:', error)
      
      if (error.response?.data?.errors?.otp) {
        setOtpError(error.response.data.errors.otp[0])
        setStep(2) // Go back to OTP step
      } else if (error.response?.data?.errors?.password) {
        setPasswordError(error.response.data.errors.password[0])
      } else {
        setPasswordError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    
    try {
      const result = await resendOtp(identifier, type)
      setOtpError('')
      setOtp('') // Clear existing OTP input
      
      // Calculate timer from server response
      if (result.expires_at) {
        const remainingSeconds = calculateRemainingSeconds(result.expires_at)
        restart(remainingSeconds > 0 ? remainingSeconds : 600)
      } else {
        restart(600) // Fallback to 10 minutes
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error)
      setOtpError('Failed to send reset code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      handleStep1Submit()
    } else if (step === 2) {
      handleStep2Submit()
    } else if (step === 3) {
      handleStep3Submit()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleNext()
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
      case 1: return 'Enter your email address or phone number and we\'ll send you a reset code.'
      case 2: return `Enter the reset code sent to your ${type}.`
      case 3: return 'Create a new password for your account.'
      default: return 'Reset your password'
    }
  }

  const getButtonText = () => {
    switch (step) {
      case 1: return isLoading ? 'Sending...' : 'Send Code'
      case 2: return 'Verify'
      case 3: return isLoading ? 'Resetting...' : 'Reset Password'
      default: return 'Next'
    }
  }

  const isFormValid = () => {
    switch (step) {
      case 1: return identifier && !identifierError && !isLoading
      case 2: return otp && otp.length === 6 && !isExpired && !isLoading
      case 3: return password && passwordConfirmation && !passwordError && !isLoading
      default: return false
    }
  }

  // Show loading state to prevent flash
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyPress={handleKeyPress}
                    label="Email or phone"
                    error={identifierError}
                    disabled={isLoading}
                  />
                )}
                
                {step === 2 && (
                  <div className="space-y-4">
                    <FloatingInput
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyPress={handleKeyPress}
                      label="Enter Reset Code"
                      className="text-center tracking-widest"
                      maxLength={6}
                      error={otpError}
                      disabled={isLoading}
                    />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {isExpired ? (
                          <span className="text-red-400">Code expired</span>
                        ) : (
                          <span>Expires in {formattedTime}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        disabled={isLoading || (!isExpired && timeLeft > 540)} // Allow resend after 1 minute
                      >
                        {isExpired ? 'Send new code' : 'Resend code'}
                      </button>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-4">
                    <FloatingInput
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      label="New Password"
                      error={passwordError}
                      disabled={isLoading}
                    />
                    <FloatingInput
                      id="passwordConfirmation"
                      type="password"  
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      onKeyPress={handleKeyPress}
                      label="Confirm New Password"
                      error={passwordConfirmationError}
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step === 1 
                    ? 'We\'ll send you a secure code to reset your password.'
                    : step === 2
                    ? `We sent a reset code to your ${type}. Check your messages and enter the code here.`
                    : 'Choose a strong password that you haven\'t used before.'
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
              href="/login" 
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

export default function AdminForgotPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AdminForgotPageContent />
    </Suspense>
  )
}
