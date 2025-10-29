import type { ReactNode } from 'react';
import LogoImg from '../assets/images/unnamed.png';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
      <div className="min-h-screen bg-linear-to-br from-[#00A651] to-[#008F45] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={LogoImg} alt="Credit Jambo" className="mx-auto h-16 md:h-20 lg:h-24 w-auto" />
          <p className="text-white/90 text-sm mt-2">Digital Credit & Savings Platform</p>
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

