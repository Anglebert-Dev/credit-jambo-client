import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
      <div className="min-h-screen bg-linear-to-br from-[#00A651] to-[#008F45] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-white">CREDIT</span>
            <span className="text-black">JAMBO</span>
          </h1>
          <p className="text-white/90 text-sm">Digital Credit & Savings Platform</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-8">
          {children}
        </div>

        <div className="text-center mt-6">
          <p className="text-white/80 text-xs">
            © {new Date().getFullYear()} Credit Jambo Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

