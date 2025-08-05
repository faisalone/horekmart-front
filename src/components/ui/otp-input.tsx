'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({ length, value, onChange, disabled, className }: OtpInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const newValues = value.split('').slice(0, length);
    while (newValues.length < length) {
      newValues.push('');
    }
    setValues(newValues);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;
    
    // Only allow digits
    if (!/^\d*$/.test(digit)) return;

    const newValues = [...values];
    newValues[index] = digit.slice(-1); // Only take the last digit
    setValues(newValues);
    onChange(newValues.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace' && !values[index] && index > 0) {
      // Focus previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    const newValues = pastedData.split('').slice(0, length);
    
    while (newValues.length < length) {
      newValues.push('');
    }
    
    setValues(newValues);
    onChange(newValues.join(''));
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={cn("flex gap-4 justify-center", className)}>
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-14 h-14 text-center text-xl font-bold rounded-xl border-2 border-gray-300",
            "focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none",
            "transition-all duration-200 bg-white",
            disabled && "bg-gray-50 cursor-not-allowed opacity-60",
            digit && "border-blue-500 bg-blue-50 text-blue-900 shadow-sm"
          )}
        />
      ))}
    </div>
  );
}
