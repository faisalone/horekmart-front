'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'
import { AuthFormSkeleton, IdentifierDisplaySkeleton, LoadingOverlay } from '@/components/ui/skeleton'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useOtpTimer } from '@/hooks/useOtpTimer'
import { calculateRemainingSeconds } from '@/utils/time-helpers'
import { 
  getSessionItem, 
  setSessionItem, 
  removeSessionItem, 
  getAuthMethods, 
  setAuthMethods,
  clearAuthSession,
  AUTH_SESSION_KEYS 
} from '@/utils/session-storage'

function AdminVerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithPasswordNew, loginWithOtpNew, resendOtp, verifyRegistration, isAuthenticated } = useAdminAuth()
  
  const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '')
  const [type, setType] = useState<'email' | 'phone'>((searchParams.get('type') as 'email' | 'phone') || 'email')
  
  // Helper booleans (filled later)
  const [hasPassword, setHasPassword] = useState(false)
  const [hasOtp, setHasOtp] = useState(false)

  // Pick initial method - avoid sessionStorage during SSR
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>(() => {
    const urlParam = searchParams.get('auth_method') as 'password' | 'otp' | null
    if (urlParam) return urlParam
    
    // Use safe session storage getter
    const storedPref = getSessionItem(AUTH_SESSION_KEYS.INITIAL_AUTH_METHOD) as 'password' | 'otp' | null
    if (storedPref) return storedPref
    
    return 'otp' // Default to OTP, will be updated from server response
  })
  const [from] = useState(searchParams.get('from') || 'login')
  
  // Get auth methods from sessionStorage
  const [authMethods, setAuthMethods] = useState<string[]>([])
  
  // Get expiry time from sessionStorage instead of URL
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [passwordAttempts, setPasswordAttempts] = useState(0)

  // Loading states for better UX
  const [isInitializing, setIsInitializing] = useState(true) // For initial page load
  const [isSwitchingMethod, setIsSwitchingMethod] = useState(false) // For method switching
  const [isResendingOtp, setIsResendingOtp] = useState(false) // For OTP resend

  // OTP Timer - start with 0, will be set by useEffect when expiresAt loads
  const { timeLeft, isExpired, formattedTime, restart } = useOtpTimer({
    initialTime: 0,
    onExpired: () => {
      setOtpError('Verification code expired. Please request a new one.')
    }
  })

  // Load data from storage - client-side only
  useEffect(() => {
    const loadSessionData = async () => {
      const storedMethods = getAuthMethods()
      const storedExpiresAt = getSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT)
      const storedInitialMethod = getSessionItem(AUTH_SESSION_KEYS.INITIAL_AUTH_METHOD)
      
      console.log('Loading from sessionStorage:', { storedExpiresAt, storedMethods, storedInitialMethod })
      
      if (storedExpiresAt) {
        setExpiresAt(storedExpiresAt)
      }
      
      if (storedMethods.length > 0) {
        setAuthMethods(storedMethods)
        setHasPassword(storedMethods.includes('password'))
        setHasOtp(storedMethods.includes('otp'))

        // IMPORTANT: Use server's preference, not client preference
        let serverPreferredMethod: 'password' | 'otp' = 'otp'
        
        // First check URL parameter (highest priority)
        if (searchParams.get('auth_method')) {
          serverPreferredMethod = searchParams.get('auth_method') as 'password' | 'otp'
        } 
        // Then check what server recommended (stored initial method from /lookup response)
        else if (storedInitialMethod) {
          serverPreferredMethod = storedInitialMethod as 'password' | 'otp'
        }
        // Fallback to first available method
        else if (storedMethods.length > 0) {
          serverPreferredMethod = storedMethods[0] as 'password' | 'otp'
        }
        
        console.log('Setting auth method based on server:', serverPreferredMethod)
        setAuthMethod(serverPreferredMethod)
      }

      // Add small delay to prevent flash, then mark as initialized
      setTimeout(() => {
        setIsInitializing(false)
      }, 300)
    }

    loadSessionData()
  }, [searchParams])

  // Calculate initial time and restart timer when expiresAt changes
  useEffect(() => {
    if (expiresAt && authMethod === 'otp') {
      const remainingSeconds = calculateRemainingSeconds(expiresAt)
      
      console.log('Timer restart calculation:', {
        expiresAt,
        remainingSeconds,
        isExpired: remainingSeconds === 0
      })
      
      if (remainingSeconds > 0) {
        restart(remainingSeconds)
        setOtpError('') // Clear any expiry errors if timer is valid
      } else {
        restart(0) // Ensure timer shows as expired
        setOtpError('Verification code expired. Please request a new one.')
      }
    }
  }, [expiresAt, authMethod, restart])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Cleanup sessionStorage when component unmounts or navigation occurs
  useEffect(() => {
    const cleanup = () => {
      // Only cleanup if user is authenticated or navigation away from auth flow
      if (isAuthenticated) {
        clearAuthSession()
      }
    }

    // Cleanup on auth success
    cleanup()

    return () => {
      // Don't auto-cleanup on unmount unless authenticated
      // This allows page refresh to work properly
      if (isAuthenticated) {
        clearAuthSession()
      }
    }
  }, [isAuthenticated])

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
      removeSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT)
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
      removeSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT)
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
    setIsLoading(true)
    setIsResendingOtp(true)
    
    try {
      const result = await resendOtp(identifier, type)
      setOtpError('')
      setOtp('') // Clear existing OTP input
      
      // Update session storage and restart timer with new expiry time
      if (result.expires_at) {
        setSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT, result.expires_at)
        setExpiresAt(result.expires_at)
        
        // Calculate remaining time using utility function
        const remainingSeconds = calculateRemainingSeconds(result.expires_at)
        restart(remainingSeconds > 0 ? remainingSeconds : 600) // Fallback to 10 minutes
      } else {
        // Fallback timer if no expires_at from server
        restart(600) // 10 minutes
      }
    } catch (error: any) {
      console.error('Failed to resend OTP:', error)
      setOtpError('Failed to send verification code. Please try again.')
    } finally {
      setIsLoading(false)
      setIsResendingOtp(false)
    }
  }

  // ---- SWITCH HANDLERS ----
  const handleSwitchToOtp = async () => {
    if (!hasOtp || authMethod === 'otp') return
    
    setIsSwitchingMethod(true)
    setAuthMethod('otp')
    setPasswordError('')
    
    // Check if we have a valid (non-expired) OTP already
    const storedExpiresAt = getSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT)
    
    if (storedExpiresAt) {
      const remainingSeconds = calculateRemainingSeconds(storedExpiresAt)
      
      if (remainingSeconds > 0) {
        // OTP is still valid, just switch to OTP mode and restart timer
        console.log('Using existing valid OTP, remaining time:', remainingSeconds)
        restart(remainingSeconds)
        setOtpError('') // Clear any errors
        
        // Add delay for smooth transition
        setTimeout(() => {
          setIsSwitchingMethod(false)
        }, 300)
        return
      }
    }
    
    // OTP is expired or doesn't exist, but don't send automatically
    // Just switch to OTP mode and let user click "Send new code" if needed
    console.log('No valid OTP found, switching to OTP mode without sending')
    setOtpError('Verification code expired. Please request a new one.')
    
    // Add delay for smooth transition
    setTimeout(() => {
      setIsSwitchingMethod(false)
    }, 300)
  }

  const handleSwitchToPassword = () => {
    if (!hasPassword || authMethod === 'password') return
    
    setIsSwitchingMethod(true)
    setAuthMethod('password')
    setOtpError('')
    
    // Add delay for smooth transition
    setTimeout(() => {
      setIsSwitchingMethod(false)
    }, 300)
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
    // Navigate back to the appropriate page based on where user came from
    const targetPage = from === 'register' ? 'register' : 'login'
    router.push(`/${targetPage}?identifier=${encodeURIComponent(identifier)}`)
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
    // Block submission only if we know the OTP is expired (timeLeft === 0 and we have expiresAt)
    return otp && otp.length === 6 && !isLoading && (timeLeft > 0 || !expiresAt)
  }

  // Show loading state for initial load or when switching methods
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-5xl bg-gray-900 text-white rounded-3xl shadow-2xl border-0 relative">
        {/* Loading overlay for method switching */}
        <LoadingOverlay isVisible={isSwitchingMethod || isResendingOtp} />
        
        <LogoHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {/* Left Column - Welcome Text */}
          <div className="p-8 flex flex-col justify-center space-y-3">
            <div className="text-left">
              {isInitializing ? (
                <div className="space-y-4">
                  <div className="animate-pulse bg-gray-700 h-10 w-48 rounded"></div>
                  <div className="space-y-2">
                    <div className="animate-pulse bg-gray-700 h-4 w-full rounded"></div>
                    <div className="animate-pulse bg-gray-700 h-4 w-4/5 rounded"></div>
                    <div className="animate-pulse bg-gray-700 h-4 w-3/4 rounded"></div>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-bold mb-4">
                    {getTitle()}
                  </h1>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {getDescription()}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-8 flex flex-col justify-center h-full">
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              {/* Email/Phone display */}
              {isInitializing ? (
                <IdentifierDisplaySkeleton />
              ) : (
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
              )}
              
              {/* Form inputs */}
              {isInitializing ? (
                <AuthFormSkeleton />
              ) : (
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
                      disabled={isLoading || isSwitchingMethod}
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
                      disabled={isLoading || isSwitchingMethod}
                    />
                  )}
                  
                  <div className="flex justify-between items-center">
                    {/* Left side: Timer or Resend button */}
                    <div className="text-sm">
                      {authMethod === 'otp' && (
                        <>
                          {timeLeft > 0 && formattedTime ? (
                            <div className="text-gray-400">
                              <span>{formattedTime}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendOtp}
                              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                              disabled={isLoading || isSwitchingMethod || isResendingOtp}
                            >
                              {isResendingOtp ? (
                                <span className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-400"></div>
                                  <span>Sending...</span>
                                </span>
                              ) : (
                                'Send new code'
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Right side: Switch method buttons */}
                    <div className="text-right">
                      {authMethod === 'password' && hasOtp && (
                        <button
                          type="button"
                          onClick={handleSwitchToOtp}
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                          disabled={isLoading || isSwitchingMethod}
                        >
                          {isSwitchingMethod ? 'Switching...' : 'Use verification code instead'}
                        </button>
                      )}
                      
                      {authMethod === 'otp' && hasPassword && (
                        <button
                          type="button"
                          onClick={handleSwitchToPassword}
                          className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors block"
                          disabled={isLoading || isSwitchingMethod}
                        >
                          {isSwitchingMethod ? 'Switching...' : 'Login with password'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isInitializing && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {authMethod === 'password' 
                      ? 'Enter your password to continue.'
                      : `We sent a verification code to your ${type}. Check your messages and enter the code here.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        {!isInitializing && (
          <div className="px-8 pb-6">
            <div className="flex items-center justify-end space-x-6">
              <button 
                onClick={handleEmailClick}
                className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                disabled={isLoading || isSwitchingMethod}
              >
                Back
              </button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid() || isSwitchingMethod}
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
        )}
      </div>
    </div>
  )
}

export default function AdminVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AdminVerifyPageContent />
    </Suspense>
  )
}