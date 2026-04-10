"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOtp } from "../actions/send-otp";
import { verifyOtp } from "../actions/verify-otp";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Image from "next/image";
import icon from "@/public/icon.png";
import { OTPInput } from "@/components/OTPinput";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timer, setTimer] = useState(false);
  const [sec, setSec] = useState(15);
  const [loading, setLoading] = useState(false);
  const [chances, setChances] = useState(3);
  const [verifyAttempts, setVerifyAttempts] = useState(5);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("/api/user/find", { email });
      if (res.status === 200) {
        await sendOtp(email);
        setStep(2);
        setTimer(true);
        setSec(15);
        toast.success("Check your email for OTP.");
      } else {
        toast.error("User not found");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (chances <= 0) return;
    try {
      await sendOtp(email);
      setTimer(true);
      setSec(15);
      setChances(chances - 1);
      toast.success("OTP resent to your email.");
    } catch (error: any) {
      toast.error("Failed to resend OTP.");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    if (verifyAttempts <= 0) {
      toast.error("Maximum attempts reached. Please resend the OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      if (res?.verified) {
        toast.success("OTP verified successfully.");
        setStep(3);
      } else {
        const remaining = verifyAttempts - 1;
        setVerifyAttempts(remaining);
        if (remaining <= 0) {
          toast.error("Maximum attempts reached. Please resend the OTP.");
        } else {
          toast.error(res?.message || `Invalid OTP. You have ${remaining} attempts left.`);
        }
      }
    } catch (err) {
      toast.error("Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setLoading(true);
    try {
      // Dummy route call
      await axios.post("/api/user/reset_password", {
        email,
        otp,
        password,
      });
      toast.success("Password reset successfully!");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!timer) return;
    if (sec <= 0) {
      setTimer(false);
      return;
    }
    const interval = setInterval(() => {
      setSec((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, sec]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold"
            aria-label="HireAI Home"
          >
            <div className="flex h-10 w-10 items-center justify-center">
              <Image src={icon} alt="HireAI Logo" width={50} height={50} />
            </div>
            <span>HireSense</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Forgot password
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === 1 && "Enter your email to receive an OTP"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Create a new strong password"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-background"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
              >
                {loading ? <Spinner className="h-5 w-5" /> : "Send OTP"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 w-full">
              <div className="flex justify-center items-center">
                <p className="text-muted-foreground">
                  Enter the OTP sent to your email address
                </p>
              </div>
              <OTPInput onComplete={(val) => setOtp(val)} />
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
              >
                {loading ? <Spinner className="w-5 h-5" /> : "Next ->"}
              </Button>

              {chances > 0 && (
                <div className="mt-6 text-center">
                  {!timer ? (
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the OTP?{" "}
                      <button
                        type="button"
                        className="font-medium text-primary hover:underline"
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Resend OTP in {sec} seconds
                    </p>
                  )}
                </div>
              )}
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-background"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Re-enter Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-background"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25"
              >
                {loading ? <Spinner className="h-5 w-5" /> : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Divider & back link */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
