"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Image,
  Calendar,
  Users,
  TrendingUp,
  Upload,
  Star,
  Bell,
  ArrowUpRight,
  Sparkles,
  Zap,
  Eye,
} from "lucide-react";
import { authService } from "@/lib/auth";
import api from "@/lib/api";
import Link from "next/link";

interface Stats {
  total_events: number;
  total_media: number;
  total_clubs: number;
  total_likes: number;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function DashboardPage() {
  const user = authService.getUser();
  const [stats, setStats] = useState<Stats>({
    total_events: 0,
    total_media: 0,
    total_clubs: 0,
    total_likes: 0,
  });
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await api.get("/events/?limit=5");
        setEvents(eventsRes.data?.slice(0, 5) || []);
        setStats((s) => ({ ...s, total_events: eventsRes.data?.length || 0 }));
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Events",
      value: stats.total_events,
      icon: Calendar,
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.1)",
      border: "rgba(124,58,237,0.2)",
    },
    {
      label: "Photos Uploaded",
      value: stats.total_media,
      icon: Image,
      color: "#06B6D4",
      bg: "rgba(6,182,212,0.1)",
      border: "rgba(6,182,212,0.2)",
    },
    {
      label: "Clubs Joined",
      value: stats.total_clubs,
      icon: Users,
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      label: "Total Likes",
      value: stats.total_likes,
      icon: Star,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
  ];

  return (
    <div style={styles.root}>
      {/* Background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Header */}
      <motion.div>
        <div>
          <h1 style={styles.greeting}>
            Good {getTimeOfDay()},{" "}
            <span style={styles.greetingName}>
              {user?.full_name?.split(" ")[0]}
            </span>{" "}
            👋
          </h1>
          <p style={styles.headerSub}>
            Here's what's happening on your platform today.
          </p>
        </div>

        <div style={styles.headerActions}>
          <Link href="/dashboard/upload">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={styles.uploadBtn}
            >
              <Upload size={15} />
              <span>Upload</span>
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.08,
              duration: 0.5,
              ease: "easeOut",
            }}
            whileHover={{ y: -4, scale: 1.02 }}
            style={{
              ...styles.statCard,
              border: `1px solid ${card.border}`,
            }}
          >
            <div style={{ ...styles.statIcon, background: card.bg }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={styles.statValue}>
              {loading ? (
                <div style={styles.skeleton} />
              ) : (
                <span style={{ ...styles.statNumber, color: card.color }}>
                  {card.value}
                </span>
              )}
              <span style={styles.statLabel}>{card.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bento Grid */}
      <div style={styles.bentoGrid}>
        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          style={{ ...styles.bentoCard, gridColumn: "span 2" }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <Calendar size={16} color="#7C3AED" />
              <span>Recent Events</span>
            </div>
            <Link href="/dashboard/events">
              <motion.div whileHover={{ x: 2 }} style={styles.cardLink}>
                <span>View all</span>
                <ArrowUpRight size={13} />
              </motion.div>
            </Link>
          </div>

          <div style={styles.eventList}>
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} style={styles.eventSkeletonRow}>
                  <div
                    style={{
                      ...styles.skeletonBox,
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        ...styles.skeletonBox,
                        width: "60%",
                        height: "14px",
                        marginBottom: "6px",
                      }}
                    />
                    <div
                      style={{
                        ...styles.skeletonBox,
                        width: "40%",
                        height: "11px",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : events.length === 0 ? (
              <div style={styles.emptyState}>
                <Calendar size={32} color="#3F3F46" />
                <p style={styles.emptyText}>No events yet</p>
                <Link href="/dashboard/events">
                  <span style={styles.emptyLink}>
                    Create your first event →
                  </span>
                </Link>
              </div>
            ) : (
              events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  whileHover={{ x: 4 }}
                  style={styles.eventRow}
                >
                  <div style={styles.eventThumb}>
                    <Calendar size={16} color="#7C3AED" />
                  </div>
                  <div style={styles.eventInfo}>
                    <span style={styles.eventName}>{event.name}</span>
                    <span style={styles.eventMeta}>
                      {event.category || "General"} •{" "}
                      {event.date
                        ? new Date(event.date).toLocaleDateString()
                        : "No date"}
                    </span>
                  </div>
                  <div
                    style={{
                      ...styles.eventBadge,
                      background: event.is_public
                        ? "rgba(16,185,129,0.1)"
                        : "rgba(245,158,11,0.1)",
                      color: event.is_public ? "#10B981" : "#F59E0B",
                      border: `1px solid ${
                        event.is_public
                          ? "rgba(16,185,129,0.2)"
                          : "rgba(245,158,11,0.2)"
                      }`,
                    }}
                  >
                    {event.is_public ? "Public" : "Private"}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* AI Features Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{ ...styles.bentoCard, ...styles.aiCard }}
        >
          <div style={styles.aiGlow} />
          <Sparkles
            size={28}
            color="#7C3AED"
            style={{ marginBottom: "16px" }}
          />
          <h3 style={styles.aiTitle}>AI-Powered</h3>
          <p style={styles.aiDesc}>
            Facial recognition finds you in every photo automatically.
          </p>
          <Link href="/dashboard/my-photos">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={styles.aiBtn}
            >
              <Zap size={14} />
              Find My Photos
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={styles.bentoCard}
        >
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <Zap size={16} color="#06B6D4" />
              <span>Quick Actions</span>
            </div>
          </div>
          <div style={styles.quickActions}>
            {[
              {
                label: "New Event",
                href: "/dashboard/events",
                icon: Calendar,
                color: "#7C3AED",
              },
              {
                label: "Upload Photos",
                href: "/dashboard/upload",
                icon: Upload,
                color: "#06B6D4",
              },
              {
                label: "Browse Gallery",
                href: "/dashboard/gallery",
                icon: Eye,
                color: "#10B981",
              },
              {
                label: "Notifications",
                href: "/dashboard/notifications",
                icon: Bell,
                color: "#F59E0B",
              },
            ].map((action, i) => (
              <Link key={action.label} href={action.href}>
                <motion.div
                  whileHover={{ x: 4, background: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.97 }}
                  style={styles.quickAction}
                >
                  <div
                    style={{
                      ...styles.quickActionIcon,
                      background: `${action.color}18`,
                    }}
                  >
                    <action.icon size={14} color={action.color} />
                  </div>
                  <span style={styles.quickActionLabel}>{action.label}</span>
                  <ArrowUpRight size={13} color="#52525B" />
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          style={{ ...styles.bentoCard, gridColumn: "span 2" }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <TrendingUp size={16} color="#10B981" />
              <span>Platform Activity</span>
            </div>
          </div>
          <div style={styles.activityEmpty}>
            <TrendingUp size={32} color="#3F3F46" />
            <p style={styles.emptyText}>
              Activity will appear here as you use the platform
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    padding: "40px",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
    top: "-100px",
    right: "10%",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
    bottom: "10%",
    left: "20%",
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
  greeting: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#F8F8FF",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  greetingName: {
    background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  headerSub: {
    fontSize: "14px",
    color: "#52525B",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 18px",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(124,58,237,0.3)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
    position: "relative",
    zIndex: 1,
  },
  statCard: {
    background: "#101114",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    cursor: "default",
  },
  statIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statValue: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  statNumber: {
    fontSize: "26px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#52525B",
    fontWeight: "500",
  },
  skeleton: {
    width: "48px",
    height: "26px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  bentoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },
  bentoCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "24px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#F8F8FF",
  },
  cardLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#52525B",
    cursor: "pointer",
  },
  eventList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  eventSkeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 0",
  },
  skeletonBox: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "6px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    gap: "8px",
  },
  emptyText: {
    fontSize: "13px",
    color: "#3F3F46",
  },
  emptyLink: {
    fontSize: "13px",
    color: "#7C3AED",
    cursor: "pointer",
  },
  eventRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  eventThumb: {
    width: "36px",
    height: "36px",
    borderRadius: "9px",
    background: "rgba(124,58,237,0.1)",
    border: "1px solid rgba(124,58,237,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  eventInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  eventName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F8F8FF",
  },
  eventMeta: {
    fontSize: "11px",
    color: "#52525B",
  },
  eventBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
  },
  aiCard: {
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.05))",
    border: "1px solid rgba(124,58,237,0.2)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  aiGlow: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
    top: "-60px",
    right: "-60px",
    pointerEvents: "none",
  },
  aiTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#F8F8FF",
    letterSpacing: "-0.3px",
    marginBottom: "8px",
  },
  aiDesc: {
    fontSize: "13px",
    color: "#71717A",
    lineHeight: 1.6,
    marginBottom: "20px",
  },
  aiBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 16px",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    width: "fit-content",
    boxShadow: "0 0 20px rgba(124,58,237,0.3)",
  },
  quickActions: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 10px",
    borderRadius: "9px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  quickActionIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  quickActionLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#A1A1AA",
    flex: 1,
  },
  activityEmpty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 0",
    gap: "10px",
  },
};
