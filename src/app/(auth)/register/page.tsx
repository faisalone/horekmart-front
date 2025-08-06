'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import FloatingInput from '@/components/ui/FloatingInput'
import LogoHeader from '@/components/ui/LogoHeader'
import { Button } from '@/components/ui/button'
import { setSessionItem, setAuthMethods, AUTH_SESSION_KEYS } from '@/utils/session-storage'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated } = useAdminAuth()
  
  // Form states
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Error states
  const [nameError, setNameError] = useState('')
  const [identifierError, setIdentifierError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // Clear errors when inputs change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (nameError && value.trim()) {
      setNameError('')
    }
  }

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIdentifier(value)
    if (identifierError && value.trim()) {
      setIdentifierError('')
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (passwordError && value) {
      setPasswordError('')
    }
  }

  const validateIdentifier = (input: string) => {
    if (!input.trim()) {
      return 'Email or phone is required'
    }
    
    // Check if input contains only digits (phone number)
    const isPhoneNumber = /^\d+$/.test(input.trim())
    
    if (isPhoneNumber) {
      // Validate phone number (at least 10 digits)
      if (input.trim().length < 10) {
        return 'Please enter a valid phone number (at least 10 digits)'
      }
    } else {
      // Validate email
      if (!/\S+@\S+\.\S+/.test(input.trim())) {
        return 'Please enter a valid email address'
      }
    }
    
    return ''
  }

  const validateForm = () => {
    let isValid = true
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required')
      isValid = false
    }
    
    // Validate identifier
    const identifierValidationError = validateIdentifier(identifier)
    if (identifierValidationError) {
      setIdentifierError(identifierValidationError)
      isValid = false
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      isValid = false
    }
    
    return isValid
  }

  const handleRegister = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const response = await register(name.trim(), identifier.trim(), password)
      
      // Store registration info and navigate to verify page
      const params = new URLSearchParams({
        identifier: response.identifier,
        type: response.type,
        from: 'register'
      })

      // Store session data for registration
      setSessionItem(AUTH_SESSION_KEYS.INITIAL_AUTH_METHOD, 'otp') // Registration always uses OTP
      setAuthMethods(['otp']) // Registration only has OTP
      if (response.expires_at) {
        setSessionItem(AUTH_SESSION_KEYS.OTP_EXPIRES_AT, response.expires_at)
      }
      
      router.push(`/verify?${params.toString()}`)
    } catch (error: any) {
      console.error('Registration failed:', error)
      
      // Handle specific API errors
      if (error?.response?.data?.message) {
        setIdentifierError(error.response.data.message)
      } else if (error?.response?.data?.errors) {
        const errors = error.response.data.errors
        if (errors.identifier) {
          setIdentifierError(errors.identifier[0])
        }
        if (errors.name) {
          setNameError(errors.name[0])
        }
        if (errors.password) {
          setPasswordError(errors.password[0])
        }
      } else if (error?.message) {
        setIdentifierError(error.message)
      } else {
        setIdentifierError('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name && identifier && password && !isLoading) {
      handleRegister()
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
      <div className="w-full max-w-5xl bg-gray-900 text-white rounded-3xl shadow-2xl border-0">
        <LogoHeader />
        
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
          {/* Left Column - Welcome Text */}
          <div className="p-8 flex flex-col justify-center space-y-3">
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-4">
                Create Account
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                Join Horekmart Admin Panel. Create your account to manage products, orders, and customers.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-8 flex flex-col justify-center h-full">
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                <FloatingInput
                  id="name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onKeyPress={handleKeyPress}
                  label="Full Name"
                  error={nameError}
                  disabled={isLoading}
                />
                
                <FloatingInput
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  onKeyPress={handleKeyPress}
                  label="Email or Phone Number"
                  error={identifierError}
                  disabled={isLoading}
                />
                
                <FloatingInput
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={handleKeyPress}
                  label="Password"
                  error={passwordError}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  We&apos;ll send a verification code to confirm your account.
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
              Already have an account?
            </Link>
            <Button 
              onClick={handleRegister}
              disabled={!name || !identifier || !password || isLoading}
              className="px-12 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
