/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, Settings, Key, User, Shield, Bell, Globe,Wallet,ToggleLeft,BarChart,LineChart } from "lucide-react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {url} from "@/src/services/api/api-url";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import ReactECharts from "echarts-for-react";
import { DatePicker } from "../settings/date-picker";
// import { Select } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"


export function SettingsPage() {
const router = useRouter();
const [userEmail, setUserEmail] = useState<string>("");
const [userName, setUserName] = useState<string>("");
const [credits, setCredits] = useState(1);
const [availableCredits, setAvailableCredits] = useState<number|null>(null);
const[loadingCredits, setLoadingCredits] = useState(true);
const [loading, setLoading] = useState(false);


const [showAnalytics, setShowAnalytics] = useState(false);
const [chartType, setChartType] = useState<"bar" | "line">("bar");
const [analyticsData, setAnalyticsData] = useState<
  { date: string; usage: number }[]
>([]);
const [analyticsLoading, setAnalyticsLoading] = useState(false);
const [rangeType, setRangeType] = useState<"month" | "year">("month");
const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");

const [recentActivity, setRecentActivity] = useState<
  { date: string; amount: number }[]
>([]);
const [currency, setCurrency] = useState<string | null>(null);
const USD_TO_INR = 91.0;


const [selectedFile] = useState("sales_data_2026.csv");

const [cleanOptions, setCleanOptions] = useState({
  keepNulls: false,
  removeDuplicates: false,
  normalizeColumns: false,
  trimWhitespace: false,
});

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("user_email") || "Not logged in";
    setUserEmail(email);
    const name = localStorage.getItem("user_name") || "User";
    setUserName(name);
    
    // TODO: Fetch token info from backend when available
    // For now, using hardcoded values
  }, []);

  useEffect(() => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currency");
    if (stored) {
      setCurrency(stored);
    }
    console.log("Currency from LS:", stored);

  }
}, []);

//price calculation
const calculatePrice = (credits: number) => {
  if (currency === "INR") {
    return credits * USD_TO_INR;
  }
  return credits;
};

const price = calculatePrice(credits);   

const purchaseCredits = async () => {
  if (credits < 1) return;

  setLoading(true);

//create=order api call
  try {
    const orderResponse = await fetch(
      `${url.backendUrl}/payment/create-order`,
      
      {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          credits,
          // user_id: "current_user_id",
          currency: localStorage.getItem("currency"),
        }),
      }
    );
console.log(url);
    const order = await orderResponse.json();

//razorpay api key
    const options = {
      key: "rzp_test_SE0YAyn0Zv15Qy",
      amount: order.amount,
      currency: order.currency,
      name: "ADRO",
      description: `Purchase ${credits} credits`,
      order_id: order.id,
//verify payment api call
      handler: async function (response: any) {
        const verifyResponse = await fetch(
          `${url.backendUrl}/payment/verify-payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          }
        );

        const result = await verifyResponse.json();
if (result.status === "success") {
  await fetchCredits();
}


        setLoading(false);
      },

      theme: {
        color: "#4f46e5",
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function () {
      setLoading(false);
    });

  } catch (error) {
    console.error("Payment error:", error);
    setLoading(false);
  }
};

  const handleBack = () => {
    router.back();
  };


const fetchCredits = async () => {
    try {
      const response = await fetch(
        `${url.backendUrl}/api/fetch-credits`,
        {
          method: "GET",
         headers: {
            "Content-Type": "application/json",
             Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch credits");
      }

      const data = await response.json();

      setAvailableCredits(data.availableCredits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoadingCredits(false);
    }
  };
console.log("availableCredits:", availableCredits);
  // fetch available credits
useEffect(() => {
  fetchCredits();
}, []);

// analytics api 
const fetchAnalytics = async () => {
  if (rangeType === "month" && (!startDate || !endDate)) {
    alert("Please select start and end date");
    return;
  }

  setAnalyticsLoading(true);

  try {
    let query = "";

    if (rangeType === "year") {
      const currentYear = new Date().getFullYear();
      query = `?year=${currentYear}`;
    } else {
      query = `?start_date=${startDate}&end_date=${endDate}`;
    }

    const response = await fetch(
      `${url.backendUrl}/api/credits-usage${query}`,
      { method: "GET",
       headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      }, }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch analytics")
    }
const data = await response.json();

const formattedData = Object.entries(data.daily_usage).map(
  ([date, usage]) => ({
    date,
    usage: Number(usage),
  })
);
//fetxh analytics data
setAnalyticsData(formattedData);

  } catch (error) {
    console.error("Analytics error:", error);
  } finally {
    setAnalyticsLoading(false);
  }
  console.log("fetchanalytics: button clicked");
  console.log("FETCH FUNCTION TRIGGERED");
};

// chart options
const getChartOption = () => {
  const dates = analyticsData.map((item) => item.date);
  const usage = analyticsData.map((item) => item.usage);

  return {
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: dates,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: usage,
        type: chartType,
        smooth: chartType === "line",
      },
    ],
  };
};
// transaction history 
const fetchTransactionHistory = async () => {
  try {
    const response = await fetch(
      `${url.backendUrl}/api/transaction-history`,
      {
        method: "GET",
        headers: {  "Content-Type": "application/json",
         Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transaction history");
    }

    const data = await response.json();

    setRecentActivity(data.paymentHistory || []);

  } catch (error) {
    console.error("Transaction history error:", error);
  }
};
console.log("recentActivity:", recentActivity);

useEffect(() => {
  fetchTransactionHistory();
}, []);

//data cleaning options
const handleCheckboxChange = (key: string) => {
  setCleanOptions((prev) => ({
    ...prev,
    [key]: !prev[key as keyof typeof prev],
  }));
};

const handleCleanSubmit = () => {
  console.log("Selected cleaning options:", cleanOptions);
};

  return (
    <>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    <div className=" p-4 md:p-6">
      <div className="w-full  mx-auto">
        {/* Header */}
       <div className="flex justify-end mb-3">
  <div className="flex flex-col items-end gap-2">

   

    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
      <Settings className="w-6 h-6" />
      Settings
    </h1>
   <Button
      onClick={handleBack}
      variant="outline"
      className="border-slate-300 text-slate-700 hover:bg-slate-50"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Dashboard
    </Button>

  </div>
</div>

        {/* Settings Cards */}
       <div className="w-full flex flex-col md:flex-row gap-5 flex-wrap">

          {/* User Profile Card */}
          <div className="w-full md:w-[400px] mx-auto">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                User Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  {/* <p className="text-sm font-medium text-slate-600">Logged in as</p> */}
                   <p className="text-md font-semibold text-slate-800"><span className="text-blue-400">Name : </span>{userName}</p>
                  <p className="text-md font-semibold text-slate-800">{userEmail}</p>
                 
                </div>
                {/* <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  Active
                </div> */}
              </div>
            </CardContent>
          </Card>
          {/* Data Cleaning Card */}
<div className="w-full mt-6">
  <Card className="shadow-sm rounded-2xl">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        🧹 Data Cleaning
      </CardTitle>
      <CardDescription>
        Prepare your dataset before running analytics
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">

      {/* Current File */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm text-slate-500">Choose  File to upload</p>
  
      </div>

      {/* Cleaning Options */}
      <div className="space-y-4 text-sm">

        <label className="flex items-center justify-between">
          <span>Keep null values</span>
          <input
            type="checkbox"
            checked={cleanOptions.keepNulls}
            onChange={() => handleCheckboxChange("keepNulls")}
          />
        </label>

        <label className="flex items-center justify-between">
          <span>Remove duplicate rows</span>
          <input
            type="checkbox"
            checked={cleanOptions.removeDuplicates}
            onChange={() => handleCheckboxChange("removeDuplicates")}
          />
        </label>

        <label className="flex items-center justify-between">
          <span>Normalize column names</span>
          <input
            type="checkbox"
            checked={cleanOptions.normalizeColumns}
            onChange={() => handleCheckboxChange("normalizeColumns")}
          />
        </label>

        <label className="flex items-center justify-between">
          <span>Trim whitespace from cells</span>
          <input
            type="checkbox"
            checked={cleanOptions.trimWhitespace}
            onChange={() => handleCheckboxChange("trimWhitespace")}
          />
        </label>

      </div>

      {/* Submit Button */}
      <Button
        onClick={handleCleanSubmit}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
      >
        feature coming soon.......
      </Button>

    </CardContent>
  </Card>
</div>
 </div>

          
{/* {credits card} */}
<div className="w-full max-w-4xl mx-auto">
  <Card className="rounded-3xl border border-slate-200 shadow-xl  overflow-hidden">
    <CardContent className="pt-5 pb-8 px-4 md:px-8">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">


   
        <div className="space-y-6">
          <div className="space-y-1">
  <div className="flex items-center gap-2 text-slate-900 font-semibold text-lg">
    <Wallet className="w-5 h-5 text-slate-600" />
    Credits
  </div>

  <p className="text-sm text-slate-500 leading-relaxed max-w-md">
    Credits are used to run data queries, generate dashboards, and perform predictive analytics.Pay as you Use!
  </p>
</div>


 <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300">

  <div className="flex items-center gap-2">
    <Wallet className="w-4 h-4 text-slate-500" />
    <p className="text-sm text-slate-500 font-medium tracking-wide">
      Available Credits
    </p>
  </div>

  <p className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-3 tracking-tight">
    {loadingCredits ? (
      <span className="text-lg text-slate-400 animate-pulse">
        Loading...
      </span>
    ) : (
      Number(availableCredits).toFixed(2)
    )}
  </p>

  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
    <span className="uppercase tracking-wide text-[10px] text-slate-600">
      Currency
    </span>
    <span className="font-medium text-slate-700">
      {currency}
    </span>
  </p>

</div>

<Dialog>
  <DialogTrigger asChild>
    <Button className="w-full md:w-auto rounded-xl bg-blue-400 hover:bg-blue-600 text-white px-4 shadow-md border-blue-400">
      Add Credits
    </Button>
  </DialogTrigger>

  <DialogContent className="rounded-2xl w-[65%] md:max-w-md">

   <DialogHeader>
  <DialogTitle className="text-lg font-semibold">
    Purchase Credits
  </DialogTitle>
</DialogHeader>
<div className="space-y-6 mt-4">

  {/* Credits Selector */}
  <div className="flex items-center justify-center">
    <Input
      type="number"
      min="1"
      value={credits}
      onChange={(e) => setCredits(Number(e.target.value))}
      className="
        text-center
        border border-slate-200
        bg-slate-50
        text-xl font-bold
        h-12 w-24
        rounded-xl
        shadow-sm
        focus-visible:ring-2
        focus-visible:ring-blue-400
        focus-visible:border-blue-400
        transition-all duration-200
        appearance-none
      "
    />
  </div>

  {/* Purchase Section */}
  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">

    <Button
      onClick={purchaseCredits}
      disabled={loading}
      className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-all duration-200 rounded-lg px-5"
    >
      {loading ? "Processing..." : `Add ${credits}`}
    </Button>

    <p className="text-sm text-slate-600 font-medium">
      Approximately you pay- {currency === "INR" ? "₹" : "$"} {price}
    </p>

  </div>

  <p className="text-xs text-slate-500 text-center">
    Secure payment powered by Razorpay
  </p>

</div>
  </DialogContent>
</Dialog>

        </div>
        <div className="space-y-6">

         <div>
  <p className="text-sm font-semibold text-slate-800 mb-4">
    Recent Activity
  </p>

  <div className="space-y-4 text-sm text-slate-600">
    {recentActivity.map((item, index) => (
      <div
        key={index}
        className={`flex justify-between ${
          index !== recentActivity.length - 1 ? "border-b pb-2" : ""
        }`}
      >
        <span>
          {new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </span>

        <span className="text-green-500 font-medium">
          +{item.amount}
        </span>
      </div>
    ))}
  </div>
</div>


         <Button
  variant="outline"
  className="rounded-xl border-slate-300 hover:bg-slate-50"
  onClick={() => setShowAnalytics((prev) => !prev)}
>
  {showAnalytics ? "Hide Usage Analytics" : "View Usage Analytics"}
</Button>
</div>
</div>
</CardContent>
</Card>

  {showAnalytics && (
 <Card className="mt-5 rounded-3xl border border-slate-200 shadow-lg shadow-xl overflow-hidden">

    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <div className="px-3 py-3">
        <CardTitle>Usage Analytics</CardTitle>
        </div>
  <div className="flex flex-col md:flex-row md:items-end gap-4 mb-5 w-full">

  {/* Range Type Select */}
  <div className="w-full md:w-40">
   <Select
  value={rangeType}
  onValueChange={(value) =>
    setRangeType(value as "month" | "year")
  }
>
  <SelectTrigger className="w-full rounded-xl">
    <SelectValue placeholder="Select range type" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="month">Month</SelectItem>
    <SelectItem value="year">Year</SelectItem>
  </SelectContent>
</Select>

  </div>

  {/* Date Range Inputs */}
  {rangeType === "month" && (
    <>
      <div className="w-full md:w-auto">
       <DatePicker
  value={startDate}
  onChange={setStartDate}
  placeholder="Select start date"
/>
</div>

<div className="w-full md:w-auto">
  <DatePicker
  value={endDate}
  onChange={setEndDate}
  placeholder="Select end date"
/>
</div>
</>
)}

  {/* Load Button */}
<div className="w-full md:w-auto">
  <Button
      type="button"
      onClick={fetchAnalytics}
      className="w-full md:w-auto rounded-xl bg-blue-400 hover:bg-blue-600 text-white px-4 shadow-md border-blue-400"
    >
      Load Analytics
    </Button>
  </div>
</div>
<CardDescription>
  usage trends for your credit consumption
</CardDescription>
</div>

<div className="flex gap-2">
  <Button
          size="sm"
          variant={chartType === "bar" ? "default" : "outline"}
          onClick={() => setChartType("bar")}
          className="w-full md:w-auto rounded-xl bg-blue-400 hover:bg-blue-600 text-white px-4 shadow-md border-blue-400"
        >
          <BarChart className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={chartType === "line" ? "default" : "outline"}
          onClick={() => setChartType("line")}
          className="w-full md:w-auto rounded-xl bg-blue-400 hover:bg-blue-600 text-white px-4 shadow-md border-blue-400"
        >
          <LineChart className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>

    <CardContent>
      <ReactECharts
        option={getChartOption()}
        style={{ height: "350px", width: "100%" }}
      />
    </CardContent>
  </Card>
)}

</div>
        </div>
      </div>
    </div>
    </>
  );
}
