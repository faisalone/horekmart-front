import React from 'react'

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
  const hasError = !!error
  
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full h-12 px-4 py-3 text-base bg-transparent border rounded-full text-white focus:ring-1 focus:outline-none peer ${
          hasError 
            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
            : 'border-gray-600 focus:ring-blue-500/50 focus:border-blue-500/50'
        } ${className}`}
        placeholder=" "
        {...props}
      />
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
