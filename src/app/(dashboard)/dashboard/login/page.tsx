'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import LogoHeader from '@/components/ui/LogoHeader'
import FloatingInput from '@/components/ui/FloatingInput'
import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lookup, isAuthenticated } = useAdminAuth()
  const [identifier, setIdentifier] = useState(searchParams.get('identifier') || '')
  const [identifierError, setIdentifierError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setIdentifier(value)
    
    // Clear error when user starts typing
    if (identifierError && value) {
      setIdentifierError('')
    }
  }

  const handleNext = async () => {
    const error = validateIdentifier(identifier)
    
    if (error) {
      setIdentifierError(error)
      return
    }

    setIsLoading(true)
    setIdentifierError('')

    try {
      const result = await lookup(identifier)
      
      // Navigate to verify page with all the necessary information
      const params = new URLSearchParams({
        identifier: result.identifier,
        type: result.type,
        auth_method: result.auth_method || 'otp',
        from: 'login'
      })

      // Store expiry time in sessionStorage instead of URL to avoid static time issue
      if (result.expires_at) {
        sessionStorage.setItem('otp_expires_at', result.expires_at)
      }
      
      router.push(`/verify?${params.toString()}`)
    } catch (error: any) {
      console.error('Lookup failed:', error)
      
      // Handle specific API errors more gracefully
      if (error?.response?.data?.message) {
        setIdentifierError(error.response.data.message)
      } else if (error?.response?.data?.errors?.identifier) {
        setIdentifierError(error.response.data.errors.identifier[0])
      } else if (error?.message) {
        setIdentifierError(error.message)
      } else {
        setIdentifierError('User not found. Please check your email or phone number.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && identifier && !identifierError && !isLoading) {
      handleNext()
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
          {/* Left Column - Welcome Text */}
          <div className="p-8 flex flex-col justify-center space-y-3">
            <div className="text-left">
              <h1 className="text-4xl font-bold mb-4">
                Sign in
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                with your Horekmart Account. This account will be available to other Horekmart apps in the browser.
              </p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="p-8 flex flex-col justify-center h-full">
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="space-y-4">
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
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400 leading-relaxed">
                  Enter your email address or phone number to continue.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-end space-x-6">
            <Link 
              href="/register" 
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
              Create account
            </Link>
            <Button 
              onClick={handleNext}
              disabled={!identifier || isLoading}
              className="px-12 py-2 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-full transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking...
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}