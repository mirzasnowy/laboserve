import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import GlassmorphismLayout from "@/components/layout/GlassmorphismLayout"; // New import

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithGoogle, loginWithEmail } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      console.error("Email/password login failed", error);
    }
  };

  return (
    <GlassmorphismLayout> {/* Wrap with GlassmorphismLayout */}
      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-8 py-8 md:py-16 grid md:grid-cols-2 gap-10 lg:gap-16 items-center min-h-screen">
        
        {/* Left hero (desktop/tablet) */}
        <div className="hidden md:block relative">
          {/* Glass card behind text for depth */}
          <div className="absolute -inset-4 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10" />
          
          <div className="relative z-10 p-8">
            <h1 className="font-['Poppins'] text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                Selamat Datang!
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-700 font-['Poppins'] backdrop-blur-sm">
              Masuk untuk melanjutkan ke dashboard Anda.
            </p>
            
            {/* Decorative elements */}
            <div className="mt-8 flex gap-2">
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              <div className="h-1 w-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <div className="h-1 w-5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full" />
            </div>
          </div>
        </div>

        {/* Enhanced Glass Form Card */}
        <div className="relative w-full md:max-w-lg md:justify-self-end">
          {/* Multiple glass layers for depth effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl" />
          <div className="absolute -inset-0.5 bg-white/40 rounded-3xl backdrop-blur-2xl" />
          
          {/* Main glass card */}
          <div className="relative bg-white/30 backdrop-blur-2xl rounded-3xl border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.15)] p-6 md:p-10 md:py-12">
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-50 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Mobile title with glass effect */}
              <div className="md:hidden mb-8">
                <div className="inline-block">
                  <h1 className="text-3xl font-bold text-gray-800 font-['Poppins'] mb-2">
                    Selamat Datang!
                  </h1>
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                </div>
                <p className="text-sm text-gray-600 font-['Poppins'] mt-3">
                  Masuk Untuk Melanjutkan
                </p>
              </div>

              {/* Email field with enhanced glass effect */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 font-['Poppins'] mb-2">
                  Email
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukan Email"
                    className="w-full h-12 px-4 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl text-sm font-medium font-['Poppins'] placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/60 transition-all duration-300 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 to-purple-400/0 group-focus-within:from-blue-400/10 group-focus-within:to-purple-400/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Password field with enhanced glass effect */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 font-['Poppins'] mb-2">
                  Kata Sandi
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukan Kata Sandi"
                    className="w-full h-12 px-4 pr-12 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl text-sm font-medium font-['Poppins'] placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white/60 transition-all duration-300 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 to-purple-400/0 group-focus-within:from-blue-400/10 group-focus-within:to-purple-400/10 pointer-events-none transition-all duration-300" />
                </div>
              </div>

              {/* Forgot password link */}
              <div className="mb-6 text-right">
                <a
                  href="#"
                  className="text-sm font-medium font-['Poppins'] text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Lupa Kata Sandi ?
                </a>
              </div>

              {/* Enhanced submit button with glass effect */}
              <button
                onClick={handleLogin}
                className="relative w-full h-12 rounded-xl overflow-hidden group mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-[1px] bg-gradient-to-r from-blue-500/90 via-indigo-500/90 to-purple-500/90 rounded-xl backdrop-blur-sm" />
                <span className="relative z-10 flex items-center justify-center h-full text-white text-base font-semibold font-['Poppins'] tracking-wide">
                  Masuk
                </span>
                <div className="absolute inset-0 rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_4px_30px_rgba(99,102,241,0.6)] transition-shadow duration-300" />
              </button>

              {/* Divider with glass effect */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/30"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm font-medium text-gray-600 font-['Poppins']">
                    Atau Lanjut Dengan
                  </span>
                </div>
              </div>

              {/* Enhanced Google button with glass effect */}
              <button
                onClick={handleGoogleLogin}
                className="relative w-full h-12 group overflow-hidden rounded-xl"
              >
                <div className="absolute inset-0 bg-white/40 backdrop-blur-md border border-white/60 rounded-xl transition-all duration-300 group-hover:bg-white/50 group-hover:border-white/70 group-hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)]" />
                <div className="relative z-10 flex items-center justify-center space-x-3 h-full">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className="shrink-0"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700 font-['Poppins']">
                    Google
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </GlassmorphismLayout>
  );
}