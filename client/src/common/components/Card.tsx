import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ children, padding = 'md', className = '', ...props }: CardProps) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

