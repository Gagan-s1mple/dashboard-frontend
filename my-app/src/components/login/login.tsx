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
import { useLoginStore } from "@/src/services/api/login/login-store";
import { toast } from "sonner";
import { ArrowRight, AlertCircle,Eye,EyeOff,Sparkles } from "lucide-react"; // Add icons for better UI

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const login = useLoginStore((s) => s.login);
  const loading = useLoginStore((s) => s.loading);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignupError, setIsSignupError] = useState(false); // Track if it's a signup error
  const [showPassword, setShowPassword] = useState(false); 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSignupError(false);

    try {
      await login({ username, password });

      toast.success("Login successful! 🎉", {
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.message || "Login failed";
      
      // Check if it's the signup error
      if (errorMessage.includes("Please sign up to create an account")) {
        setIsSignupError(true);
        toast.error("Account not found", {
          description: "Please sign up to create an account",
          duration: 4000,
        });
      } else {
        toast.error(errorMessage, {
          duration: 3000,
        });
      }
      setError(errorMessage);
    }
  };

  const handleSignupRedirect = () => {
    router.push("/signup");
  };

return (
  <div
    className={cn(
     "min-h-screen flex items-center justify-center  p-4"

,
      className,
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.15),transparent_60%)]" />

    <Card
  className="relative w-full max-w-md
  bg-white/20 backdrop-blur-xl
  border border-white/40
  shadow-[0_20px_60px_rgba(0,0,0,0.2)]
  rounded-2xl overflow-hidden"
>

     
      <div className="absolute top-0 left-0 right-0 h-40 
      bg-gradient-to-b from-blue-100 via-blue-50 to-transparent 
      opacity-40 blur-3xl -mt-20" />

      <CardContent className="relative p-8">

     
        <div className="flex flex-col items-center mb-8">
         <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg">
               <Image
    src="/logo.png"
    alt="Logo"
    width={96}
    height={96}
    className="object-cover"
  /> 
           
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Welcome!
          </h1>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Sign in to continue to your account
          </p>
        </div>

   
        <form
          className="space-y-6"
          onSubmit={handleSubmit}
        >

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Username
            </Label>
            <Input
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 rounded-lg bg-gray-50 border border-gray-200
              placeholder:text-gray-400
              focus:ring-2 focus:ring-blue-500/40
              focus:border-blue-500
              transition-all duration-200"
              required
            />
          </div>

   
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <a
                href="/forgot-password"
                className="text-xs text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={(FormData as any).password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-lg bg-gray-50 border border-gray-200 pr-10
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500/40
                focus:border-blue-500
                transition-all duration-200"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 
                text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

    
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg text-sm font-medium text-white
            bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400
            hover:from-blue-700 hover:via-blue-600 hover:to-blue-500
            shadow-sm hover:shadow-md hover:shadow-blue-100
            active:scale-[0.98]
            transition-all duration-200"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

        </form>


        <div className="mt-6">
          <p className="text-sm text-center text-gray-500">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </a>
          </p>
        </div>

      </CardContent>
    </Card>
  </div>
);


}