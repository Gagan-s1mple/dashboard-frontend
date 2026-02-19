import React from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import Image from "next/image";

interface NavigationBarProps {
  userEmail: string;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  handleLogout: () => void;
  handleSettings: () => void;
}

export const NavigationBar = ({
  userEmail,
  handleLogout,
  handleSettings,
}: NavigationBarProps) => {
  return (
    <div className="border-b bg-white p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
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
        <div>
          <h1 className="font-bold text-slate-800">ADRO</h1>
          <p className="text-sm text-slate-500">Your AI Data Analyst</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {userEmail && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-slate-800">
                  {userEmail.split("@")[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};