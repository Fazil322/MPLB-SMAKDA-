
import React from 'react';

// FIX: Add 'size' to ButtonProps to allow for different button sizes.
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  size?: 'sm' | 'md';
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  // FIX: Add size to destructured props with a default value.
  size = 'md',
  className,
  ...props
}) => {
  // FIX: Removed padding from baseClasses to allow dynamic sizing.
  const baseClasses = 'rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transform hover:scale-105 active:scale-95';
  
  const variantClasses = {
    primary: 'bg-brand-pink-500 text-white hover:bg-brand-pink-600 focus:ring-brand-pink-500',
    secondary: 'bg-brand-pink-100 text-brand-pink-700 hover:bg-brand-pink-200 focus:ring-brand-pink-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };

  // FIX: Added size-specific classes.
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
  };

  return (
    <button
      // FIX: Apply size class along with other classes.
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
