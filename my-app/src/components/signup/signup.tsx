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
                          <DialogContent className="max-w-3xl">
                                                     <DialogHeader>
                                                       <DialogTitle>Terms & Conditions</DialogTitle>
                                                     </DialogHeader>
                                                     <div className="h-[400px] overflow-y-auto text-xs text-gray-700 pr-3">
                                                       <h1 className="text-base font-semibold">Terms of Service</h1>
                                                       <p>Equilibrate.AI Technologies Private Limited</p>
                                                       <p>Product Name: ADRO</p>
                                                       <p>Last Updated: March 2, 2026</p>
                                                       <p>Effective Date: March 2, 2026</p>
                         
                                                       <h1 className="text-base font-semibold">1. Agreement to Terms</h1>
                                                       <p>
                                                         These Terms of Service ("Terms") constitute a legally binding agreement between you (the "User," "you," or "your") and Equilibrate.AI Technologies Private Limited (CIN: U62013KA2025PTC206418), a company incorporated under the laws of India with its registered office at #17 & 17/1 South End Road, Vijayarangam Layout, Basavanagudi, Bangalore, Karnataka 560004, India ("Company," "we," "us," or "our").
                                                       </p>
                                                       <p>
                                                         By accessing or using ADRO, the Equilibrate.AI data analytics platform (the "Service" or "ADRO"), you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">2. Description of Service</h1>
                                                       <p>
                                                         ADRO is Equilibrate.AI's artificial intelligence-powered data analytics platform that enables users to analyze data, generate insights, create dashboards, and perform advanced analytics using large language models and machine learning technologies (collectively, the "Service").
                                                       </p>
                                                       <p>The Service includes but is not limited to:</p>
                                                       <p>• AI-powered data analysis and natural language querying</p>
                                                       <p>• Automated dashboard generation and data visualization</p>
                                                       <p>• Predictive analytics and trend analysis</p>
                                                       <p>• Integration with various data sources and databases</p>
                                                       <p>• API access for programmatic interactions</p>
                         
                                                       <h1 className="text-base font-semibold">3. Eligibility and Account Registration</h1>
                         
                                                       <h1 className="text-xs font-semibold">3.1 Age Requirement</h1>
                                                       <p>
                                                         You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you are at least 18 years old.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">3.2 Account Creation</h1>
                                                       <p>To access certain features of the Service, you must create an account. You agree to:</p>
                                                       <p>• Provide accurate, current, and complete information during registration</p>
                                                       <p>• Maintain and promptly update your account information</p>
                                                       <p>• Maintain the security of your account credentials</p>
                                                       <p>• Accept responsibility for all activities that occur under your account</p>
                                                       <p>• Notify us immediately of any unauthorized access or security breach</p>
                         
                                                       <h1 className="text-xs font-semibold">3.3 Business Accounts</h1>
                                                       <p>
                                                         If you are registering on behalf of a business entity, you represent that you have the authority to bind that entity to these Terms.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">4. Artificial Intelligence and Output Accuracy</h1>
                         
                                                       <h1 className="text-xs font-semibold">4.1 AI-Generated Content Notice</h1>
                                                       <p>
                                                         CRITICAL NOTICE: The Service utilizes artificial intelligence and large language models to generate outputs, insights, analyses, and visualizations. All content generated by the Service is AI-generated and may contain inaccuracies, errors, or misleading information (collectively referred to as "Hallucinations").
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">4.2 No Guarantee of Accuracy</h1>
                                                       <p>You acknowledge and agree that:</p>
                                                       <p>• AI outputs may be inaccurate, incomplete, outdated, or misleading</p>
                                                       <p>• The Service does not guarantee the accuracy, reliability, or completeness of any AI-generated content</p>
                                                       <p>• AI models may produce different outputs for identical inputs</p>
                                                       <p>• The Service should not be used as the sole basis for financial, credit, legal, medical, or other critical decisions</p>
                         
                                                       <h1 className="text-xs font-semibold">4.3 User Responsibility for Verification</h1>
                                                       <p>
                                                         You agree to independently verify all AI-generated outputs before using them for any purpose, particularly:
                                                       </p>
                                                       <p>• Financial decisions, investments, or credit assessments</p>
                                                       <p>• Manufacturing processes or safety-critical operations</p>
                                                       <p>• Compliance with regulatory requirements</p>
                                                       <p>• Business decisions with significant consequences</p>
                                                       <p>• Any application where errors could result in harm or loss</p>
                         
                                                       <h1 className="text-xs font-semibold">4.4 No Professional Advice</h1>
                                                       <p>
                                                         The Service does not provide financial, legal, accounting, tax, medical, or other professional advice. You should consult with appropriate licensed professionals before making decisions based on information generated by the Service.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">5. User Data and Intellectual Property</h1>
                         
                                                       <h1 className="text-xs font-semibold">5.1 Your Data</h1>
                                                       <p>
                                                         You retain all ownership rights in any data, files, information, or content that you upload, submit, or provide to the Service ("User Data"). By providing User Data to the Service, you grant us a limited, non-exclusive, worldwide, royalty-free license to:
                                                       </p>
                                                       <p>• Process, analyze, and store User Data to provide the Service</p>
                                                       <p>• Use User Data to generate outputs and insights for you</p>
                                                       <p>• Create derivative works as necessary to operate the Service</p>
                         
                                                       <h1 className="text-xs font-semibold">5.2 Model Training and Improvement</h1>
                                                       <p>
                                                         We will not use your User Data for model training or improvement without your explicit written consent.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">5.3 Output Ownership</h1>
                                                       <p>
                                                         You own the outputs generated by the Service in response to your queries and inputs. However, we retain all ownership rights in the underlying models, algorithms, methodologies, and Service infrastructure.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">5.4 Prohibited Use of Outputs</h1>
                                                       <p>You may not:</p>
                                                       <p>• Use outputs from the Service to develop, train, or improve competing AI systems</p>
                                                       <p>• Engage in "model distillation" or reverse engineering of our models</p>
                                                       <p>• Extract or attempt to replicate our proprietary algorithms or methods</p>
                                                       <p>• Use outputs to create training data for other machine learning systems</p>
                         
                                                       <h1 className="text-xs font-semibold">5.5 Company Intellectual Property</h1>
                                                       <p>
                                                         All rights, title, and interest in and to the Service, including all software, algorithms, models, trademarks, and documentation, are and will remain the exclusive property of Equilibrate.AI. These Terms do not grant you any rights to our intellectual property except as expressly stated.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">6. Acceptable Use Policy</h1>
                                                       <p>You agree not to use the Service to:</p>
                                                       <p>• Generate, create, or distribute deepfakes, manipulated media, or deceptive content</p>
                                                       <p>• Produce hate speech, discriminatory content, or content that promotes violence</p>
                                                       <p>• Create or distribute child sexual abuse material (CSAM) or illegal content</p>
                                                       <p>• Violate any applicable laws, regulations, or third-party rights</p>
                                                       <p>• Engage in fraud, money laundering, or other illegal activities</p>
                                                       <p>• Attempt to circumvent security measures or access restrictions</p>
                                                       <p>• Introduce viruses, malware, or other harmful code</p>
                                                       <p>• Scrape, crawl, or systematically extract data from the Service</p>
                                                       <p>• Impersonate any person or entity or misrepresent your affiliation</p>
                                                       <p>• Interfere with or disrupt the Service or servers/networks connected to the Service</p>
                                                       <p>
                                                         Violation of this Acceptable Use Policy may result in immediate termination of your account and legal action.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">7. Credits and Billing</h1>
                                                       <h1 className="text-xs font-semibold">7.1 Credit-Based Pricing Model</h1>
                                                       <p>
                                                         ADRO operates on a pay-as-you-use model using "Credits." Credits are prepaid digital units that you purchase and consume to access paid features of ADRO, including data analysis, dashboard generation, and API usage.
                                                       </p>
                                                       <p>
                                                         Important: Credits are not currency, have no cash value outside ADRO, are non-transferable, and cannot be exchanged for money except as expressly provided in our Refund Policy or as required by law.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">7.2 Credit Pricing and Purchase</h1>
                                                       <p>• All prices are stated in Indian Rupees (INR) or United States Dollars (USD) unless otherwise specified</p>
                                                       <p>• Payment is due immediately upon credit purchase</p>
                                                       <p>• We accept payment via credit/debit cards, UPI, net banking, and other methods as displayed</p>
                                                       <p>• Upon successful payment, credits are added to your account balance immediately</p>
                                                       <p>• We will issue a Tax-compliant tax invoice for each credit purchase</p>
                         
                                                       <h1 className="text-xs font-semibold">7.3 Credit Consumption</h1>
                                                       <p>
                                                         Credits are consumed when you use paid features of ADRO. Credit consumption rates depend on:
                                                       </p>
                                                       <p>• Type of analysis or operation performed</p>
                                                       <p>• Size and complexity of datasets analyzed</p>
                                                       <p>• Computational resources required</p>
                                                       <p>• API calls and usage volume</p>
                                                       <p>
                                                         You can view your credit balance and usage history in your account settings at any time.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">7.4 Credit Expiry</h1>
                                                       <p>
                                                         Credits purchased do not expire and remain valid for as long as your account is active.
                                                       </p>
                                                       <p>
                                                         Promotional Credits: Credits provided as promotions, bonuses, or trials may have different expiry terms as specified at the time of issuance and may be forfeited if your account is suspended or terminated for violations of these Terms.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">7.5 Failed Operations and Errors</h1>
                                                       <p>• If an operation fails due to invalid User Data, user error, or cancelled requests, credits will not be refunded</p>
                                                       <p>• We may correct obvious billing errors or credit balance discrepancies at our discretion</p>
                                                       <p>• You must report billing disputes within 30 days of the transaction by contacting support@equilibrateai.com</p>
                         
                                                       <h1 className="text-xs font-semibold">7.6 Refund Policy</h1>
                                                       <p>
                                                         All credit purchases are final except as follows:
                                                       </p>
                                                       <p>• You may request a refund for unused credits within 7 days of purchase on the basis of closure of your user account.</p>
                                                       <p>• Refunds are only available for the unused portion of credits</p>
                                                       <p>• Promotional or bonus credits are not eligible for refunds</p>
                                                       <p>• Refund requests must be submitted to support@equilibrateai.com with your invoice number</p>
                                                       <p>• Approved refunds will be processed within 10-15 business days to your original payment method</p>
                                                       <p>• If applicable taxes (GST) were paid, the refund will include the proportionate tax amount</p>
                         
                                                       <h1 className="text-xs font-semibold">7.7 Chargebacks and Payment Disputes</h1>
                                                       <p>
                                                         If you initiate a chargeback or payment dispute with your bank or payment provider:
                                                       </p>
                                                       <p>• We may immediately suspend your account pending resolution</p>
                                                       <p>• We reserve the right to deduct an equivalent number of credits from your balance</p>
                                                       <p>• We may terminate your account if the chargeback is found to be fraudulent</p>
                                                       <p>• You will be responsible for any chargeback fees or administrative costs incurred by us</p>
                                                       <p>
                                                         To dispute a charge, please contact us first at support@equilibrateai.com before initiating a chargeback.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">7.8 Pricing Changes</h1>
                                                       <p>
                                                         We reserve the right to modify credit pricing and consumption rates at any time with 30 days' notice via email or through the Service. Price changes will apply to future credit purchases only; previously purchased credits will not be affected.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">7.9 Non-Transferability</h1>
                                                       <p>
                                                         Credits are tied to your ADRO account and cannot be:
                                                       </p>
                                                       <p>• Transferred to another user or account</p>
                                                       <p>• Sold, traded, or exchanged outside ADRO</p>
                                                       <p>• Used as collateral or security</p>
                                                       <p>• Pooled across multiple accounts (except for Enterprise workspace accounts with explicit permission)</p>
                         
                                                       <h1 className="text-xs font-semibold">7.10 Account Suspension and Credit Forfeiture</h1>
                                                       <p>
                                                         If your account is suspended or terminated for violation of these Terms or our Acceptable Use Policy:
                                                       </p>
                                                       <p>• You forfeit all remaining credits (purchased and promotional)</p>
                                                       <p>• No refunds will be provided for forfeited credits</p>
                                                       <p>• We may retain records of your credit history as required by law</p>
                         
                                                       <h1 className="text-xs font-semibold">7.11 Taxes</h1>
                                                       <p>
                                                         All fees and credit purchases are exclusive of applicable taxes, including Goods and Services Tax (GST). You are responsible for paying all taxes associated with your purchase and use of the Service. GST will be added to your invoice as per applicable rates.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">8. Data Privacy and Protection</h1>
                                                       <h1 className="text-xs font-semibold">8.1 Privacy Policy</h1>
                                                       <p>
                                                         Our collection, use, and protection of your personal data is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to our Privacy Policy.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">8.2 DPDP Act Compliance</h1>
                                                       <p>
                                                         We comply with the Digital Personal Data Protection Act, 2023 and its implementing rules. You have the right to:
                                                       </p>
                                                       <p>• Access your personal data</p>
                                                       <p>• Correct inaccurate personal data</p>
                                                       <p>• Request erasure of your personal data (Right to be Forgotten)</p>
                                                       <p>• Withdraw consent for data processing</p>
                                                       <p>• Nominate a person to exercise rights on your behalf</p>
                                                       <p>
                                                         To exercise these rights, contact our Data Protection Officer at privacy@equilibrate.ai.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">8.3 Data Security</h1>
                                                       <p>
                                                         We implement reasonable technical and organizational measures to protect your data. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">8.4 Data Retention</h1>
                                                       <p>
                                                         We retain User Data for as long as your account is active or as needed to provide the Service. Upon account deletion, we will delete or anonymize your data within 90 days, except where retention is required by law.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">9. Limitation of Liability</h1>
                                                       <h1 className="text-xs font-semibold">9.1 Disclaimer of Warranties</h1>
                                                       <p>
                                                         THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR ACCURACY OF RESULTS.
                                                       </p>
                                                       <p>WE DO NOT WARRANT THAT:</p>
                                                       <p>• The Service will be uninterrupted, secure, or error-free</p>
                                                       <p>• AI outputs will be accurate, reliable, or suitable for your purposes</p>
                                                       <p>• Defects will be corrected</p>
                                                       <p>• The Service is free from viruses or harmful components</p>
                         
                                                       <h1 className="text-xs font-semibold">9.2 Limitation of Liability</h1>
                                                       <p>
                                                         TO THE MAXIMUM EXTENT PERMITTED BY INDIAN LAW:
                                                         EQUILIBRATE.AI'S TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">9.3 Exclusion of Damages</h1>
                                                       <p>WE SHALL NOT BE LIABLE FOR ANY:</p>
                                                       <p>• Indirect, incidental, consequential, special, or punitive damages</p>
                                                       <p>• Loss of profits, revenue, data, business opportunities, or goodwill</p>
                                                       <p>• Damages resulting from reliance on AI-generated outputs</p>
                                                       <p>• Damages caused by your failure to verify AI outputs</p>
                                                       <p>• Business interruption or system failures</p>
                                                       <p>• Costs of procurement of substitute services</p>
                                                       <p>
                                                         EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">9.4 Exceptions</h1>
                                                       <p>
                                                         The limitations in Sections 9.2 and 9.3 do not apply to:
                                                       </p>
                                                       <p>• Our gross negligence or willful misconduct</p>
                                                       <p>• Death or personal injury caused by our negligence</p>
                                                       <p>• Fraud or fraudulent misrepresentation</p>
                                                       <p>• Our indemnification obligations under Section 10</p>
                                                       <p>• Any liability that cannot be excluded under Indian law</p>
                         
                                                       <h1 className="text-base font-semibold">10. Indemnification</h1>
                                                       <p>
                                                         You agree to indemnify, defend, and hold harmless Equilibrate.AI, its affiliates, and their respective officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising from:
                                                       </p>
                                                       <p>• Your use or misuse of the Service</p>
                                                       <p>• Your violation of these Terms</p>
                                                       <p>• Your violation of any applicable laws or regulations</p>
                                                       <p>• Your User Data or outputs generated from your User Data</p>
                                                       <p>• Decisions made based on AI outputs without proper verification</p>
                                                       <p>• Infringement of any third-party intellectual property rights</p>
                                                       <p>• Any breach of your representations or warranties</p>
                         
                                                       <h1 className="text-base font-semibold">11. Term and Termination</h1>
                                                       <h1 className="text-xs font-semibold">11.1 Term</h1>
                                                       <p>
                                                         These Terms commence when you first access the Service and continue until terminated in accordance with this Section.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">11.2 Termination by You</h1>
                                                       <p>
                                                         You may terminate your account at any time through your account settings or by contacting support@equilibrateai.com
                                                       </p>
                                                       <h1 className="text-xs font-semibold">11.3 Termination by Us</h1>
                                                       <p>
                                                         We may suspend or terminate your access to the Service immediately, without notice, if:
                                                       </p>
                                                       <p>• You violate these Terms or our Acceptable Use Policy</p>
                                                       <p>• Your account shows fraudulent or illegal activity</p>
                                                       <p>• Required by law or government authority</p>
                                                       <p>• You engage in chargeback abuse or payment fraud</p>
                                                       <p>• We discontinue the Service (with 30 days' notice)</p>
                                                       <h1 className="text-xs font-semibold">11.4 Effect of Termination</h1>
                                                       <p>Upon termination:</p>
                                                       <p>• Your right to access and use the Service immediately ceases</p>
                                                       <p>• All unused credits are forfeited (no refunds for voluntary termination)</p>
                                                       <p>• You remain liable for all charges incurred prior to termination</p>
                                                       <p>• We may delete your User Data after 90 days</p>
                                                       <p>• Sections 4, 5, 7, 9, 10, 12, and 13 survive termination</p>
                         
                                                       <h1 className="text-base font-semibold">12. Dispute Resolution and Governing Law</h1>
                                                       <h1 className="text-xs font-semibold">12.1 Governing Law</h1>
                                                       <p>
                                                         These Terms are governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">12.2 Jurisdiction</h1>
                                                       <p>
                                                         Any disputes arising from these Terms or the Service shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">12.3 Arbitration (Optional for Enterprise)</h1>
                                                       <p>
                                                         For Enterprise customers, disputes may be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, with arbitration seated in Bangalore, India.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">12.4 Grievance Redressal</h1>
                                                       <p>
                                                         In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, we have appointed a Grievance Officer to address your concerns.
                                                       </p>
                                                       <p>Grievance Officer Details:</p>
                                                       <p>Name: Anish Navali</p>
                                                       <p>Email: support@equilibrateai.com</p>
                                                       <p>Phone: +91-9606024155</p>
                                                       <p>
                                                         Address: Equilibrate.AI Technologies Private Limited, #17 & 17/1 South End Road, Vijayarangam Layout, Basavanagudi, Bangalore, Karnataka 560004, India
                                                       </p>
                                                       <p>
                                                         The Grievance Officer will acknowledge complaints within 24 hours and resolve them within 15 days.
                                                       </p>
                         
                                                       <h1 className="text-base font-semibold">13. General Provisions</h1>
                                                       <h1 className="text-xs font-semibold">13.1 Modifications to Terms</h1>
                                                       <p>
                                                         We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the Service at least 15 days before the effective date. Your continued use of the Service after changes take effect constitutes acceptance of the modified Terms.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">13.2 Entire Agreement</h1>
                                                       <p>
                                                         These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Equilibrate.AI regarding the Service.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">13.3 Severability</h1>
                                                       <p>
                                                         If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">13.4 Waiver</h1>
                                                       <p>
                                                         Our failure to enforce any right or provision of these Terms does not constitute a waiver of such right or provision.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">13.5 Assignment</h1>
                                                       <p>
                                                         You may not assign or transfer these Terms or your account without our prior written consent. We may assign these Terms to any affiliate or successor in connection with a merger, acquisition, or sale of assets.
                                                       </p>
                         
                                                       <h1 className="text-xs font-semibold">13.6 Force Majeure</h1>
                                                       <p>
                                                         We shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including acts of God, natural disasters, war, terrorism, pandemics, government actions, or internet service failures.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">13.7 Export Compliance</h1>
                                                       <p>
                                                         You agree to comply with all applicable export and import control laws and regulations in your use of the Service.
                                                       </p>
                                                       <h1 className="text-xs font-semibold">13.8 Language</h1>
                                                       <p>
                                                         These Terms are executed in English. In case of any translation, the English version shall prevail.
                                                       </p>
                                                       <h1 className="text-base font-semibold">14. Contact Information</h1>
                                                       <p>For questions about these Terms or the Service, please contact us:</p>
                                                       <p>Equilibrate.AI Technologies Private Limited</p>
                                                       <p>Email: support@equilibrateai.com</p>
                                                       <p>Support: support@equilibrateai.com</p>
                                                       <p>Website: https://www.equilibrate.ai</p>
                                                       <p>
                                                         Address: #17 & 17/1 South End Road, Vijayarangam Layout, Basavanagudi, Bangalore, Karnataka 560004, India
                                                       </p>
                                                       <p>
                                                         By clicking "I Accept" or by accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                                                       </p>
                                                     </div>
                                                   </DialogContent>
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