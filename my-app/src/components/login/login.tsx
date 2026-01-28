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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ username, password });

      toast.success("Login successful! 🎉", {
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Login failed", {
        duration: 3000,
      });
      setError(err.message || "Login failed");
    }
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

          {/* LEFT */}
          <form
            className="p-8 md:p-12 flex flex-col justify-center"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">

              <div className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Welcome back
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Login to your account
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label>Username</Label>
                <Input
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label>Password</Label>
                  <span className="ml-auto text-xs text-gray-400 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>

                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-base"
              >
                {loading ? "Signing in..." : "Login"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-black hover:underline"
                >
                  Sign up
                </a>
              </p>
            </div>
          </form>

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
