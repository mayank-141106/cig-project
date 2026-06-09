"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Image,
  Calendar,
  Heart,
  TrendingUp,
  Sparkles,
  Crown,
  Activity,
} from "lucide-react";
import api from "@/lib/api";

const COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

export default function AdminPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, clubsRes] = await Promise.all([
        api.get("/events/"),
        api.get("/clubs/"),
      ]);
      setEvents(eventsRes.data || []);
      setClubs(clubsRes.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // Build chart data from events
  const categoryData = events.reduce((acc: any[], event: any) => {
    const cat = event.category || "General";
    const existing = acc.find((a) => a.name === cat);
    if (existing) existing.count++;
    else acc.push({ name: cat, count: 1 });
    return acc;
  }, []);

  const monthlyData = events.reduce((acc: any[], event: any) => {
    const month = new Date(event.created_at).toLocaleString("default", {
      month: "short",
    });
    const existing = acc.find((a) => a.month === month);
    if (existing) existing.events++;
    else acc.push({ month, events: 1 });
    return acc;
  }, []);

  const visibilityData = [
    { name: "Public", value: events.filter((e) => e.is_public).length },
    { name: "Private", value: events.filter((e) => !e.is_public).length },
  ];

  const stats = [
    {
      label: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "#7C3AED",
      bg: "rgba(124,58,237,0.1)",
      border: "rgba(124,58,237,0.2)",
    },
    {
      label: "Total Clubs",
      value: clubs.length,
      icon: Users,
      color: "#06B6D4",
      bg: "rgba(6,182,212,0.1)",
      border: "rgba(6,182,212,0.2)",
    },
    {
      label: "Public Events",
      value: events.filter((e) => e.is_public).length,
      icon: TrendingUp,
      color: "#10B981",
      bg: "rgba(16,185,129,0.1)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      label: "Private Events",
      value: events.filter((e) => !e.is_public).length,
      icon: Crown,
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.1)",
      border: "rgba(245,158,11,0.2)",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ ...styles.tooltipValue, color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div style={styles.root}>
      <div style={styles.orb1} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div>
          <h1 style={styles.title}>Analytics</h1>
          <p style={styles.subtitle}>Platform overview and insights</p>
        </div>
        <div style={styles.aiBadge}>
          <Activity size={13} color="#A78BFA" />
          <span>Live Data</span>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            style={{ ...styles.statCard, border: `1px solid ${stat.border}` }}
          >
            <div style={{ ...styles.statIcon, background: stat.bg }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              {loading ? (
                <div style={styles.skeleton} />
              ) : (
                <p style={{ ...styles.statValue, color: stat.color }}>
                  {stat.value}
                </p>
              )}
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Events by Month */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ ...styles.chartCard, gridColumn: "span 2" }}
        >
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>
              <TrendingUp size={15} color="#7C3AED" />
              <span>Events Over Time</span>
            </div>
          </div>
          {monthlyData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  dot={{ fill: "#7C3AED", r: 4 }}
                  activeDot={{ r: 6, fill: "#A78BFA" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Visibility Pie */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={styles.chartCard}
        >
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>
              <Sparkles size={15} color="#06B6D4" />
              <span>Event Visibility</span>
            </div>
          </div>
          {visibilityData.every((d) => d.value === 0) ? (
            <EmptyChart />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={visibilityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {visibilityData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.legend}>
                {visibilityData.map((d, i) => (
                  <div key={d.name} style={styles.legendItem}>
                    <div
                      style={{ ...styles.legendDot, background: COLORS[i] }}
                    />
                    <span style={styles.legendText}>
                      {d.name}: {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Events by Category */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ ...styles.chartCard, gridColumn: "span 2" }}
        >
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>
              <Calendar size={15} color="#10B981" />
              <span>Events by Category</span>
            </div>
          </div>
          {categoryData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#52525B", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Clubs List */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={styles.chartCard}
        >
          <div style={styles.chartHeader}>
            <div style={styles.chartTitle}>
              <Users size={15} color="#F59E0B" />
              <span>All Clubs</span>
            </div>
          </div>
          <div style={styles.clubList}>
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} style={styles.clubSkeletonRow}>
                  <div
                    style={{
                      ...styles.skeletonBox,
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        ...styles.skeletonBox,
                        height: "13px",
                        width: "60%",
                        marginBottom: "6px",
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
            ) : clubs.length === 0 ? (
              <p style={styles.noData}>No clubs yet</p>
            ) : (
              clubs.map((club, i) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={styles.clubRow}
                >
                  <div style={styles.clubAvatar}>
                    <Users size={14} color="#7C3AED" />
                  </div>
                  <div style={styles.clubInfo}>
                    <span style={styles.clubName}>{club.name}</span>
                    <span style={styles.clubSub}>
                      {events.filter((e) => e.club_id === club.id).length}{" "}
                      events
                    </span>
                  </div>
                  <div style={styles.clubBadge}>
                    {events.filter((e) => e.club_id === club.id).length > 0 ? (
                      <span style={styles.activeBadge}>Active</span>
                    ) : (
                      <span style={styles.inactiveBadge}>New</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div
      style={{
        height: "180px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p style={{ fontSize: "13px", color: "#3F3F46" }}>No data yet</p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: { padding: "40px", minHeight: "100vh", position: "relative" },
  orb1: {
    position: "fixed",
    width: "500px",
    height: "500px",
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
    alignItems: "center",
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
  aiBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    background: "rgba(124,58,237,0.1)",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#A78BFA",
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
    fontSize: "26px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "#52525B",
    fontWeight: "500",
    marginTop: "3px",
  },
  skeleton: {
    width: "48px",
    height: "26px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },
  chartCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "24px",
  },
  chartHeader: { marginBottom: "20px" },
  chartTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#F8F8FF",
  },
  tooltip: {
    background: "#15171B",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "10px 14px",
  },
  tooltipLabel: { fontSize: "12px", color: "#71717A", marginBottom: "4px" },
  tooltipValue: { fontSize: "13px", fontWeight: "600" },
  legend: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginTop: "12px",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "6px" },
  legendDot: { width: "8px", height: "8px", borderRadius: "50%" },
  legendText: { fontSize: "12px", color: "#71717A" },
  clubList: { display: "flex", flexDirection: "column", gap: "8px" },
  clubSkeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
  },
  skeletonBox: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "6px",
    animation: "pulse 1.5s ease-in-out infinite",
    display: "block",
  },
  noData: {
    fontSize: "13px",
    color: "#3F3F46",
    textAlign: "center",
    padding: "20px 0",
  },
  clubRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  clubAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "rgba(124,58,237,0.1)",
    border: "1px solid rgba(124,58,237,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  clubInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  clubName: { fontSize: "13px", fontWeight: "600", color: "#F8F8FF" },
  clubSub: { fontSize: "11px", color: "#52525B" },
  clubBadge: {},
  activeBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "rgba(16,185,129,0.1)",
    color: "#10B981",
    border: "1px solid rgba(16,185,129,0.2)",
  },
  inactiveBadge: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    color: "#71717A",
    border: "1px solid rgba(255,255,255,0.08)",
  },
};
