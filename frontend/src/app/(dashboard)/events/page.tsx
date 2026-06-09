"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MapPin,
  Users,
  Image,
  Lock,
  Globe,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const CATEGORIES = [
  "All",
  "Workshop",
  "Trip",
  "Fest",
  "Meet",
  "Competition",
  "Other",
];

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    club_id: "",
    name: "",
    description: "",
    category: "Workshop",
    date: "",
    is_public: true,
  });

  useEffect(() => {
    fetchEvents();
    fetchClubs();
  }, [category]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = category !== "All" ? `?category=${category}` : "";
      const res = await api.get(`/events/${params}`);
      setEvents(res.data || []);
    } catch {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await api.get("/clubs/");
      setClubs(res.data || []);
    } catch {}
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.club_id) {
      toast.error("Select a club");
      return;
    }
    if (!form.name) {
      toast.error("Event name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post(`/events/${form.club_id}`, {
        name: form.name,
        description: form.description,
        category: form.category,
        date: form.date || null,
        is_public: form.is_public,
      });
      setEvents((prev) => [res.data, ...prev]);
      setShowModal(false);
      setForm({
        club_id: "",
        name: "",
        description: "",
        category: "Workshop",
        date: "",
        is_public: true,
      });
      toast.success("Event created!");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const filtered = events.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  );

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
          <h1 style={styles.title}>Events</h1>
          <p style={styles.subtitle}>Manage and discover club events</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          style={styles.createBtn}
        >
          <Plus size={16} />
          <span>New Event</span>
        </motion.button>
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.toolbar}
      >
        <div style={styles.searchWrapper}>
          <Search size={15} color="#52525B" style={styles.searchIcon} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            style={styles.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(124,58,237,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.08)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <div style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(cat)}
              style={{
                ...styles.catBtn,
                background:
                  category === cat
                    ? "rgba(124,58,237,0.15)"
                    : "rgba(255,255,255,0.03)",
                border:
                  category === cat
                    ? "1px solid rgba(124,58,237,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                color: category === cat ? "#A78BFA" : "#71717A",
              }}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Events Grid */}
      {loading ? (
        <div style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={styles.skeletonCard}>
              <div
                style={{
                  ...styles.skeletonBox,
                  height: "140px",
                  marginBottom: "16px",
                  borderRadius: "12px",
                }}
              />
              <div
                style={{
                  ...styles.skeletonBox,
                  height: "16px",
                  width: "70%",
                  marginBottom: "8px",
                }}
              />
              <div
                style={{ ...styles.skeletonBox, height: "12px", width: "50%" }}
              />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.emptyState}
        >
          <Calendar size={48} color="#27272A" />
          <h3 style={styles.emptyTitle}>No events found</h3>
          <p style={styles.emptyText}>
            {search
              ? "Try a different search term"
              : "Create your first event to get started"}
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            style={styles.emptyBtn}
          >
            <Plus size={15} />
            Create Event
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={styles.grid}
        >
          {filtered.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </motion.div>
      )}

      {/* Create Event Modal */}
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
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={styles.modal}
            >
              {/* Modal glow */}
              <div style={styles.modalGlow} />

              <div style={styles.modalHeader}>
                <div style={styles.modalTitleRow}>
                  <div style={styles.modalIcon}>
                    <Sparkles size={16} color="#7C3AED" />
                  </div>
                  <h2 style={styles.modalTitle}>Create Event</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  style={styles.closeBtn}
                >
                  <X size={16} color="#71717A" />
                </motion.button>
              </div>

              <form onSubmit={handleCreate} style={styles.modalForm}>
                {/* Club Select */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Club</label>
                  <select
                    value={form.club_id}
                    onChange={(e) =>
                      setForm({ ...form, club_id: e.target.value })
                    }
                    style={styles.select}
                  >
                    <option value="">Select a club...</option>
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Event Name */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Event Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Annual Photography Walk"
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

                {/* Description */}
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="What's this event about?"
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

                {/* Category + Date row */}
                <div style={styles.row}>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Category</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      style={styles.select}
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ ...styles.fieldGroup, flex: 1 }}>
                    <label style={styles.label}>Date</label>
                    <input
                      type="datetime-local"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      style={styles.input}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(124,58,237,0.5)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    />
                  </div>
                </div>

                {/* Visibility toggle */}
                <div style={styles.toggleRow}>
                  <div>
                    <p style={styles.toggleLabel}>Public Event</p>
                    <p style={styles.toggleSub}>
                      Anyone can discover this event
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setForm({ ...form, is_public: !form.is_public })
                    }
                    style={{
                      ...styles.toggle,
                      background: form.is_public
                        ? "linear-gradient(135deg, #7C3AED, #6366F1)"
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <motion.div
                      animate={{ x: form.is_public ? 20 : 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                      style={styles.toggleThumb}
                    />
                  </motion.button>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={creating}
                  style={{
                    ...styles.submitBtn,
                    opacity: creating ? 0.7 : 1,
                  }}
                >
                  {creating ? (
                    <div style={styles.spinner} />
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Create Event</span>
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

function EventCard({ event, index }: { event: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6, scale: 1.01 }}
      style={styles.eventCard}
    >
      {/* Cover */}
      <div style={styles.eventCover}>
        <div style={styles.coverGradient} />
        <Calendar size={28} color="rgba(255,255,255,0.15)" />
        <div style={styles.coverBadge}>
          {event.is_public ? (
            <>
              <Globe size={11} />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock size={11} />
              <span>Private</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={styles.eventContent}>
        <div style={styles.eventCategoryRow}>
          <span style={styles.eventCategory}>
            {event.category || "General"}
          </span>
        </div>
        <h3 style={styles.eventName}>{event.name}</h3>
        {event.description && (
          <p style={styles.eventDesc}>{event.description}</p>
        )}

        <div style={styles.eventFooter}>
          <div style={styles.eventMeta}>
            <Calendar size={12} color="#52525B" />
            <span style={styles.eventMetaText}>
              {event.date
                ? new Date(event.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Date TBD"}
            </span>
          </div>
          <motion.div whileHover={{ x: 3 }} style={styles.viewBtn}>
            <span style={styles.viewBtnText}>View</span>
            <ArrowUpRight size={13} color="#7C3AED" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
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
    right: "5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "28px",
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
  subtitle: {
    fontSize: "14px",
    color: "#52525B",
  },
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
  toolbar: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "28px",
    position: "relative",
    zIndex: 1,
  },
  searchWrapper: {
    position: "relative",
    maxWidth: "400px",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "11px 16px 11px 40px",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  categories: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  catBtn: {
    padding: "6px 14px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
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
  emptyTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#3F3F46",
  },
  emptyText: {
    fontSize: "14px",
    color: "#27272A",
  },
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
  eventCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  eventCover: {
    height: "130px",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  coverGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, transparent 50%, rgba(16,17,20,0.8))",
  },
  coverBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    fontSize: "11px",
    fontWeight: "500",
    color: "#A1A1AA",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  eventContent: {
    padding: "16px",
  },
  eventCategoryRow: {
    marginBottom: "6px",
  },
  eventCategory: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#7C3AED",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  eventName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F8F8FF",
    marginBottom: "6px",
    letterSpacing: "-0.2px",
  },
  eventDesc: {
    fontSize: "12px",
    color: "#52525B",
    lineHeight: 1.5,
    marginBottom: "12px",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  eventFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.04)",
  },
  eventMeta: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  eventMetaText: {
    fontSize: "12px",
    color: "#52525B",
  },
  viewBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
  },
  viewBtnText: {
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
    maxWidth: "520px",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "32px",
    position: "relative",
    overflow: "hidden",
    maxHeight: "90vh",
    overflowY: "auto",
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
  modalTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
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
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#A1A1AA",
  },
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
  select: {
    padding: "11px 14px",
    background: "#15171B",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "14px",
    width: "100%",
    cursor: "pointer",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
  },
  toggleLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#F8F8FF",
    marginBottom: "2px",
  },
  toggleSub: {
    fontSize: "12px",
    color: "#52525B",
  },
  toggle: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    flexShrink: 0,
    transition: "background 0.2s",
  },
  toggleThumb: {
    position: "absolute",
    top: "3px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
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
    transition: "opacity 0.2s",
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
