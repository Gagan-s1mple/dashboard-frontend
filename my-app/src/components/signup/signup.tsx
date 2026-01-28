/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/services/api/signup/signup-store";
import { toast } from "sonner";

export function SignupPage() {
  const signup = useSignupStore((s) => s.signup);
  const loading = useSignupStore((s) => s.loading);

  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phno: "",
    occupation: "",
  });

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* Left Image */}
        <div className="relative hidden md:block">
          <Image src="/round.png" alt="img" fill className="object-cover" />
        </div>

        {/* Right Form */}
        <div className="p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold mb-2">Create Account</h1>
          <p className="text-gray-500 mb-8">
            Create your account to continue
          </p>

          <form
            onSubmit={async (e) => {
              e.preventDefault();

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
              }
            }}
            className="space-y-5"
          >
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="input"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="input"
              required
            />

            <input
              name="phno"
              placeholder="Phone Number"
              value={formData.phno}
              onChange={handleInputChange}
              className="input"
              required
            />

            <select
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="input"
              required
            >
              <option value="">Select Occupation</option>
              <option>Student</option>
              <option>Employee</option>
              <option>Manager</option>
              <option>Founder</option>
            </select>

            <button
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/" className="text-black font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus {
          border-color: black;
        }
      `}</style>
    </div>
  );
}