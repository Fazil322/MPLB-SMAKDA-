
import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg shadow-brand-pink-500/10 p-6 border border-brand-pink-100/50 hover:shadow-xl hover:shadow-brand-pink-500/15 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return (
    <div className={`border-b border-brand-pink-100 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return (
    <h2 className={`text-xl font-bold text-gray-800 ${className}`}>
      {children}
    </h2>
  );
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};
