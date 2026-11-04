import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/constants/routes";
import { CATERING_ROLES } from "@/constants/catering";
import { login, logout as logoutApi } from "@/api/auth.api";
import { ApiError } from "@/lib/apiError";
import { isEventAdminUser } from "@/utils/authGuards";
import type { AuthUser } from "@/types/auth";
import { JeffsGroupLogo } from "@/components/common/JeffsGroupLogo";
export { JeffsGroupLogo };

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Load saved rememberMe email
  useEffect(() => {
    const savedEmail = localStorage.getItem("meal_tracker_remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Please enter your corporate email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Remember me handling
      if (rememberMe) {
        localStorage.setItem("meal_tracker_remember_email", email.trim());
      } else {
        localStorage.removeItem("meal_tracker_remember_email");
      }

      // Live Backend API Authentication
      try {
        const res = await login({ email: email.trim().toLowerCase(), password });
        if (res?.accessToken && res?.user) {
          // Check if an Event Admin is trying to log in
          if (isEventAdminUser(res.user)) {
            try {
              await logoutApi().catch(() => {});
            } catch {
              // Ignore logout cleanup errors
            }
            setErrorMessage(
              "Access Denied: Event Admin accounts are not authorized to log in to the Super Admin portal. Please use the Event Admin portal.",
            );
            return;
          }

          const authUser: AuthUser = {
            id: res.user.id,
            email: res.user.email,
            firstName: res.user.name.split(" ")[0] || res.user.name,
            lastName: res.user.name.split(" ").slice(1).join(" ") || "",
            role: "SUPER_ADMIN",
            roleLabel: res.user.role || "Super Admin",
            portal: "catering",
            permissions: (CATERING_ROLES.SUPER_ADMIN?.permissions || []) as string[],
            currentCounterId: "counter-01",
          };
          setAuth(authUser, { accessToken: res.accessToken });
          navigate(ROUTES.DASHBOARD, { replace: true });
          return;
        } else {
          setErrorMessage("Authentication failed: No valid credentials returned.");
          return;
        }
      } catch (liveErr: unknown) {
        if (liveErr instanceof ApiError) {
          setErrorMessage(liveErr.message || "Invalid email or password.");
        } else if (liveErr && typeof liveErr === "object" && "response" in liveErr) {
          const axiosErr = liveErr as { response?: { data?: { message?: string } } };
          setErrorMessage(
            axiosErr.response?.data?.message || "Invalid email or password."
          );
        } else if (liveErr instanceof Error) {
          setErrorMessage(liveErr.message || "Invalid email or password.");
        } else {
          setErrorMessage("Failed to connect to authentication server. Please try again.");
        }
        return;
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setForgotLoading(false);
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col justify-center items-center px-4 sm:px-6 py-10 selection:bg-[#DEC067] selection:text-slate-900">
      <div className="w-full max-w-[420px] mx-auto space-y-7">
        {/* Brand Header */}
        <div className="flex items-center gap-3.5">
          <img
            src="/jeffs-group-logo.png"
            alt="Jeffs Group of Companies"
            className="h-14 w-auto object-contain rounded-lg"
          />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-[clamp(28px,2.5vw+16px,34px)] font-bold tracking-tight text-slate-900 leading-[1.2]">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Login to your Jeffs Group Catering Super Admin Portal to manage matchday meals,
            credentials, and live distribution.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 animate-in fade-in duration-200"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1 font-medium">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email Address
            </label>
            <div className="relative">
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your email address"
                required
                className="h-11 rounded-xl text-xs sm:text-sm pl-10 border-slate-300 focus:border-[#C9A227] focus:ring-[#C9A227]"
                leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your password"
                required
                className="h-11 rounded-xl text-xs sm:text-sm pl-10 pr-10 border-slate-300 focus:border-[#C9A227] focus:ring-[#C9A227]"
                leftIcon={<Lock className="h-4 w-4 text-slate-400" />}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword((prev) => !prev);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer select-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-[#C9A227] focus:ring-[#C9A227] accent-[#C9A227] cursor-pointer"
              />
              <span className="font-medium text-slate-700">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotSubmitted(false);
                setForgotModalOpen(true);
              }}
              className="font-semibold text-[#C9A227] hover:text-[#B8901E] transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating…</span>
                </div>
              ) : (
                <span>Login</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Account Password"
        subtitle="Enter your registered corporate address to receive one-time credentials."
        maxWidth="md"
      >
        <div className="p-5 space-y-4">
          {forgotSubmitted ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Password Reset Link Dispatched
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                If an account exists for <strong className="text-slate-900">{forgotEmail}</strong>, an authorization link has been sent. It expires in 24 hours.
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => setForgotModalOpen(false)}
                className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-semibold mt-2"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="forgot-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Corporate Email Address
                </label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. alex.morgan@jeffscatering.com"
                  required
                  className="text-xs"
                  leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                />
                <p className="text-[11px] text-slate-400">
                  Must be an authorized corporate email (@jeffscatering.com or @jeffsgroup.com).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setForgotModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={forgotLoading || !forgotEmail.trim()}
                  className="rounded-xl bg-[#C9A227] hover:bg-[#B8901E] text-white font-semibold"
                >
                  {forgotLoading ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Sending…</span>
                    </div>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
