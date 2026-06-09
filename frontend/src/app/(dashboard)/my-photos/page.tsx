"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  Camera,
  Zap,
  RefreshCw,
  Image,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { authService } from "@/lib/auth";

type ScanState = "idle" | "scanning" | "done";

export default function MyPhotosPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [lightbox, setLightbox] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const user = authService.getUser();

  useEffect(() => {
    fetchMyPhotos();
    checkSelfie();
  }, []);

  const checkSelfie = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data.avatar_url) setSelfieUrl(res.data.avatar_url);
    } catch {}
  };

  const fetchMyPhotos = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai/my-photos");
      setPhotos(res.data || []);
    } catch {
      toast.error("Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    setUploadingSelfie(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/ai/selfie", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelfieUrl(res.data.selfie_url);
      toast.success("Selfie uploaded! Now scan for your photos.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Upload failed");
    } finally {
      setUploadingSelfie(false);
    }
  };

  const handleScan = async () => {
    if (!selfieUrl) {
      toast.error("Upload a selfie first");
      return;
    }
    setScanState("scanning");
    try {
      const res = await api.post("/ai/find-my-photos");
      toast.success(
        `Scanning ${res.data.scanning_count} photos in background...`,
      );
      // Poll for results after 5 seconds
      setTimeout(async () => {
        await fetchMyPhotos();
        setScanState("done");
      }, 6000);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Scan failed");
      setScanState("idle");
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <div>
          <div style={styles.aiBadge}>
            <Sparkles size={12} color="#A78BFA" />
            <span>AI-Powered</span>
          </div>
          <h1 style={styles.title}>My Photos</h1>
          <p style={styles.subtitle}>
            Upload a selfie and our AI finds you in every event photo
          </p>
        </div>
      </motion.div>

      {/* Setup Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={styles.setupCard}
      >
        <div style={styles.setupGlow} />

        <div style={styles.setupContent}>
          {/* Step 1 — Selfie */}
          <div style={styles.step}>
            <div
              style={{
                ...styles.stepNum,
                background: selfieUrl
                  ? "rgba(16,185,129,0.15)"
                  : "rgba(124,58,237,0.15)",
                border: selfieUrl
                  ? "1px solid rgba(16,185,129,0.3)"
                  : "1px solid rgba(124,58,237,0.3)",
              }}
            >
              {selfieUrl ? (
                <CheckCircle size={18} color="#10B981" />
              ) : (
                <Camera size={18} color="#A78BFA" />
              )}
            </div>
            <div style={styles.stepBody}>
              <p style={styles.stepTitle}>Upload Reference Selfie</p>
              <p style={styles.stepSub}>
                A clear front-facing photo works best
              </p>
            </div>

            <div style={styles.stepAction}>
              {selfieUrl && (
                <img
                  src={selfieUrl}
                  alt="selfie"
                  style={styles.selfiePreview}
                />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieUpload}
                style={{ display: "none" }}
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileRef.current?.click()}
                disabled={uploadingSelfie}
                style={{
                  ...styles.selfieBtn,
                  opacity: uploadingSelfie ? 0.7 : 1,
                }}
              >
                {uploadingSelfie ? (
                  <div style={styles.spinner} />
                ) : (
                  <>
                    <Upload size={14} />
                    <span>{selfieUrl ? "Change" : "Upload"}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          <div style={styles.stepDivider} />

          {/* Step 2 — Scan */}
          <div style={styles.step}>
            <div
              style={{
                ...styles.stepNum,
                background:
                  scanState === "done"
                    ? "rgba(16,185,129,0.15)"
                    : "rgba(6,182,212,0.15)",
                border:
                  scanState === "done"
                    ? "1px solid rgba(16,185,129,0.3)"
                    : "1px solid rgba(6,182,212,0.3)",
              }}
            >
              {scanState === "done" ? (
                <CheckCircle size={18} color="#10B981" />
              ) : (
                <Zap size={18} color="#06B6D4" />
              )}
            </div>
            <div style={styles.stepBody}>
              <p style={styles.stepTitle}>Scan Event Photos</p>
              <p style={styles.stepSub}>
                AI scans all uploaded photos for your face
              </p>
            </div>
            <motion.button
              whileHover={{ scale: selfieUrl ? 1.03 : 1 }}
              whileTap={{ scale: selfieUrl ? 0.97 : 1 }}
              onClick={handleScan}
              disabled={!selfieUrl || scanState === "scanning"}
              style={{
                ...styles.scanBtn,
                opacity: !selfieUrl ? 0.4 : 1,
                cursor: !selfieUrl ? "not-allowed" : "pointer",
                background:
                  scanState === "scanning"
                    ? "rgba(6,182,212,0.1)"
                    : "linear-gradient(135deg, #06B6D4, #6366F1)",
              }}
            >
              {scanState === "scanning" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <RefreshCw size={14} color="#06B6D4" />
                  </motion.div>
                  <span style={{ color: "#06B6D4" }}>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Find My Photos</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Scanning animation */}
        <AnimatePresence>
          {scanState === "scanning" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={styles.scanProgress}
            >
              <div style={styles.scanBar}>
                <motion.div
                  animate={{ x: ["0%", "100%", "0%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: "easeInOut",
                  }}
                  style={styles.scanBarFill}
                />
              </div>
              <p style={styles.scanText}>
                AI is scanning photos for your face...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={styles.resultsSection}
      >
        <div style={styles.resultsHeader}>
          <div style={styles.resultsTitle}>
            <Image size={16} color="#7C3AED" />
            <span>
              {loading ? "Loading..." : `${photos.length} photos found`}
            </span>
          </div>
          {photos.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchMyPhotos}
              style={styles.refreshBtn}
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </motion.button>
          )}
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                style={{
                  ...styles.skeletonCard,
                  height: `${[200, 240, 180, 220, 260, 200][i - 1]}px`,
                }}
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.emptyState}
          >
            <div style={styles.emptyIcon}>
              <User size={36} color="#3F3F46" />
            </div>
            <h3 style={styles.emptyTitle}>No photos found yet</h3>
            <p style={styles.emptyText}>
              {selfieUrl
                ? 'Click "Find My Photos" to scan event photos'
                : "Upload a selfie to get started"}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Stats row */}
            <div style={styles.statsRow}>
              {[
                {
                  label: "Photos Found",
                  value: photos.length,
                  color: "#7C3AED",
                },
                {
                  label: "Events",
                  value: new Set(photos.map((p) => p.uploader)).size,
                  color: "#06B6D4",
                },
                {
                  label: "Avg Confidence",
                  value: `${Math.round(
                    (photos.reduce((a, p) => a + (p.confidence || 0), 0) /
                      photos.length) *
                      100,
                  )}%`,
                  color: "#10B981",
                },
              ].map((stat) => (
                <div key={stat.label} style={styles.statCard}>
                  <span style={{ ...styles.statValue, color: stat.color }}>
                    {stat.value}
                  </span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Photo grid */}
            <div style={styles.grid}>
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  onClick={() => setLightbox(photo)}
                  style={styles.photoCard}
                >
                  <img
                    src={photo.thumbnail_url || photo.url}
                    alt=""
                    style={styles.photoImg}
                    loading="lazy"
                  />
                  <div style={styles.photoOverlay} />
                  <div style={styles.photoMeta}>
                    <div style={styles.confidenceBadge}>
                      <Sparkles size={9} color="#A78BFA" />
                      <span>
                        {Math.round((photo.confidence || 0.8) * 100)}% match
                      </span>
                    </div>
                    <div style={styles.photoInfo}>
                      <span style={styles.uploaderText}>@{photo.uploader}</span>
                      <span style={styles.dateText}>
                        {new Date(photo.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.lightboxOverlay}
            onClick={(e) => {
              if (e.target === e.currentTarget) setLightbox(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={styles.lightboxCard}
            >
              <img src={lightbox.url} alt="" style={styles.lightboxImg} />
              <div style={styles.lightboxInfo}>
                <div style={styles.lightboxBadge}>
                  <Sparkles size={11} color="#A78BFA" />
                  <span>
                    {Math.round((lightbox.confidence || 0.8) * 100)}% match
                    confidence
                  </span>
                </div>
                <p style={styles.lightboxUploader}>
                  Uploaded by @{lightbox.uploader}
                </p>
                <p style={styles.lightboxDate}>
                  {new Date(lightbox.uploaded_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {lightbox.tags?.length > 0 && (
                  <div style={styles.tagsRow}>
                    {lightbox.tags.map((tag: string) => (
                      <span key={tag} style={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch(
                        `http://127.0.0.1:8000/media/${lightbox.id}/download`,
                        { headers: { Authorization: `Bearer ${token}` } },
                      );
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `my-photo-${lightbox.id}.jpg`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Downloaded!");
                    } catch {
                      toast.error("Download failed");
                    }
                  }}
                  style={styles.downloadBtn}
                >
                  Download Photo
                </motion.button>
              </div>
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
      "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
    top: "-100px",
    right: "5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  orb2: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
    bottom: "10%",
    left: "10%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: { marginBottom: "28px", position: "relative", zIndex: 1 },
  aiBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "20px",
    marginBottom: "10px",
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.25)",
    fontSize: "11px",
    fontWeight: "600",
    color: "#A78BFA",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#F8F8FF",
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },
  subtitle: { fontSize: "14px", color: "#52525B" },
  setupCard: {
    background: "#101114",
    border: "1px solid rgba(124,58,237,0.15)",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "32px",
    position: "relative",
    overflow: "hidden",
    zIndex: 1,
  },
  setupGlow: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
    top: "-100px",
    right: "-80px",
    pointerEvents: "none",
  },
  setupContent: { display: "flex", flexDirection: "column", gap: "20px" },
  step: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  stepNum: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBody: { flex: 1 },
  stepTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#F8F8FF",
    marginBottom: "3px",
  },
  stepSub: { fontSize: "12px", color: "#52525B" },
  stepAction: { display: "flex", alignItems: "center", gap: "10px" },
  selfiePreview: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(124,58,237,0.4)",
  },
  selfieBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: "8px",
    color: "#A78BFA",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  stepDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.04)",
    margin: "0 8px",
  },
  scanBtn: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  scanProgress: {
    marginTop: "20px",
    padding: "16px",
    background: "rgba(6,182,212,0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(6,182,212,0.15)",
  },
  scanBar: {
    height: "3px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    overflow: "hidden",
    marginBottom: "10px",
    position: "relative",
  },
  scanBarFill: {
    position: "absolute",
    width: "40%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, #06B6D4, transparent)",
    borderRadius: "2px",
  },
  scanText: { fontSize: "13px", color: "#71717A", textAlign: "center" },
  resultsSection: { position: "relative", zIndex: 1 },
  resultsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  resultsTitle: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#F8F8FF",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "8px",
    color: "#71717A",
    fontSize: "13px",
    cursor: "pointer",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statValue: { fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px" },
  statLabel: { fontSize: "12px", color: "#52525B" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "12px",
  },
  skeletonCard: {
    borderRadius: "14px",
    background: "rgba(255,255,255,0.04)",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    gap: "12px",
  },
  emptyIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: "18px", fontWeight: "700", color: "#3F3F46" },
  emptyText: { fontSize: "14px", color: "#27272A" },
  photoCard: {
    borderRadius: "14px",
    overflow: "hidden",
    cursor: "pointer",
    position: "relative",
    height: "220px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  photoImg: { width: "100%", height: "100%", objectFit: "cover" },
  photoOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.8))",
  },
  photoMeta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  confidenceBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    background: "rgba(124,58,237,0.7)",
    backdropFilter: "blur(8px)",
    borderRadius: "6px",
    padding: "3px 8px",
    width: "fit-content",
    fontSize: "10px",
    fontWeight: "600",
    color: "#E9D5FF",
  },
  photoInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploaderText: { fontSize: "11px", color: "#A1A1AA", fontWeight: "500" },
  dateText: { fontSize: "10px", color: "#52525B" },
  lightboxOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    backdropFilter: "blur(20px)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  lightboxCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    overflow: "hidden",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
  },
  lightboxImg: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    background: "#07070A",
  },
  lightboxInfo: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  lightboxBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.25)",
    borderRadius: "8px",
    padding: "4px 10px",
    width: "fit-content",
    fontSize: "12px",
    fontWeight: "600",
    color: "#A78BFA",
  },
  lightboxUploader: { fontSize: "14px", fontWeight: "500", color: "#F8F8FF" },
  lightboxDate: { fontSize: "12px", color: "#52525B" },
  tagsRow: { display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" },
  tag: {
    padding: "3px 10px",
    background: "rgba(124,58,237,0.1)",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#A78BFA",
    fontWeight: "500",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "11px",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 0 20px rgba(124,58,237,0.25)",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
};
