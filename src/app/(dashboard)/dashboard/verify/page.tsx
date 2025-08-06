'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useOtpTimer } from '@/hooks/useOtpTimer'

export default function AdminVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithPasswordNew, loginWithOtpNew, resendOtp, verifyRegistration, isAuthenticated } = useAdminAuth()
  
  const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '')
  const [type, setType] = useState<'email' | 'phone'>((searchParams.get('type') as 'email' | 'phone') || 'email')
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>((searchParams.get('auth_method') as 'password' | 'otp') || 'password')
  const [from] = useState(searchParams.get('from') || 'login')
  
  // Get expiry time from sessionStorage instead of URL
  const [expiresAt] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('otp_expires_at')
    }
    return null
  })
  
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordAttempts, setPasswordAttempts] = useState(0)
  const [canUsePassword, setCanUsePassword] = useState(authMethod === 'password')

  // Calculate initial time remaining based on expires_at from backend (memoized)
  const initialTime = useMemo(() => {
    if (expiresAt) {
      try {
        // Handle ISO 8601 format: "2025-08-05T14:55:33.000000Z"
        const expiryTime = new Date(expiresAt).getTime()
        const currentTime = new Date().getTime()
        const remainingSeconds = Math.floor((expiryTime - currentTime) / 1000)
        
        console.log('OTP Expiry calculation:', {
          expiresAt,
          expiryTime: new Date(expiresAt).toISOString(),
          currentTime: new Date().toISOString(),
          remainingSeconds
        })
        
        // Return the actual remaining seconds from server
        return Math.max(0, remainingSeconds)
      } catch (error) {
        console.error('Error parsing expires_at:', error)
        return 0 // Return 0 if there's an error parsing
      }
    }
    return 0 // Return 0 if no expiry time provided
  }, [expiresAt]) // Only recalculate if expiresAt changes

  // OTP Timer - only use server-provided time, no fallbacks
  const timerInitialTime = authMethod === 'otp' && initialTime > 0 ? initialTime : 0
  
  const { timeLeft, isExpired, formattedTime, restart } = useOtpTimer({
    initialTime: timerInitialTime,
    onExpired: () => {
      setOtpError('Verification code expired. Please request a new one.')
    }
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Clear OTP expiry from sessionStorage when authenticated
      sessionStorage.removeItem('otp_expires_at')
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Cleanup sessionStorage when component unmounts
  useEffect(() => {
    return () => {
      // Optional: Clear on unmount if needed
      // sessionStorage.removeItem('otp_expires_at')
    }
  }, [])

  // Redirect if no identifier (kept as-is)
  useEffect(() => {
    if (!identifier) {
      router.push('/login')
    }
  }, [identifier, router])

  const handlePasswordLogin = async () => {
    if (!password) {
      setPasswordError('Password is required')
      return
    }

    setIsLoading(true)
    setPasswordError('')

    try {
      await loginWithPasswordNew(identifier, type, password)
      // Clear OTP expiry from sessionStorage on successful login
      sessionStorage.removeItem('otp_expires_at')
      // Navigation is handled by the auth hook
    } catch (error: any) {
      console.error('Password login failed:', error)
      
      const attempts = passwordAttempts + 1
      setPasswordAttempts(attempts)
      
      if (error.response?.data?.errors?.password) {
        setPasswordError(error.response.data.errors.password[0])
      } else {
        setPasswordError('Invalid password. Please try again.')
      }
      
      // After 3 failed attempts, switch to OTP
      if (attempts >= 3) {
        setCanUsePassword(false)
        setAuthMethod('otp')
        setPasswordError('Too many failed attempts. Please use verification code instead.')
        
        // Send OTP automatically
        try {
          await resendOtp(identifier, type)
          restart(600) // 10 minutes
        } catch (resendError) {
          console.error('Failed to send OTP:', resendError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpLogin = async () => {
    if (!otp) {
      setOtpError('Verification code is required')
      return
    }

    if (otp.length !== 6) {
      setOtpError('Please enter a 6-digit verification code')
      return
    }

    if (isExpired) {
      setOtpError('Verification code expired. Please request a new one.')
      return
    }

    setIsLoading(true)
    setOtpError('')

    try {
      // Use different methods based on where user came from
      if (from === 'register') {
        await verifyRegistration(identifier, type, otp)
      } else {
        await loginWithOtpNew(identifier, type, otp)
      }
      // Clear OTP expiry from sessionStorage on successful login
      sessionStorage.removeItem('otp_expires_at')
      // Navigation is handled by the auth hook
    } catch (error: any) {
      console.error('OTP login failed:', error)
      
      if (error.response?.data?.errors?.otp) {
        setOtpError(error.response.data.errors.otp[0])
      } else {
        setOtpError('Invalid verification code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const result = await resendOtp(identifier, type)
      setOtpError('')
      
      // Only restart timer if server provides expiry time
      if (result.expires_at) {
        sessionStorage.setItem('otp_expires_at', result.expires_at)
        
        // Calculate remaining time from the server expiry time
        try {
          const expiryTime = new Date(result.expires_at).getTime()
          const currentTime = new Date().getTime()
          const remainingSeconds = Math.floor((expiryTime - currentTime) / 1000)
          const actualTime = Math.max(0, remainingSeconds)
          
          restart(actualTime)
        } catch (error) {
          console.error('Error parsing new expires_at:', error)
          // Don't restart timer if can't parse - let it show expired/no timer
        }
      }
      // Don't restart timer if no expires_at from server
    } catch (error: any) {
      console.error('Failed to resend OTP:', error)
      setOtpError('Failed to send verification code. Please try again.')
    }
  }

  const handleSwitchToOtp = async () => {
    setAuthMethod('otp')
    setPasswordError('')
    
    try {
      const result = await resendOtp(identifier, type)
      
      // Only restart timer if server provides expiry time
      if (result.expires_at) {
        sessionStorage.setItem('otp_expires_at', result.expires_at)
        
        try {
          const expiryTime = new Date(result.expires_at).getTime()
          const currentTime = new Date().getTime()
          const remainingSeconds = Math.floor((expiryTime - currentTime) / 1000)
          const actualTime = Math.max(0, remainingSeconds)
          
          restart(actualTime)
        } catch (error) {
          console.error('Error parsing switch OTP expires_at:', error)
          // Don't restart timer if can't parse
        }
      }
      // Don't restart timer if no expires_at from server
    } catch (error) {
      console.error('Failed to send OTP:', error)
    }
  }

  const handleSwitchToPassword = () => {
    if (canUsePassword) {
      setAuthMethod('password')
      setOtpError('')
    }
  }

  const handleSubmit = () => {
    if (authMethod === 'password') {
      handlePasswordLogin()
    } else {
      handleOtpLogin()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (authMethod === 'password' && password) {
        handlePasswordLogin()
      } else if (authMethod === 'otp' && otp) {
        handleOtpLogin()
      }
    }
  }

  const handleEmailClick = () => {
    // Go back to login with the identifier
    router.push(`/login?identifier=${encodeURIComponent(identifier)}`)
  }

  const getTitle = () => {
    if (authMethod === 'password') return 'Welcome'
    return 'Verify Account'
  }

  const getDescription = () => {
    if (authMethod === 'password') {
      return 'Enter your password to complete login'
    }
    return `Enter the verification code sent to your ${type}`
  }

  const getInputLabel = () => {
    if (authMethod === 'password') return 'Password'
    return 'Enter Verification Code'
  }

  const isFormValid = () => {
    if (authMethod === 'password') return password && !isLoading
    // For OTP: allow if code is 6 digits and not loading. 
    // Allow if: no timer was set initially (timerInitialTime === 0) OR timer hasn't expired
    return otp && otp.length === 6 && !isLoading && (timerInitialTime === 0 || !isExpired)
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
              {/* Email/Phone display */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <div 
                    onClick={handleEmailClick}
                    className="w-full h-12 px-4 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-between cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-300">{identifier}</span>
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {authMethod === 'password' ? (
                  <FloatingInput
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    label={getInputLabel()}
                    error={passwordError}
                    disabled={isLoading}
                  />
                ) : (
                  <FloatingInput
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyPress={handleKeyPress}
                    label={getInputLabel()}
                    maxLength={6}
                    error={otpError}
                    disabled={isLoading}
                  />
                )}
                
                <div className="flex justify-between items-center">
                  {authMethod === 'otp' && formattedTime && (
                    <div className="text-sm text-gray-400">
                      {isExpired ? (
                        <span className="text-red-400">Code expired</span>
                      ) : (
                        <span>{formattedTime}</span>
                      )}
                    </div>
                  )}
                  
                  <div className="text-right">
                    {authMethod === 'password' && (
                      <button
                        type="button"
                        onClick={handleSwitchToOtp}
                        className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                        disabled={isLoading}
                      >
                        Use verification code instead
                      </button>
                    )}
                    
                    {authMethod === 'otp' && (
                      <div className="space-y-2">
                        {canUsePassword && (
                          <button
                            type="button"
                            onClick={handleSwitchToPassword}
                            className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors block"
                            disabled={isLoading}
                          >
                            Use password instead
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors block"
                          disabled={isLoading || (!isExpired && timeLeft > 540)} // Allow resend after 1 minute
                        >
                          {isExpired ? 'Send new code' : 'Resend code'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  {authMethod === 'password' 
                    ? 'Enter your password to continue.'
                    : `We sent a verification code to your ${type}. Check your messages and enter the code here.`
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
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className="px-12 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {authMethod === 'password' ? 'Signing in...' : 'Verifying...'}
                </>
              ) : (
                authMethod === 'password' ? 'Sign in' : 'Verify'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
