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
    countrycode:"+91",
    occupation: "",
    organization:"",
  });

  const [error, setError] = useState("");

const [acceptedTerms, setAcceptedTerms] = useState(false);


  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
  ...formData,
  phno: `${formData.countrycode}${formData.phno}`, 
};

delete (payload as any).countrycode;

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
    className={cn(
      " min-h-screen flex items-center justify-center bg-gradient-to-br from-white-100 via-blue-100 to-blue-50 object-fill ",
      className
    )}
    {...props}
  >
    <Card
      className="w-full max-w-5xl rounded-3xl overflow-hidden
      shadow-[0_30px_80px_rgba(0,0,0,0.12)]
      bg-grey-200/40"
    >
      <CardContent className="grid md:grid-cols-2 p-0">

        {/* LEFT IMAGE SECTION */}
        <div className="relative hidden md:block">
          <Image
            src="/signup.png"
            alt="Signup Visual"
            fill
            className="object-cover "
            priority
          />
        </div>

       
<div
  className="relative px-10 py-6
  backdrop-blur-2xl
  bg-white/[20%]
  border-l border-white/40"
>


          <div className="relative">

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">

              <div className="w-12 h-12 rounded-full overflow-hidden
              bg-white/40 backdrop-blur-md
              border border-white/50
              flex items-center justify-center mb-3 shadow-md">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>

              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                Create Account
              </h1>

              <p className="text-sm text-gray-700 mt-1">
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
                  className="h-12 bg-white/40 border-white/50"
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
                  className="h-12 bg-white/40 border-white/50"
                  required
                />
              </div>

           
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={formData.countrycode}
                    onValueChange={(value) =>
                      handleInputChange({
                        target: { name: "countrycode", value },
                      } as any)
                    }
                  >
                    <SelectTrigger className="h-15 bg-white/40 border-white/50">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="+91">+91</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                      <SelectItem value="+61">+61</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    name="phno"
                    placeholder="Enter your phone number"
                    value={formData.phno}
                    onChange={handleInputChange}
                    className="h-12 bg-white/40 border-white/50"
                    required
                  />
                </div>
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
      <SelectTrigger className="h-9.5 bg-white/40 border-white/50 w-full">

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
     
  className="h-9 bg-white/40 border-white/50 w-full"

      required
    />
  </div>

</div>

<div className="flex items-start gap-3 text-sm">
  <Checkbox
    id="terms"
    checked={acceptedTerms}
    onCheckedChange={(value) => setAcceptedTerms(Boolean(value))}
    className="mt-1 border-blue-500 border-2 "
  />

  <Label htmlFor="terms" className="leading-relaxed">
    I agree to the{" "}
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-blue-700 underline hover:text-blue-900"
        >
          Terms & Conditions
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
        </DialogHeader>

        <div className="h-56 overflow-y-auto text-sm text-gray-700 space-y-3">
          <p>
            By creating an account, you agree to comply with our
            platform policies and community guidelines.
          </p>

          <p>
            Your personal information will be processed securely
            according to our privacy standards.
          </p>

          <p>
            Any misuse of services may result in account suspension
            or termination.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  </Label>
</div>


              
              <Button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full h-12 rounded-lg text-white
                bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400
                shadow-md hover:shadow-lg transition-all duration-200"
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>

              <p className="text-sm text-center text-gray-800">
                Already have an account?{" "}
                <a
                  href="/"
                  className="text-blue-700 hover:underline font-medium"
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
);




}