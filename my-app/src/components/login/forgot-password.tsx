/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronLeft, Mail, MessageSquare, Shield } from "lucide-react";

type Step = "reset" | "alternate-verify" | "alternate-code" | "success";

export function ForgotPasswordPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("reset");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Reset with old password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Alternate: Verify Identity
  const [verificationMethod, setVerificationMethod] = useState<"email" | "phone" | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!oldPassword.trim()) {
      setError("Please enter your old password");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from old password");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to reset password with old password
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password reset successfully! 🎉", { duration: 2000 });
      setTimeout(() => {
        setStep("success");
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
      toast.error("Failed to reset password", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleAlternateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to verify code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Verified successfully!", { duration: 2000 });
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Invalid verification code");
      toast.error("Invalid verification code", { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === "alternate-verify") setStep("reset");
    else if (step === "alternate-code") setStep("alternate-verify");
    else router.push("/");
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen flex items-center justify-center p-6",
        className,
      )}
      {...props}
    >
      <Card className="overflow-hidden p-0 w-full max-w-5xl shadow-xl rounded-3xl">
        <CardContent className="grid p-0 md:grid-cols-2">

          {/* LEFT FORM */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">

              {/* STEP 1: RESET PASSWORD */}
              {step === "reset" && (
                <>
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Change Password
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Enter your current and new password
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleResetPassword}>
                    <div className="grid gap-2">
                      <Label>Old Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter your current password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>

                    <div className="grid gap-2 mt-4">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>

                    <div className="grid gap-2 mt-4">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 rounded-xl"
                        required
                      />
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex gap-2">
                      <Shield size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">
                        Use a strong password with mix of letters, numbers and symbols
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl text-base mt-6"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Don&lsquo;t remember?{" "}
                      <button
                        onClick={() => setStep("alternate-verify")}
                        className="font-medium text-black hover:underline"
                      >
                        Try other ways
                      </button>
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/")}
                    className="text-center text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Back to Login
                  </button>
                </>
              )}

              {/* STEP 2: ALTERNATE VERIFY METHOD */}
              {step === "alternate-verify" && (
                <>
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Verify It&apos;s You
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Choose how you&apos;d like to verify your identity
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setVerificationMethod("email");
                        setStep("alternate-code");
                      }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition flex items-center gap-3 hover:border-gray-300",
                        "border-gray-200",
                      )}
                    >
                      <Mail size={20} className="text-gray-600" />
                      <div className="text-left">
                        <p className="font-medium text-sm">Email</p>
                        <p className="text-xs text-gray-500">We&apos;ll send a code to your email</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setVerificationMethod("phone");
                        setStep("alternate-code");
                      }}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition flex items-center gap-3 hover:border-gray-300",
                        "border-gray-200",
                      )}
                    >
                      <MessageSquare size={20} className="text-gray-600" />
                      <div className="text-left">
                        <p className="font-medium text-sm">Phone</p>
                        <p className="text-xs text-gray-500">We&apos;ll send a code via SMS</p>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={goBack}
                    className="text-center text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                </>
              )}

              {/* STEP 3: VERIFY CODE */}
              {step === "alternate-code" && (
                <>
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Enter Code
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      We sent a code to your {verificationMethod}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleAlternateVerification}>
                    <div className="grid gap-2">
                      <Label>Verification Code</Label>
                      <Input
                        placeholder="Enter the code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="h-11 rounded-xl"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Check your {verificationMethod} for the code
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl text-base mt-6"
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </Button>
                  </form>

                  <button
                    onClick={goBack}
                    className="text-center text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                </>
              )}

              {/* STEP 4: SUCCESS */}
              {step === "success" && (
                <>
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield size={32} className="text-green-600" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Password Reset Successful
                    </h1>
                    <p className="text-gray-500 text-sm mt-3">
                      Your password has been successfully changed
                    </p>
                  </div>

                  <Button
                    onClick={() => router.push("/")}
                    className="w-full h-11 rounded-xl text-base"
                  >
                    Back to Login
                  </Button>
                </>
              )}

            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative hidden md:block">
            <Image
              src="/round.png"
              alt="Image"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/10" />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}