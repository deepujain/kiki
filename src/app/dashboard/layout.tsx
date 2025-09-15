
"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

import { Home, ClipboardCheck, Users, Menu, Info, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { UserNav } from "@/components/user-nav";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }
  
  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/attendance", icon: ClipboardCheck, label: "Attendance" },
    { href: "/dashboard/staff", icon: Users, label: "Staff" },
    { href: "/dashboard/about", icon: Info, label: "About" },
  ];

  // Mobile navigation component moved to bottom

  const BottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-2xl mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-1 py-2 text-xs font-medium transition-colors hover:bg-muted/50 rounded-lg",
                isActive ? "text-primary bg-muted" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header - Always visible */}
      <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
        <div className="w-full flex-1 flex items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <img src="/images/vikings.png" alt="Kiki Logo" className="h-8 w-8" />
            <span className="font-headline">Kiki 🍭</span>
          </Link>
        </div>
        <UserNav />
      </header>

      {/* Main Content */}
      <div className="flex-1">
        <main className="max-w-screen-2xl mx-auto p-4 lg:p-6 pb-24 bg-background">
          {children}
        </main>
      </div>

      {/* Bottom Navigation - Always visible */}
      <BottomNav />
    </div>
  );
}
