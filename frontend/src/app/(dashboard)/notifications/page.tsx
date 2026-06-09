"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Heart,
  MessageCircle,
  Tag,
  CheckCheck,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const TYPE_ICON: Record<string, any> = {
  LIKE: { icon: Heart, color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
  COMMENT: { icon: MessageCircle, color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
  TAG: { icon: Tag, color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  UPLOAD: { icon: Sparkles, color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/social/notifications");
      setNotifications(res.data || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/social/notifications/read");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={styles.root}>
      <div style={styles.orb1} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={markAllRead}
            style={styles.markBtn}
          >
            <CheckCheck size={15} />
            <span>Mark all read</span>
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={styles.list}
      >
        {loading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={styles.skeletonRow}>
              <div
                style={{
                  ...styles.skeletonBox,
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    ...styles.skeletonBox,
                    height: "14px",
                    width: "70%",
                    marginBottom: "8px",
                  }}
                />
                <div
                  style={{
                    ...styles.skeletonBox,
                    height: "11px",
                    width: "40%",
                  }}
                />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={48} color="#27272A" />
            <h3 style={styles.emptyTitle}>No notifications yet</h3>
            <p style={styles.emptyText}>Activity will appear here</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((notif, i) => {
              const config = TYPE_ICON[notif.type] || TYPE_ICON.UPLOAD;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    ...styles.notifRow,
                    background: notif.is_read
                      ? "rgba(255,255,255,0.01)"
                      : "rgba(124,58,237,0.04)",
                    borderColor: notif.is_read
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(124,58,237,0.12)",
                  }}
                >
                  <div style={{ ...styles.notifIcon, background: config.bg }}>
                    <Icon size={18} color={config.color} />
                  </div>
                  <div style={styles.notifBody}>
                    <p style={styles.notifMessage}>{notif.message}</p>
                    <p style={styles.notifTime}>
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notif.is_read && <div style={styles.unreadDot} />}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { padding: "40px", minHeight: "100vh", position: "relative" },
  orb1: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
    top: "-100px",
    right: "5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "32px",
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#F8F8FF",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  subtitle: { fontSize: "14px", color: "#52525B" },
  markBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: "10px",
    color: "#A78BFA",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    position: "relative",
    zIndex: 1,
    maxWidth: "680px",
  },
  skeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "14px",
  },
  skeletonBox: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "6px",
    animation: "pulse 1.5s ease-in-out infinite",
    display: "block",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "12px",
  },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#3F3F46" },
  emptyText: { fontSize: "14px", color: "#27272A" },
  notifRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "16px 18px",
    border: "1px solid",
    borderRadius: "14px",
    transition: "background 0.2s",
  },
  notifIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notifBody: { flex: 1 },
  notifMessage: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#F8F8FF",
    marginBottom: "4px",
  },
  notifTime: { fontSize: "12px", color: "#52525B" },
  unreadDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#7C3AED",
    flexShrink: 0,
  },
};
