/* eslint-disable @next/next/no-html-link-for-pages */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/src/services/api/signup/signup-store";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";

import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../../lib/utils";

import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { NavigationBar } from "../dashboard/navigation-bar";
import Footer from "../footer/footer";
import { InstallAppButton } from "../pwa/install-app-button";

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
    country: "",
    occupation: "",
    organization: "",
  });

  const [error, setError] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const digitsOnly = formData.phno.replace(/\D/g, "");

    if (digitsOnly.startsWith("91")) {
      const numberWithoutCode = digitsOnly.slice(2);

      if (numberWithoutCode.length !== 10) {
        toast.error("Phone number should be 10 digits");
        return;
      }
    }
    try {
      const payload = {
        ...formData,
        phno: `+${formData.phno}`,
      };

      await signup(payload);


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
      className={cn("min-h-screen flex flex-col", className)}
      {...props}
    >
      <NavigationBar />
      <div className="flex-1 flex items-center justify-center pt-12 pb-32 px-4 relative overflow-hidden">
        {/* Install App Button top right below navbar */}
        {/* <div className="absolute top-4 right-4 z-20">
          <InstallAppButton />
        </div> */}
        {/* Minimalist Background Elements */}
        <div className="absolute inset-0 z-0 opacity-[0.8] pointer-events-none">
        </div>
        {/* Minimalist Background Elements */}
        <div className="absolute inset-0 z-0 opacity-[0.6] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }}>
        </div>
        <div className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
                 radial-gradient(circle at 0% 0%, rgba(0,102,255,0.15) 0%, transparent 50%),
                 radial-gradient(circle at 100% 100%, rgba(0,102,255,0.15) 0%, transparent 50%)
               `
          }}>
        </div>

        <Card
          className="w-full max-w-xl rounded-[2.5rem] overflow-hidden relative z-10
      border border-black/5 
      shadow-[0_15px_40px_rgba(0,0,0,0.08),0_5px_15px_rgba(0,102,255,0.15)]
      bg-white"
        >
          <CardContent className="p-0">

            <div className="relative px-8 pt-0 pb-10 sm:px-12 sm:pt-2 sm:pb-12">


              <div className="relative">

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">

                  <div className="w-14 h-14 rounded-full overflow-hidden
              bg-slate-50
              border border-black/5
              flex items-center justify-center mb-4 shadow-sm">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>

                  <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                    Create Account
                  </h1>

                  <p className="text-xs text-gray-700 mt-1">
                    Create your account to continue
                  </p>

                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="h-12 bg-slate-50/50 border-black/10 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl transition-all"
                      required
                    />
                  </div>


                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}

                      className="h-12 bg-slate-50/50 border-black/10 focus:border-blue-600 focus:ring-blue-600/20 rounded-xl transition-all"
                      required
                    />
                  </div>


                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <PhoneInput
                      country={"in"}
                      enableSearch={true}
                      value={formData.phno}
                      onChange={(phone, countryData: any) =>
                        setFormData((prev) => ({
                          ...prev,
                          phno: phone,
                          country: countryData?.name || "",
                        }))
                      }
                      inputStyle={{
                        width: "100%",
                        height: "48px",
                        backgroundColor: "rgba(248, 250, 252, 0.5)",
                        borderColor: "rgba(0,0,0,0.1)",
                        borderRadius: "0.75rem",
                        fontSize: "14px",
                      }}
                      buttonStyle={{
                        backgroundColor: "rgba(248, 250, 252, 0.5)",
                        borderColor: "rgba(0,0,0,0.1)",
                        borderRadius: "0.75rem 0 0 0.75rem",
                      }}
                      searchStyle={{
                        width: "100%",
                        padding: "8px",
                      }}
                      containerStyle={{
                        width: "100%",
                      }}
                    />
                  </div>


                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">


                    {/* Occupation */}
                    <div className="space-y-2">
                      <Label>Occupation</Label>
                      <Select
                        value={formData.occupation}
                        onValueChange={(value) =>
                          handleInputChange({
                            target: { name: "occupation", value },
                          } as any)
                        }
                      >
                        <SelectTrigger className="h-11 bg-slate-50/50 border-black/10 focus:border-blue-600 focus:ring-blue-600/20 w-full rounded-xl transition-all">

                          <SelectValue placeholder="Select Occupation" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Employee">Employee</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                          <SelectItem value="Founder">Founder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input
                        name="organization"
                        placeholder="Enter your organization"
                        value={formData.organization}
                        onChange={handleInputChange}

                        className="h-11 bg-slate-50/50 border-black/10 focus:border-blue-600 focus:ring-blue-600/20 w-full rounded-xl transition-all"
                        required
                      />
                    </div>

                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(value) => setAcceptedTerms(Boolean(value))}
                      className="mt-1 border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white rounded-md"
                    />

                    <Label htmlFor="terms" className="leading-relaxed">
                      I agree to the{" "}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="text-blue-600 underline hover:text-blue-800 font-medium"
                          >
                            Terms & Conditions
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Terms & Conditions</DialogTitle>
                          </DialogHeader>
                          <div className="h-[200px] flex items-center justify-center text-sm text-gray-500">
                            Please review the Terms & Conditions located in the footer of the page.
                          </div>
                        </DialogContent>
                      </Dialog>
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !acceptedTerms}
                    className="w-full h-12 rounded-xl text-white
                bg-blue-600 hover:bg-blue-700
                shadow-lg shadow-blue-600/20 transition-all duration-200 font-semibold"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </Button>

                  <p className="text-xs text-center text-gray-800">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="text-blue-600 hover:underline font-semibold text-sm"
                    >
                      Login
                    </a>
                  </p>

                </form>

              </div>
            </div>

          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}