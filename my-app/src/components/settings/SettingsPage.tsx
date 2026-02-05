/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, Settings, Key, User, Shield, Bell, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [totalTokens, setTotalTokens] = useState<number>(500);
  const [remainingTokens, setRemainingTokens] = useState<number>(100);

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem("user_email") || "Not logged in";
    setUserEmail(email);
    
    // TODO: Fetch token info from backend when available
    // For now, using hardcoded values
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h1>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* User Profile Card */}
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
                  <p className="text-sm font-medium text-slate-600">Logged in as</p>
                  <p className="text-lg font-semibold text-slate-800">{userEmail}</p>
                </div>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Usage Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Token Usage
              </CardTitle>
              <CardDescription>Your AI token usage and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Token Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-600 mb-1">Total Tokens</p>
                  <p className="text-2xl font-bold text-blue-800">{totalTokens.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-600 mb-1">Remaining Tokens</p>
                  <p className="text-2xl font-bold text-green-800">{remainingTokens.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-600 mb-1">Used Tokens</p>
                  <p className="text-2xl font-bold text-orange-800">
                    {(totalTokens - remainingTokens).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Usage</span>
                  <span className="text-slate-800 font-medium">
                    {Math.round(((totalTokens - remainingTokens) / totalTokens) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${((totalTokens - remainingTokens) / totalTokens) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  You have used {totalTokens - remainingTokens} out of {totalTokens} tokens
                </p>
              </div>

              {/* Token Info */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-2">How tokens work</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Each dashboard generation uses tokens</li>
                  <li>• Complex queries use more tokens</li>
                  <li>• Tokens refresh monthly</li>
                  <li>• Contact support to purchase more tokens</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Email Notifications</p>
                  <p className="text-sm text-slate-600">Receive updates about your dashboard</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">Dark Mode</p>
                  <p className="text-sm text-slate-600">Switch to dark theme</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* System Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System
              </CardTitle>
              <CardDescription>Application information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-600">Version</p>
                  <p className="font-semibold text-slate-800">1.0.0</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-600">Last Updated</p>
                  <p className="font-semibold text-slate-800">March 2024</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-slate-300">
                  <Globe className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" className="flex-1 border-slate-300">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
