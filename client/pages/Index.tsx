import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithGoogle, loginWithEmail } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Navigation is now handled by the MainLayout component in App.tsx
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithEmail(email, password);
      // Navigation is now handled by the MainLayout component in App.tsx
    } catch (error) {
      console.error("Email/password login failed", error);
      // Error is already handled and displayed by AuthErrorNotifier
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-text-primary">

      {/* Responsive layout */}
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-8 md:py-16 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left hero (desktop/tablet) */}
        <div className="hidden md:block relative">
          <div className="absolute -top-20 -left-16 h-80 w-80 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute top-40 -right-20 h-64 w-64 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-15 blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          <h1 className="relative z-10 font-['Poppins'] text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Selamat Datang!
          </h1>
          <p className="relative z-10 mt-4 text-lg text-gray-700 font-['Poppins']">
            Masuk untuk melanjutkan ke dashboard Anda.
          </p>
        </div>

        {/* Form card */}
        <div className="glass shadow-elegant md:shadow-elegant-hover md:rounded-3xl md:p-10 md:py-12 md:border-0 md:max-w-lg md:justify-self-end w-full">
          {/* Title (mobile) */}
          <div className="md:hidden mb-8">
            <h1 className="text-[30px] font-medium text-text-primary font-['Poppins'] mb-2">
              Selamat Datang!
            </h1>
            <p className="text-[12px] font-medium text-text-primary font-['Poppins']">
              Masuk Untuk Melanjutkan
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-[14px] md:text-sm font-medium text-text-primary font-['Poppins'] mb-2">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukan Email"
              className="w-full h-[50px] px-4 border border-border-gray rounded-lg bg-white text-[10px] md:text-sm font-medium font-['Poppins'] placeholder:text-text-placeholder focus:outline-none focus:border-primary-blue"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[14px] md:text-sm font-medium text-text-primary font-['Poppins'] mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan Kata Sandi"
                className="w-full h-[50px] px-4 pr-12 border border-border-gray rounded-lg bg-white text-[10px] md:text-sm font-medium font-['Poppins'] placeholder:text-text-placeholder focus:outline-none focus:border-primary-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-80"
              >
                {showPassword ? (
                  <Eye className="w-4 h-4 text-black" />
                ) : (
                  <EyeOff className="w-4 h-4 text-black" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="mb-6 text-right">
            <a
              href="#"
              className="text-[12px] md:text-sm font-medium font-['Poppins'] text-link-blue underline"
            >
              Lupa Kata Sandi ?
            </a>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            className={cn(
              "w-full h-[52px] rounded-full text-white text-[14px] md:text-base font-semibold font-['Poppins'] mb-8",
              "gradient-primary shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-smooth hover:scale-[1.02]",
            )}
          >
            Masuk
          </button>

          {/* Divider */}
          <div className="text-center mb-6">
            <span className="text-[14px] md:text-sm font-medium text-text-primary font-['Poppins']">
              Atau Lanjut Dengan
            </span>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-[52px] flex items-center justify-center space-x-3 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-smooth hover:border-blue-300 hover:shadow-md"
          >
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
            <span className="text-[14px] md:text-sm font-semibold text-text-secondary font-['Poppins']">
              Google
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
