
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Import components
import { ChatSidebar } from "@/src/components/chat/ChatSidebar";
import { NavigationBar } from "./navigation-bar";
import { DashboardContent } from "./dashboard-content";

// ==================== MAIN EXPORT ====================
export function SalesDashboard() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserEmail(email);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token_type");
    router.push("/");
  };

  const handleSettings = () => {
    router.push("/settings");
  };

  return (
    <div className="h-screen flex flex-col bg-white">

      <NavigationBar
        userEmail={userEmail}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        handleLogout={handleLogout}
        handleSettings={handleSettings}
      />

      <div className="flex-1 flex min-h-0 ">
        <ChatSidebar />
        <div className="flex-1 overflow-y-auto">
          <DashboardContent userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
}