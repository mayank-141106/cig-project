"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  X,
  Sparkles,
  ArrowUpRight,
  Crown,
  Camera,
  User,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { authService } from "@/lib/auth";

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const user = authService.getUser();

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/clubs/");
      setClubs(res.data || []);
      // Mark which clubs current user is a member of
      const memberships =
        res.data
          ?.filter((c: any) => c.created_by === user?.id)
          ?.map((c: any) => c.id) || [];
      setMyClubs(memberships);
    } catch {
      toast.error("Failed to load clubs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Club name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/clubs/", form);
      setClubs((prev) => [res.data, ...prev]);
      setMyClubs((prev) => [...prev, res.data.id]);
      setShowModal(false);
      setForm({ name: "", description: "" });
      toast.success("Club created!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create club");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (clubId: string) => {
    setJoining(clubId);
    try {
      await api.post(`/clubs/${clubId}/join`);
      setMyClubs((prev) => [...prev, clubId]);
      toast.success("Joined club!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  const roleIcon = (club: any) => {
    if (club.created_by === user?.id)
      return <Crown size={11} color="#F59E0B" />;
    return <User size={11} color="#71717A" />;
  };

  const roleLabel = (club: any) => {
    if (club.created_by === user?.id) return "Admin";
    if (myClubs.includes(club.id)) return "Member";
    return null;
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
          <h1 style={styles.title}>Clubs</h1>
          <p style={styles.subtitle}>Join clubs to access events and media</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          style={styles.createBtn}
        >
          <Plus size={16} />
          <span>New Club</span>
        </motion.button>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.skeletonCard}>
              <div
                style={{
                  ...styles.skeletonBox,
                  height: "80px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                }}
              />
              <div
                style={{
                  ...styles.skeletonBox,
                  height: "16px",
                  width: "60%",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{ ...styles.skeletonBox, height: "12px", width: "80%" }}
              />
            </div>
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.emptyState}
        >
          <Users size={48} color="#27272A" />
          <h3 style={styles.emptyTitle}>No clubs yet</h3>
          <p style={styles.emptyText}>Create the first club to get started</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            style={styles.emptyBtn}
          >
            <Plus size={15} /> Create Club
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={styles.grid}
        >
          {clubs.map((club, i) => {
            const isMember = myClubs.includes(club.id);
            const isOwner = club.created_by === user?.id;
            const label = roleLabel(club);

            return (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, scale: 1.01 }}
                style={styles.clubCard}
              >
                {/* Cover */}
                <div style={styles.clubCover}>
                  <div style={styles.coverGlow} />
                  <Users size={32} color="rgba(124,58,237,0.3)" />
                  {label && (
                    <div
                      style={{
                        ...styles.roleBadge,
                        background: isOwner
                          ? "rgba(245,158,11,0.15)"
                          : "rgba(255,255,255,0.08)",
                        border: isOwner
                          ? "1px solid rgba(245,158,11,0.3)"
                          : "1px solid rgba(255,255,255,0.1)",
                        color: isOwner ? "#F59E0B" : "#A1A1AA",
                      }}
                    >
                      {roleIcon(club)}
                      <span>{label}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={styles.clubContent}>
                  <h3 style={styles.clubName}>{club.name}</h3>
                  {club.description && (
                    <p style={styles.clubDesc}>{club.description}</p>
                  )}

                  <div style={styles.clubFooter}>
                    {isMember ? (
                      <div style={styles.memberTag}>
                        <Camera size={12} color="#10B981" />
                        <span>Access granted</span>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleJoin(club.id)}
                        disabled={joining === club.id}
                        style={styles.joinBtn}
                      >
                        {joining === club.id ? "Joining..." : "Join Club"}
                      </motion.button>
                    )}
                    <motion.div whileHover={{ x: 2 }} style={styles.viewLink}>
                      <span>View</span>
                      <ArrowUpRight size={13} color="#7C3AED" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.overlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={styles.modal}
            >
              <div style={styles.modalGlow} />

              <div style={styles.modalHeader}>
                <div style={styles.modalTitleRow}>
                  <div style={styles.modalIcon}>
                    <Sparkles size={15} color="#7C3AED" />
                  </div>
                  <h2 style={styles.modalTitle}>Create Club</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  style={styles.closeBtn}
                >
                  <X size={15} color="#71717A" />
                </motion.button>
              </div>

              <form onSubmit={handleCreate} style={styles.form}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Club Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Photography Club"
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(124,58,237,0.5)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(124,58,237,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="What is this club about?"
                    rows={3}
                    style={styles.textarea}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(124,58,237,0.5)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(124,58,237,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={creating}
                  style={{ ...styles.submitBtn, opacity: creating ? 0.7 : 1 }}
                >
                  {creating ? (
                    <div style={styles.spinner} />
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Club</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  createBtn: {
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
    boxShadow: "0 0 20px rgba(124,58,237,0.25)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
    position: "relative",
    zIndex: 1,
  },
  skeletonCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "16px",
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
  emptyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 18px",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.3)",
    borderRadius: "10px",
    color: "#A78BFA",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
  clubCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
  },
  clubCover: {
    height: "100px",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(99,102,241,0.06))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  coverGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)",
  },
  roleBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  clubContent: { padding: "16px" },
  clubName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F8F8FF",
    marginBottom: "6px",
  },
  clubDesc: {
    fontSize: "12px",
    color: "#52525B",
    lineHeight: 1.5,
    marginBottom: "14px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  clubFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  },
  memberTag: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    color: "#10B981",
    fontWeight: "500",
  },
  joinBtn: {
    padding: "6px 14px",
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: "8px",
    color: "#A78BFA",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  viewLink: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    color: "#7C3AED",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "24px",
  },
  modal: {
    width: "100%",
    maxWidth: "460px",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
  },
  modalGlow: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
    top: "-100px",
    right: "-80px",
    pointerEvents: "none",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  modalTitleRow: { display: "flex", alignItems: "center", gap: "10px" },
  modalIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#F8F8FF",
    letterSpacing: "-0.3px",
  },
  closeBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  fieldGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#A1A1AA" },
  input: {
    padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
  },
  textarea: {
    padding: "11px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "14px",
    resize: "vertical",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
    fontFamily: "inherit",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "13px",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(124,58,237,0.25)",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
