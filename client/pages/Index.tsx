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
    <div className="min-h-screen bg-white sm:bg-gray-50 text-text-primary">
      {/* Mobile status bar */}
      <div className="md:hidden flex justify-between items-center px-5 py-3 h-11">
        <div className="flex items-center">
          <span className="text-black font-bold text-[15px] font-['Plus_Jakarta_Sans'] tracking-[-0.3px]">
            11:45
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <svg
            width="17"
            height="11"
            viewBox="0 0 18 12"
            fill="none"
            className="fill-black"
          >
            <path d="M2.60858 7.33368C3.16823 7.33368 3.62225 7.78139 3.62225 8.33368V10.3337C3.62208 10.8858 3.16812 11.3337 2.60858 11.3337H1.59589C1.03635 11.3337 0.582393 10.8858 0.582214 10.3337V8.33368C0.582214 7.78139 1.03624 7.33368 1.59589 7.33368H2.60858ZM7.33807 5.33368C7.89758 5.33384 8.35077 5.78149 8.35077 6.33368V10.3337C8.35059 10.8857 7.89747 11.3335 7.33807 11.3337H6.3244C5.76488 11.3337 5.31091 10.8858 5.31073 10.3337V6.33368C5.31073 5.7814 5.76477 5.3337 6.3244 5.33368H7.33807ZM12.0666 2.99969C12.6261 2.99969 13.0801 3.44756 13.0803 3.99969V10.3337C13.0801 10.8858 12.6261 11.3337 12.0666 11.3337H11.0529C10.4936 11.3335 10.0404 10.8857 10.0402 10.3337V3.99969C10.0404 3.44769 10.4936 2.99991 11.0529 2.99969H12.0666ZM16.7951 0.666687C17.3547 0.666687 17.8088 1.1144 17.8088 1.66669V10.3337C17.8086 10.8858 17.3546 11.3337 16.7951 11.3337H15.7824C15.2229 11.3337 14.7689 10.8858 14.7687 10.3337V1.66669C14.7687 1.1144 15.2228 0.666687 15.7824 0.666687H16.7951Z" />
          </svg>
          <svg
            width="15"
            height="11"
            viewBox="0 0 17 12"
            fill="none"
            className="fill-black"
          >
            <path d="M6.40201 8.73108C7.69458 7.65219 9.58795 7.65219 10.8805 8.73108C10.9455 8.78911 10.9832 8.87115 10.985 8.95764C10.9868 9.04405 10.9528 9.12755 10.8903 9.18811L8.86588 11.2037C8.80655 11.2629 8.72562 11.2965 8.64127 11.2965C8.55691 11.2965 8.47596 11.2629 8.41666 11.2037L6.39224 9.18811C6.32981 9.12751 6.29572 9.04404 6.29752 8.95764C6.29937 8.87122 6.33704 8.78906 6.40201 8.73108ZM3.70181 6.04163C6.48658 3.4857 10.7989 3.48561 13.5836 6.04163C13.6464 6.10148 13.6823 6.18402 13.6833 6.27014C13.6841 6.35631 13.65 6.43944 13.5885 6.50061L12.4186 7.6676C12.298 7.78674 12.1028 7.78944 11.9792 7.67346C11.0647 6.85628 9.87497 6.40386 8.64127 6.40393C7.4085 6.40447 6.22014 6.85693 5.3063 7.67346C5.18262 7.78944 4.98743 7.78672 4.86685 7.6676L3.69693 6.50061C3.63534 6.43953 3.60138 6.35632 3.6022 6.27014C3.60315 6.18402 3.63902 6.10146 3.70181 6.04163ZM1.00064 3.35999C5.27194 -0.679329 12.0107 -0.679455 16.2819 3.35999C16.3437 3.41993 16.378 3.50204 16.3786 3.58752C16.3791 3.6731 16.345 3.75532 16.2838 3.81604L15.1129 4.98303C14.9923 5.10275 14.796 5.10384 14.6735 4.98596C13.0462 3.45937 10.8865 2.60813 8.64127 2.60803C6.39568 2.60806 4.23559 3.45912 2.60806 4.98596C2.48565 5.10396 2.29022 5.10276 2.16959 4.98303L0.997711 3.81604C0.936674 3.75528 0.902414 3.67308 0.902985 3.58752C0.903609 3.50202 0.938816 3.41991 1.00064 3.35999Z" />
          </svg>
          <svg width="25" height="11" viewBox="0 0 26 12" fill="none">
            <path
              opacity="0.35"
              d="M3.147 0.833313H20.107C21.3035 0.833466 22.273 1.80378 22.273 3.00031V9.00031C22.2728 10.1967 21.3033 11.1662 20.107 11.1663H3.147C1.95049 11.1663 0.980186 10.1968 0.980011 9.00031V3.00031C0.980011 1.80369 1.95039 0.833313 3.147 0.833313Z"
              stroke="black"
            />
            <path
              opacity="0.4"
              d="M23.7867 4V8C24.6021 7.66122 25.1324 6.87313 25.1324 6C25.1324 5.12687 24.6021 4.33878 23.7867 4Z"
              fill="black"
            />
            <path
              d="M2.50665 3.66665C2.50665 2.93027 3.10361 2.33331 3.83999 2.33331H19.4133C20.1497 2.33331 20.7467 2.93027 20.7467 3.66665V8.33331C20.7467 9.06969 20.1497 9.66665 19.4133 9.66665H3.83998C3.10361 9.66665 2.50665 9.06969 2.50665 8.33331V3.66665Z"
              fill="black"
            />
          </svg>
        </div>
      </div>

      {/* Responsive layout */}
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-8 md:py-16 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left hero (desktop/tablet) */}
        <div className="hidden md:block relative">
          <div className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-gradient-to-r from-primary-blue to-secondary-blue opacity-20 blur-3xl" />
          <h1 className="relative z-10 font-['Poppins'] text-4xl lg:text-5xl font-semibold leading-tight text-text-primary">
            Selamat Datang!
          </h1>
          <p className="relative z-10 mt-3 text-base text-text-primary/80 font-['Poppins']">
            Masuk untuk melanjutkan ke dashboard Anda.
          </p>
        </div>

        {/* Form card */}
        <div className="md:bg-white md:shadow-xl md:rounded-2xl md:p-8 md:py-10 md:border border-border-gray md:max-w-lg md:justify-self-end w-full">
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
              "w-full h-[50px] rounded-full text-white text-[14px] md:text-base font-semibold font-['Poppins'] mb-8 transition-opacity",
              "bg-login-gradient opacity-90 hover:opacity-100",
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
            className="w-full h-[50px] flex items-center justify-center space-x-3 border-[1.5px] border-text-secondary rounded-lg bg-white hover:bg-gray-50 transition-colors"
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

          {/* Home indicator - mobile only */}
          <div className="md:hidden flex justify-center py-4">
            <div className="w-32 h-2 bg-black opacity-60 rounded-[15px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
