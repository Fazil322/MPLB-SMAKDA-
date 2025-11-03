
import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={`w-full px-4 py-2 border border-brand-pink-200 rounded-lg focus:ring-2 focus:ring-brand-pink-500 focus:border-brand-pink-500 outline-none transition-all duration-200 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={`w-full px-4 py-2 border border-brand-pink-200 rounded-lg focus:ring-2 focus:ring-brand-pink-500 focus:border-brand-pink-500 outline-none transition-all duration-200 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';
