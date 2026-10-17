"use client";

import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "@/utils/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, Sparkles, KeyRound } from "lucide-react";
import { COLLEGE_DOMAIN } from "@/utils/constants";

type AuthMode = "signup" | "login" | "otp";

export function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, login, verifyOTP } = useAuth();
  const { showToast } = useToast();

  const initialMode = (searchParams.get("mode") as AuthMode) || "signup";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (e: string) => {
    if (!e) return "Campus email is required";
    if (!e.includes("@")) return "Invalid email format";
    if (!e.toLowerCase().endsWith(COLLEGE_DOMAIN.toLowerCase())) {
      return `Must end in @${COLLEGE_DOMAIN}`;
    }
    return "";
  };

  const validatePassword = (p: string) => {
    if (!p) return "Password is required";
    if (p.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (mode === "signup") {
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      if (password !== confirmPassword) setErrors({ confirmPassword: "Passwords don't match" });
      if (emailError) setErrors({ email: emailError });
      if (passwordError) setErrors({ password: passwordError });
      if (emailError || passwordError || password !== confirmPassword) return;

      setLoading(true);
      const result = await signup(email, password);
      setLoading(false);

      if (result.error) {
        setErrors({ form: result.error });
      } else {
        showToast("Account created! Enter 6-digit campus passcode (Cheat code: 123456)");
        setMode("otp");
      }
    } else if (mode === "login") {
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      if (emailError) setErrors({ email: emailError });
      if (passwordError) setErrors({ password: passwordError });
      if (emailError || passwordError) return;

      setLoading(true);
      const result = await login(email, password);
      setLoading(false);

      if (result.error) {
        setErrors({ form: result.error });
      } else {
        showToast("Welcome back to the Syndicate!");
        navigate("/dashboard");
      }
    } else if (mode === "otp") {
      if (!otp || otp.length !== 6) {
        setErrors({ otp: "Enter the 6-digit passcode" });
        return;
      }

      setLoading(true);
      const result = await verifyOTP(email, otp);
      setLoading(false);

      if (result.error) {
        setErrors({ otp: result.error });
      } else {
        showToast("Access Verified! Complete your player profile.");
        navigate("/onboarding");
      }
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setOtp("");
  };

  // Quick fill demo user
  const handleDemoFill = () => {
    setEmail("alex.m@college.edu");
    setPassword("password123");
    setConfirmPassword("password123");
  };

  return (
    <div className="min-h-screen bg-[#fefce8] pixel-pattern font-headline text-black antialiased flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 bg-brutal-yellow border-3 border-black px-4 py-2 rounded-2xl brutal-shadow hover:-rotate-2 transition-transform">
            <span className="w-8 h-8 rounded-xl bg-black text-brutal-yellow flex items-center justify-center font-display font-black text-lg">
              ⚡
            </span>
            <span className="font-display font-black text-xl tracking-tight text-black uppercase">
              SkillBridge Arcade
            </span>
          </Link>
          <div className="mt-2 text-xs font-mono font-bold text-black/60 uppercase">
            CAMPUS SYNDICATE SECURITY GATEWAY
          </div>
        </div>

        {/* Auth Bento Card */}
        <div className="bg-white rounded-3xl border-4 border-black p-6 md:p-8 brutal-shadow">
          {/* Mode Switch Tabs */}
          {mode !== "otp" && (
            <div className="flex gap-2 p-1.5 bg-[#fefce8] border-3 border-black rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className={`flex-1 py-2 rounded-xl font-display font-black text-xs uppercase transition-all ${
                  mode === "signup"
                    ? "bg-black text-white"
                    : "text-black hover:bg-black/10"
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`flex-1 py-2 rounded-xl font-display font-black text-xs uppercase transition-all ${
                  mode === "login"
                    ? "bg-black text-white"
                    : "text-black hover:bg-black/10"
                }`}
              >
                Login
              </button>
            </div>
          )}

          {errors.form && (
            <div className="mb-4 p-3 rounded-xl bg-red-100 border-2 border-black text-red-700 font-mono text-xs font-bold">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "otp" ? (
              /* OTP Passcode Step */
              <div className="space-y-4">
                <div className="text-center p-3 rounded-2xl bg-brutal-mint border-2 border-black">
                  <span className="text-2xl">🔑</span>
                  <div className="font-display font-black text-sm uppercase text-black mt-1">
                    ENTER CAMPUS PASSCODE
                  </div>
                  <p className="font-mono text-xs text-black/70 mt-1">
                    Enter the 6-digit verification code. (Cheat Code: <strong className="text-black bg-white px-1.5 py-0.5 rounded border border-black">123456</strong>)
                  </p>
                </div>

                <div>
                  <label className="block font-mono font-black text-xs uppercase text-black mb-1.5">
                    6-Digit Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-center text-2xl tracking-widest font-black text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                  />
                  {errors.otp && (
                    <p className="text-red-600 font-mono text-xs font-bold mt-1 text-center">{errors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="brutal-btn w-full bg-brutal-yellow hover:bg-brutal-yellow-dark border-3 border-black font-display font-black text-sm uppercase py-3.5 rounded-2xl flex items-center justify-center gap-2"
                >
                  <span>{loading ? "VERIFYING PASSCODE..." : "CONFIRM & ENTER SYNDICATE"}</span>
                  <Sparkles className="w-4 h-4 text-black" />
                </button>
              </div>
            ) : (
              /* Signup & Login Fields */
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono font-black text-xs uppercase text-black">
                      Campus Email Address:
                    </label>
                    <span className="font-mono font-bold text-[10px] text-black/60">
                      @{COLLEGE_DOMAIN} ONLY
                    </span>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={`alex.m@${COLLEGE_DOMAIN}`}
                    className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                  />
                  {errors.email && (
                    <p className="text-red-600 font-mono text-xs font-bold mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block font-mono font-black text-xs uppercase text-black mb-1">
                    Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 font-mono text-xs font-bold mt-1">{errors.password}</p>
                  )}
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="block font-mono font-black text-xs uppercase text-black mb-1">
                      Confirm Password:
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-[#fffdf0] border-3 border-black rounded-2xl px-4 py-3 font-mono text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black brutal-shadow-sm"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-600 font-mono text-xs font-bold mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="brutal-btn w-full bg-brutal-yellow hover:bg-brutal-yellow-dark border-3 border-black font-display font-black text-sm uppercase py-3.5 rounded-2xl flex items-center justify-center gap-2 mt-2"
                >
                  <span>
                    {loading 
                      ? "PROCESSING..." 
                      : mode === "signup" 
                      ? "CREATE PLAYER PROFILE" 
                      : "AUTHENTICATE"}
                  </span>
                  <span className="text-base">⚡</span>
                </button>

                {/* Demo Quick-Fill Pill */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="font-mono text-xs font-bold text-black/60 hover:text-black underline"
                  >
                    ⚡ Autofill demo credentials
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}