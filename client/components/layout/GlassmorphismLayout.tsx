
import React from 'react';

const GlassmorphismLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-50">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Animated gradient orbs for depth */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 opacity-25 blur-[120px] animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-r from-indigo-400 to-cyan-400 opacity-20 blur-[100px] animate-pulse" style={{animationDelay: '1s'}} />
        
        {/* Floating glass elements for extra depth */}
        <div className="absolute top-32 right-1/4 h-32 w-32 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 animate-float" />
        <div className="absolute bottom-40 left-1/4 h-24 w-24 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 animate-float" style={{animationDelay: '1.5s'}} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default GlassmorphismLayout;
