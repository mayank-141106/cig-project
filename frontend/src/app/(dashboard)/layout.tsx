"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import { authService } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isLoggedIn()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#07070A" }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
