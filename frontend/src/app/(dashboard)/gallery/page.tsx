"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  X,
  Heart,
  Download,
  MessageCircle,
  Sparkles,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const FILTERS = ["All", "Photos", "Videos", "Liked", "Mine"];

export default function GalleryPage() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lightbox, setLightbox] = useState<any | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setMedia([]);
    setPage(1);
    setHasMore(true);
    fetchMedia(1, true);
  }, [selectedEvent, filter]);

  useEffect(() => {
    if (page > 1) fetchMedia(page, false);
  }, [page]);

  // Infinite scroll observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore]);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events/");
      setEvents(res.data || []);
    } catch {}
  };

  const fetchMedia = async (pageNum: number, reset: boolean) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      // Get all albums from all events
      const eventsRes = await api.get("/events/");
      const allEvents = eventsRes.data || [];

      let allMedia: any[] = [];

      for (const event of allEvents.slice(0, 5)) {
        try {
          const albumsRes = await api.get(`/events/${event.id}/albums`);
          const albums = albumsRes.data || [];
          for (const album of albums) {
            try {
              const mediaRes = await api.get(
                `/media/album/${album.id}?page=${pageNum}&limit=12`,
              );
              const items = (mediaRes.data?.items || []).map((m: any) => ({
                ...m,
                eventName: event.name,
                albumName: album.name,
              }));
              allMedia = [...allMedia, ...items];
            } catch {}
          }
        } catch {}
      }

      if (reset) {
        setMedia(allMedia);
      } else {
        setMedia((prev) => [...prev, ...allMedia]);
      }
      setHasMore(allMedia.length >= 12);
    } catch {
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const filtered = media.filter((m) => {
    const matchSearch = search
      ? m.caption?.toLowerCase().includes(search.toLowerCase()) ||
        m.eventName?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchFilter =
      filter === "All"
        ? true
        : filter === "Photos"
          ? m.media_type === "PHOTO"
          : filter === "Videos"
            ? m.media_type === "VIDEO"
            : true;
    return matchSearch && matchFilter;
  });

  const openLightbox = (item: any, index: number) => {
    setLightbox(item);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightbox(null);

  const prevPhoto = () => {
    const newIndex = (lightboxIndex - 1 + filtered.length) % filtered.length;
    setLightbox(filtered[newIndex]);
    setLightboxIndex(newIndex);
  };

  const nextPhoto = () => {
    const newIndex = (lightboxIndex + 1) % filtered.length;
    setLightbox(filtered[newIndex]);
    setLightboxIndex(newIndex);
  };

  // Split into 3 columns for masonry
  const columns: any[][] = [[], [], []];
  filtered.forEach((item, i) => {
    columns[i % 3].push({ ...item, _index: i });
  });

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
          <h1 style={styles.title}>Gallery</h1>
          <p style={styles.subtitle}>Browse all event photos and videos</p>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.toolbar}
      >
        {/* Search */}
        <div style={styles.searchWrapper}>
          <Search size={15} color="#52525B" style={styles.searchIcon} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search photos, events..."
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
          {search && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearch("")}
              style={styles.clearSearch}
            >
              <X size={13} color="#71717A" />
            </motion.button>
          )}
        </div>

        {/* Event filter */}
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={styles.eventSelect}
        >
          <option value="">All Events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>

        {/* Type filters */}
        <div style={styles.filters}>
          {FILTERS.map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                background:
                  filter === f
                    ? "rgba(124,58,237,0.15)"
                    : "rgba(255,255,255,0.03)",
                border:
                  filter === f
                    ? "1px solid rgba(124,58,237,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                color: filter === f ? "#A78BFA" : "#71717A",
              }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Gallery */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <>
          {/* Masonry Grid */}
          <div style={styles.masonryGrid}>
            {columns.map((col, colIndex) => (
              <div key={colIndex} style={styles.masonryCol}>
                {col.map((item, i) => (
                  <GalleryCard
                    key={item.id}
                    item={item}
                    index={i}
                    onClick={() => openLightbox(item, item._index)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} style={{ height: "40px", marginTop: "20px" }}>
            {loadingMore && (
              <div style={styles.loadingMore}>
                <div style={styles.loadingDots}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.2,
                        delay: i * 0.2,
                      }}
                      style={styles.dot}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            item={lightbox}
            onClose={closeLightbox}
            onPrev={prevPhoto}
            onNext={nextPhoto}
            total={filtered.length}
            current={lightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Gallery Card ────────────────────────────────────────────────────
function GalleryCard({
  item,
  index,
  onClick,
}: {
  item: any;
  index: number;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const heights = [200, 260, 220, 300, 180, 240];
  const h = heights[index % heights.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        ...styles.card,
        height: `${h}px`,
        marginBottom: "12px",
      }}
    >
      {/* Image */}
      {item.url ? (
        <img
          src={item.thumbnail_url || item.url}
          alt={item.caption || ""}
          style={styles.cardImg}
          loading="lazy"
        />
      ) : (
        <div style={styles.cardPlaceholder}>
          <Sparkles size={24} color="#3F3F46" />
        </div>
      )}

      {/* Gradient overlay */}
      <div
        style={{
          ...styles.cardOverlay,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Hover actions */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.cardActions}
          >
            <div style={styles.cardTopRow}>
              {item.tags?.length > 0 && (
                <div style={styles.aiTag}>
                  <Sparkles size={9} color="#A78BFA" />
                  <span>{item.tags[0]}</span>
                </div>
              )}
            </div>
            <div style={styles.cardBottomRow}>
              <div style={styles.cardStats}>
                <div style={styles.statChip}>
                  <Heart size={11} color="#F8F8FF" />
                  <span>{item.like_count || 0}</span>
                </div>
                <div style={styles.statChip}>
                  <MessageCircle size={11} color="#F8F8FF" />
                  <span>{item.comment_count || 0}</span>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={styles.zoomBtn}
              >
                <ZoomIn size={14} color="#fff" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event badge */}
      {item.eventName && <div style={styles.eventBadge}>{item.eventName}</div>}
    </motion.div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────
function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
  total,
  current,
}: {
  item: any;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  total: number;
  current: number;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.lightboxOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        style={styles.lightboxClose}
      >
        <X size={18} color="#F8F8FF" />
      </motion.button>

      {/* Counter */}
      <div style={styles.lightboxCounter}>
        {current + 1} / {total}
      </div>

      {/* Prev */}
      <motion.button
        whileHover={{ scale: 1.1, x: -2 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPrev}
        style={{ ...styles.lightboxNav, left: "24px" }}
      >
        <ChevronLeft size={22} color="#F8F8FF" />
      </motion.button>

      {/* Image */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.25 }}
        style={styles.lightboxContent}
      >
        <img
          src={item.url}
          alt={item.caption || ""}
          style={styles.lightboxImg}
        />

        {/* Info panel */}
        <div style={styles.lightboxInfo}>
          <div style={styles.lightboxMeta}>
            <div>
              {item.caption && (
                <p style={styles.lightboxCaption}>{item.caption}</p>
              )}
              <p style={styles.lightboxEvent}>
                {item.eventName} · {item.albumName}
              </p>
              <p style={styles.lightboxUploader}>by @{item.uploader}</p>
            </div>
            <div style={styles.lightboxActions}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.lightboxActionBtn}
              >
                <Heart size={15} color="#F8F8FF" />
                <span>{item.like_count || 0}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.lightboxActionBtn}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(
                      `http://127.0.0.1:8000/media/${item.id}/download`,
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `cig-media-${item.id}.jpg`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("Downloaded with watermark!");
                  } catch {
                    toast.error("Download failed");
                  }
                }}
              >
                <Download size={15} color="#F8F8FF" />
                <span>Download</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={styles.lightboxActionBtn}
                onClick={() => {
                  navigator.clipboard.writeText(item.url);
                  toast.success("Link copied!");
                }}
              >
                <Share2 size={15} color="#F8F8FF" />
                <span>Share</span>
              </motion.button>
            </div>
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div style={styles.tagsRow}>
              {item.tags.map((tag: string) => (
                <span key={tag} style={styles.tag}>
                  <Sparkles size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.1, x: 2 }}
        whileTap={{ scale: 0.9 }}
        onClick={onNext}
        style={{ ...styles.lightboxNav, right: "24px" }}
      >
        <ChevronRight size={22} color="#F8F8FF" />
      </motion.button>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────
function SkeletonGrid() {
  const heights = [200, 260, 220, 300, 180, 240, 200, 260, 220];
  return (
    <div style={styles.masonryGrid}>
      {[0, 1, 2].map((col) => (
        <div key={col} style={styles.masonryCol}>
          {heights
            .filter((_, i) => i % 3 === col)
            .map((h, i) => (
              <div
                key={i}
                style={{
                  height: `${h}px`,
                  borderRadius: "14px",
                  background: "rgba(255,255,255,0.04)",
                  animation: "pulse 1.5s ease-in-out infinite",
                  marginBottom: "12px",
                }}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.emptyState}
    >
      <Sparkles size={48} color="#27272A" />
      <h3 style={styles.emptyTitle}>No media found</h3>
      <p style={styles.emptyText}>
        {search
          ? `No results for "${search}"`
          : "Upload photos to events to see them here"}
      </p>
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    padding: "40px",
    minHeight: "100vh",
    position: "relative",
  },
  orb1: {
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)",
    top: "-100px",
    right: "5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
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
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
    flexWrap: "wrap",
    position: "relative",
    zIndex: 1,
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: "200px",
    maxWidth: "320px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 36px",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "13px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  clearSearch: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    padding: "2px",
  },
  eventSelect: {
    padding: "10px 14px",
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#A1A1AA",
    fontSize: "13px",
    cursor: "pointer",
  },
  filters: {
    display: "flex",
    gap: "6px",
  },
  filterBtn: {
    padding: "7px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  masonryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    position: "relative",
    zIndex: 1,
  },
  masonryCol: {
    display: "flex",
    flexDirection: "column",
  },
  card: {
    borderRadius: "14px",
    overflow: "hidden",
    cursor: "pointer",
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04))",
  },
  cardOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)",
    transition: "opacity 0.25s ease",
  },
  cardActions: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "10px",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  aiTag: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: "600",
    color: "#A78BFA",
    border: "1px solid rgba(124,58,237,0.3)",
  },
  cardBottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardStats: {
    display: "flex",
    gap: "6px",
  },
  statChip: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    borderRadius: "6px",
    padding: "3px 7px",
    fontSize: "11px",
    color: "#F8F8FF",
    fontWeight: "500",
  },
  zoomBtn: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "rgba(124,58,237,0.7)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  eventBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "10px",
    fontWeight: "500",
    color: "#A1A1AA",
    border: "1px solid rgba(255,255,255,0.08)",
    maxWidth: "100px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  loadingMore: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
  },
  loadingDots: {
    display: "flex",
    gap: "6px",
    alignItems: "center",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7C3AED",
  },
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.92)",
    backdropFilter: "blur(20px)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
  },
  lightboxCounter: {
    position: "absolute",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "13px",
    color: "#71717A",
    fontWeight: "500",
    zIndex: 10,
  },
  lightboxNav: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
  },
  lightboxContent: {
    maxWidth: "900px",
    width: "100%",
    margin: "0 80px",
    background: "#101114",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  lightboxImg: {
    width: "100%",
    maxHeight: "60vh",
    objectFit: "contain",
    background: "#07070A",
  },
  lightboxInfo: {
    padding: "20px 24px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
  },
  lightboxMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  lightboxCaption: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#F8F8FF",
    marginBottom: "4px",
  },
  lightboxEvent: {
    fontSize: "12px",
    color: "#71717A",
    marginBottom: "2px",
  },
  lightboxUploader: {
    fontSize: "12px",
    color: "#52525B",
  },
  lightboxActions: {
    display: "flex",
    gap: "8px",
  },
  lightboxActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "9px",
    color: "#F8F8FF",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  tagsRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  tag: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 10px",
    background: "rgba(124,58,237,0.1)",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#A78BFA",
    fontWeight: "500",
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
};
