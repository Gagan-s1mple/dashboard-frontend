/* eslint-disable @typescript-eslint/no-unused-vars */
// components/login/forgot-password-page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "../../../lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Image from "next/image";
import { toast } from "sonner";
import { ChevronLeft, Mail, CheckCircle, Key, AlertCircle } from "lucide-react";
import { useForgotPasswordStore } from "@/src/services/api/forgot-password/forgot-password-store";

export function ForgotPasswordPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");

  const {
    loading,
    error,
    success,
    requestNewPassword,
    resetState,
    email: storedEmail,
  } = useForgotPasswordStore();

  // Reset store state when component mounts
  useEffect(() => {
    resetState();
  }, [resetState]);

  // Handle store errors and success
  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 4000 });
    }
    if (success) {
      toast.success("New credentials sent to your email! 🎉", { duration: 3000 });
    }
  }, [error, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email.trim()) {
      setFormError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    try {
      await requestNewPassword(email);
      // Success is handled in the useEffect
    } catch (err) {
      // Error is already handled in the store
    }
  };

  const handleTryAgain = () => {
    resetState();
    setEmail("");
    setFormError("");
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

              {/* FORM (When not success) */}
              {!success ? (
                <>
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Key size={24} className="text-blue-600" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Forgot Password?
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                      Enter your email to receive new login credentials
                    </p>
                  </div>

                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                      {formError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 rounded-xl"
                        required
                        disabled={loading}
                      />
                      
                    </div>

                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">Important Note</p>
                          <ul className="text-xs text-amber-700 mt-1 space-y-1">
                            <li>• New login credentials will be sent to your email</li>
                            <li>• You can change your password after logging in</li>
                            <li>• Check your spam folder if you don&rsquo;t see the email</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 rounded-xl text-base mt-6"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing...
                        </span>
                      ) : (
                        "Next"
                      )}
                    </Button>
                  </form>

                  <button
                    onClick={() => router.push("/")}
                    className="text-center text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Back to Login
                  </button>
                </>
              ) : (
                /* SUCCESS MESSAGE */
                <>
                  <div className="text-center py-8">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle size={32} className="text-green-600" />
                      </div>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                      Check Your Email!
                    </h1>
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <p className="text-sm font-medium text-green-800">
                            New credentials sent to:
                          </p>
                          <p className="text-sm text-green-700 font-mono mt-1">
                            {storedEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-4">
                      We&#39;ve generated a new password and sent it to your email address.
                    </p>
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm font-medium text-blue-800">Next Steps:</p>
                      <ol className="text-xs text-blue-700 mt-2 space-y-2 ml-4 list-decimal">
                        <li>Check your email for the new password</li>
                        <li>Login with your email and the new password</li>
                        <li>Change your password from your account settings</li>
                      </ol>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push("/")}
                      className="w-full h-11 rounded-xl text-base"
                    >
                      Go to Login
                    </Button>

                    <Button
                      onClick={handleTryAgain}
                      variant="outline"
                      className="w-full h-11 rounded-xl text-base"
                    >
                      Request for Another Email
                    </Button>
                  </div>
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