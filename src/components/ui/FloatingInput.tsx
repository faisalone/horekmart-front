import React, { useState } from 'react'

interface FloatingInputProps {
  id: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  label: string
  className?: string
  error?: string
  [key: string]: any
}

export default function FloatingInput({ 
  id, 
  type, 
  value, 
  onChange, 
  label, 
  className = '', 
  error,
  ...props 
}: FloatingInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const hasError = !!error
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  return (
    <div className="relative">
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        className={`w-full h-12 px-4 py-3 text-base bg-transparent border rounded-full text-white focus:ring-1 focus:outline-none peer ${
          isPassword ? 'pr-12' : ''
        } ${
          hasError 
            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
            : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500/50'
        } ${className}`}
        placeholder=" "
        {...props}
      />
      
      {/* Password visibility toggle */}
      {isPassword && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1"
          tabIndex={-1}
        >
          {showPassword ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      )}
      
      <label
        htmlFor={id}
        className={`absolute left-4 -top-2 text-xs px-2 transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:-top-2 peer-focus:text-xs peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:px-2 ${
          hasError 
            ? 'text-red-400 bg-gray-900 peer-focus:text-red-400 peer-focus:bg-gray-900 peer-[:not(:placeholder-shown)]:text-red-400 peer-[:not(:placeholder-shown)]:bg-gray-900' 
            : 'text-gray-400 bg-gray-900 peer-focus:text-blue-400 peer-focus:bg-gray-900 peer-[:not(:placeholder-shown)]:text-blue-400 peer-[:not(:placeholder-shown)]:bg-gray-900'
        } peer-placeholder-shown:text-gray-400`}
      >
        {label}
      </label>
      {hasError && (
        <p className="text-red-400 text-sm mt-1 ml-4">
          {error}
        </p>
      )}
    </div>
  )
}
