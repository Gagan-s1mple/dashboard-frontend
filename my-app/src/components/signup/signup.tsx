/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/services/api/signup/signup-store";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../../lib/utils";

export function SignupPage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const signup = useSignupStore((s) => s.signup);
  const loading = useSignupStore((s) => s.loading);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phno: "",
    occupation: "",
  });

  const [error, setError] = useState("");

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await signup(formData);

      toast.success("Account created successfully! 🎉", {
        duration: 2000,
      });

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Signup failed", {
        duration: 3000,
      });
      setError(err.message || "Signup failed");
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

          {/* LEFT FORM */}
          <form
            className="p-8 md:p-12 flex flex-col justify-center"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">

              <div className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight">
                  Create Account
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Create your account to continue
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label>Full Name</Label>
                <Input
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input
                  name="phno"
                  placeholder="Enter your phone number"
                  value={formData.phno}
                  onChange={handleInputChange}
                  className="h-11 rounded-xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Occupation</Label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  className="h-11 px-3 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select Occupation</option>
                  <option value="Student">Student</option>
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                  <option value="Founder">Founder</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl text-base"
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a
                  href="/"
                  className="font-medium text-black hover:underline"
                >
                  Login
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