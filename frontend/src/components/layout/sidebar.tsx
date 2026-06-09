"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Image,
  Users,
  User,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import { authService } from "@/lib/auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Events", href: "/events" },
  { icon: Image, label: "Gallery", href: "/gallery" },
  { icon: User, label: "My Photos", href: "/my-photos" },
  { icon: Upload, label: "Upload", href: "/upload" },
  { icon: Users, label: "Clubs", href: "/clubs" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const user = authService.getUser();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={styles.sidebar}
    >
      {/* Logo */}
      <div style={styles.logoRow}>
        <div style={styles.logoIcon}>
          <Sparkles size={16} color="#7C3AED" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={styles.logoText}
            >
              CIG Media
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <motion.div
                whileHover={{ x: collapsed ? 0 : 4 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  ...styles.navItem,
                  background: active ? "rgba(124,58,237,0.15)" : "transparent",
                  border: active
                    ? "1px solid rgba(124,58,237,0.25)"
                    : "1px solid transparent",
                  justifyContent: collapsed ? "center" : "flex-start",
                }}
              >
                <item.icon
                  size={18}
                  color={active ? "#7C3AED" : "#71717A"}
                  style={{ flexShrink: 0 }}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        ...styles.navLabel,
                        color: active ? "#F8F8FF" : "#71717A",
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    style={styles.activeIndicator}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={styles.bottom}>
        {/* User profile */}
        <div
          style={{
            ...styles.userRow,
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "10px 0" : "10px 12px",
          }}
        >
          <div style={styles.avatar}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                style={styles.userInfo}
              >
                <span style={styles.userName}>{user?.full_name || "User"}</span>
                <span style={styles.userHandle}>
                  @{user?.username || "username"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ x: collapsed ? 0 : 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => authService.logout()}
          style={{
            ...styles.logoutBtn,
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <LogOut size={16} color="#EF4444" style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                style={styles.logoutText}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          style={styles.collapseBtn}
        >
          {collapsed ? (
            <ChevronRight size={14} color="#52525B" />
          ) : (
            <ChevronLeft size={14} color="#52525B" />
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    height: "100vh",
    background: "#101114",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    padding: "20px 12px",
    position: "sticky",
    top: 0,
    flexShrink: 0,
    overflow: "hidden",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "4px 8px",
    marginBottom: "28px",
  },
  logoIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#F8F8FF",
    letterSpacing: "-0.3px",
    whiteSpace: "nowrap",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.2s",
  },
  navLabel: {
    fontSize: "14px",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },
  activeIndicator: {
    position: "absolute",
    right: "10px",
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#7C3AED",
  },
  bottom: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "16px",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.03)",
    marginBottom: "4px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    color: "#fff",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F8F8FF",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userHandle: {
    fontSize: "11px",
    color: "#52525B",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
  },
  logoutText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#EF4444",
    whiteSpace: "nowrap",
  },
  collapseBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    cursor: "pointer",
    alignSelf: "center",
    marginTop: "8px",
  },
};
