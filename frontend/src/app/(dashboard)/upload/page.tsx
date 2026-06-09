"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Image,
  Film,
  Sparkles,
  FolderOpen,
  ChevronDown,
  Loader,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface FileItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [caption, setCaption] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) fetchEvents(selectedClub);
    setSelectedEvent("");
    setSelectedAlbum("");
    setEvents([]);
    setAlbums([]);
  }, [selectedClub]);

  useEffect(() => {
    if (selectedEvent) fetchAlbums(selectedEvent);
    setSelectedAlbum("");
    setAlbums([]);
  }, [selectedEvent]);

  const fetchClubs = async () => {
    try {
      const res = await api.get("/clubs/");
      setClubs(res.data || []);
    } catch {}
  };

  const fetchEvents = async (clubId: string) => {
    try {
      const res = await api.get("/events/");
      setEvents(res.data?.filter((e: any) => e.club_id === clubId) || []);
    } catch {}
  };

  const fetchAlbums = async (eventId: string) => {
    try {
      const res = await api.get(`/events/${eventId}/albums`);
      setAlbums(res.data || []);
    } catch {}
  };

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: FileItem[] = accepted.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
      "video/*": [".mp4", ".mov", ".webm"],
    },
    maxSize: 50 * 1024 * 1024,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((f) => f.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleUpload = async () => {
    if (!selectedAlbum) {
      toast.error("Please select an album");
      return;
    }
    if (files.length === 0) {
      toast.error("Add at least one file");
      return;
    }

    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) {
      toast.error("No new files to upload");
      return;
    }

    setUploading(true);

    for (const fileItem of pending) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "uploading", progress: 10 }
            : f,
        ),
      );

      try {
        const formData = new FormData();
        formData.append("files", fileItem.file);
        if (caption) formData.append("caption", caption);
        formData.append("is_public", String(isPublic));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id && f.progress < 85
                ? { ...f, progress: f.progress + 15 }
                : f,
            ),
          );
        }, 300);

        await api.post(`/upload/${selectedAlbum}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        clearInterval(progressInterval);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: "done", progress: 100 } : f,
          ),
        );
      } catch (err: any) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: "error", progress: 0, error: "Upload failed" }
              : f,
          ),
        );
      }
    }

    setUploading(false);
    const doneCount =
      files.filter((f) => f.status === "done").length + pending.length;
    toast.success(`${pending.length} file(s) uploaded!`);
  };

  const totalPending = files.filter((f) => f.status === "pending").length;
  const totalDone = files.filter((f) => f.status === "done").length;
  const totalError = files.filter((f) => f.status === "error").length;

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
          <h1 style={styles.title}>Upload Media</h1>
          <p style={styles.subtitle}>
            Upload photos and videos to your event albums
          </p>
        </div>
      </motion.div>

      <div style={styles.layout}>
        {/* Left — Dropzone + Files */}
        <div style={styles.leftCol}>
          {/* Dropzone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              style={{
                ...styles.dropzone,
                borderColor: isDragActive
                  ? "rgba(124,58,237,0.6)"
                  : "rgba(255,255,255,0.08)",
                background: isDragActive
                  ? "rgba(124,58,237,0.06)"
                  : "rgba(255,255,255,0.02)",
                boxShadow: isDragActive
                  ? "0 0 0 4px rgba(124,58,237,0.1)"
                  : "none",
              }}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ scale: isDragActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={styles.dropzoneInner}
              >
                <div
                  style={{
                    ...styles.dropzoneIcon,
                    background: isDragActive
                      ? "rgba(124,58,237,0.2)"
                      : "rgba(255,255,255,0.04)",
                    border: isDragActive
                      ? "1px solid rgba(124,58,237,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Upload
                    size={28}
                    color={isDragActive ? "#A78BFA" : "#52525B"}
                  />
                </div>
                <p style={styles.dropzoneTitle}>
                  {isDragActive
                    ? "Drop your files here"
                    : "Drag & drop files here"}
                </p>
                <p style={styles.dropzoneSub}>
                  or <span style={styles.browseLink}>browse files</span> — JPG,
                  PNG, MP4 up to 50MB
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* File List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.fileList}
              >
                {/* Summary bar */}
                <div style={styles.summaryBar}>
                  <span style={styles.summaryText}>
                    {files.length} file{files.length !== 1 ? "s" : ""} selected
                  </span>
                  <div style={styles.summaryBadges}>
                    {totalPending > 0 && (
                      <span style={styles.badgePending}>
                        {totalPending} pending
                      </span>
                    )}
                    {totalDone > 0 && (
                      <span style={styles.badgeDone}>{totalDone} done</span>
                    )}
                    {totalError > 0 && (
                      <span style={styles.badgeError}>{totalError} failed</span>
                    )}
                  </div>
                </div>

                {/* Files */}
                <div style={styles.fileGrid}>
                  {files.map((fileItem) => (
                    <motion.div
                      key={fileItem.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      style={{
                        ...styles.fileCard,
                        borderColor:
                          fileItem.status === "done"
                            ? "rgba(16,185,129,0.2)"
                            : fileItem.status === "error"
                              ? "rgba(239,68,68,0.2)"
                              : "rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Preview */}
                      <div style={styles.filePreview}>
                        {fileItem.file.type.startsWith("image/") ? (
                          <img
                            src={fileItem.preview}
                            alt=""
                            style={styles.previewImg}
                          />
                        ) : (
                          <div style={styles.videoPreview}>
                            <Film size={20} color="#71717A" />
                          </div>
                        )}
                        {/* Status overlay */}
                        {fileItem.status === "done" && (
                          <div style={styles.statusOverlay}>
                            <CheckCircle size={20} color="#10B981" />
                          </div>
                        )}
                        {fileItem.status === "error" && (
                          <div style={styles.statusOverlay}>
                            <AlertCircle size={20} color="#EF4444" />
                          </div>
                        )}
                        {fileItem.status === "uploading" && (
                          <div style={styles.statusOverlay}>
                            <Loader
                              size={20}
                              color="#A78BFA"
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={styles.fileInfo}>
                        <p style={styles.fileName}>
                          {fileItem.file.name.length > 20
                            ? fileItem.file.name.slice(0, 20) + "..."
                            : fileItem.file.name}
                        </p>
                        <p style={styles.fileSize}>
                          {(fileItem.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>

                        {/* Progress bar */}
                        {fileItem.status === "uploading" && (
                          <div style={styles.progressBar}>
                            <motion.div
                              animate={{ width: `${fileItem.progress}%` }}
                              style={styles.progressFill}
                            />
                          </div>
                        )}
                      </div>

                      {/* Remove btn */}
                      {fileItem.status !== "uploading" && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeFile(fileItem.id)}
                          style={styles.removeBtn}
                        >
                          <X size={13} color="#71717A" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Settings Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={styles.rightCol}
        >
          <div style={styles.settingsCard}>
            <div style={styles.settingsHeader}>
              <Sparkles size={15} color="#7C3AED" />
              <span style={styles.settingsTitle}>Upload Settings</span>
            </div>

            {/* Club Select */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Club</label>
              <div style={styles.selectWrapper}>
                <select
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select club...</option>
                  {clubs.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  color="#52525B"
                  style={styles.selectIcon}
                />
              </div>
            </div>

            {/* Event Select */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Event</label>
              <div style={styles.selectWrapper}>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  disabled={!selectedClub}
                  style={{
                    ...styles.select,
                    opacity: !selectedClub ? 0.4 : 1,
                  }}
                >
                  <option value="">Select event...</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  color="#52525B"
                  style={styles.selectIcon}
                />
              </div>
            </div>

            {/* Album Select */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Album</label>
              <div style={styles.selectWrapper}>
                <select
                  value={selectedAlbum}
                  onChange={(e) => setSelectedAlbum(e.target.value)}
                  disabled={!selectedEvent}
                  style={{
                    ...styles.select,
                    opacity: !selectedEvent ? 0.4 : 1,
                  }}
                >
                  <option value="">Select album...</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  color="#52525B"
                  style={styles.selectIcon}
                />
              </div>
            </div>

            {/* Caption */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Caption (optional)</label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                style={styles.input}
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

            {/* Visibility */}
            <div style={styles.toggleRow}>
              <div>
                <p style={styles.toggleLabel}>Public</p>
                <p style={styles.toggleSub}>Visible to all club members</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPublic(!isPublic)}
                style={{
                  ...styles.toggle,
                  background: isPublic
                    ? "linear-gradient(135deg, #7C3AED, #6366F1)"
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <motion.div
                  animate={{ x: isPublic ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={styles.toggleThumb}
                />
              </motion.button>
            </div>

            {/* Divider */}
            <div style={styles.divider} />

            {/* Upload button */}
            <motion.button
              whileHover={{ scale: uploading ? 1 : 1.02 }}
              whileTap={{ scale: uploading ? 1 : 0.98 }}
              onClick={handleUpload}
              disabled={uploading || files.length === 0 || !selectedAlbum}
              style={{
                ...styles.uploadBtn,
                opacity:
                  uploading || files.length === 0 || !selectedAlbum ? 0.5 : 1,
                cursor:
                  uploading || files.length === 0 || !selectedAlbum
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {uploading ? (
                <>
                  <Loader
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>
                    Upload{" "}
                    {totalPending > 0
                      ? `${totalPending} file${totalPending !== 1 ? "s" : ""}`
                      : "Files"}
                  </span>
                </>
              )}
            </motion.button>

            {/* Stats */}
            {files.length > 0 && (
              <div style={styles.uploadStats}>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Total files</span>
                  <span style={styles.statValue}>{files.length}</span>
                </div>
                <div style={styles.statRow}>
                  <span style={styles.statLabel}>Total size</span>
                  <span style={styles.statValue}>
                    {(
                      files.reduce((acc, f) => acc + f.file.size, 0) /
                      1024 /
                      1024
                    ).toFixed(1)}{" "}
                    MB
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
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
      "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
    top: "-100px",
    right: "5%",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
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
  subtitle: {
    fontSize: "14px",
    color: "#52525B",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "24px",
    position: "relative",
    zIndex: 1,
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  dropzone: {
    border: "2px dashed",
    borderRadius: "20px",
    padding: "60px 24px",
    cursor: "pointer",
    transition: "all 0.25s ease",
  },
  dropzoneInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    textAlign: "center",
  },
  dropzoneIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.25s ease",
  },
  dropzoneTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F8F8FF",
    letterSpacing: "-0.2px",
  },
  dropzoneSub: {
    fontSize: "14px",
    color: "#52525B",
  },
  browseLink: {
    color: "#7C3AED",
    fontWeight: "600",
    cursor: "pointer",
  },
  fileList: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "20px",
  },
  summaryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  summaryText: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#F8F8FF",
  },
  summaryBadges: {
    display: "flex",
    gap: "8px",
  },
  badgePending: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    color: "#A1A1AA",
  },
  badgeDone: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "rgba(16,185,129,0.12)",
    color: "#10B981",
  },
  badgeError: {
    fontSize: "11px",
    fontWeight: "600",
    padding: "3px 8px",
    borderRadius: "6px",
    background: "rgba(239,68,68,0.12)",
    color: "#EF4444",
  },
  fileGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  fileCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid",
    borderRadius: "12px",
    transition: "border-color 0.2s",
  },
  filePreview: {
    width: "52px",
    height: "52px",
    borderRadius: "10px",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
    background: "rgba(255,255,255,0.04)",
  },
  previewImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  videoPreview: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statusOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F8F8FF",
    marginBottom: "2px",
  },
  fileSize: {
    fontSize: "11px",
    color: "#52525B",
  },
  progressBar: {
    height: "3px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "2px",
    marginTop: "8px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
    borderRadius: "2px",
  },
  removeBtn: {
    width: "26px",
    height: "26px",
    borderRadius: "7px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
  },
  rightCol: {
    position: "sticky",
    top: "24px",
    height: "fit-content",
  },
  settingsCard: {
    background: "#101114",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  settingsHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  settingsTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#F8F8FF",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#71717A",
  },
  selectWrapper: {
    position: "relative",
  },
  select: {
    width: "100%",
    padding: "10px 32px 10px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "13px",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
  },
  selectIcon: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  input: {
    padding: "10px 12px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#F8F8FF",
    fontSize: "13px",
    transition: "border-color 0.2s, box-shadow 0.2s",
    width: "100%",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "10px",
  },
  toggleLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#F8F8FF",
    marginBottom: "2px",
  },
  toggleSub: {
    fontSize: "11px",
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
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
  },
  uploadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "13px",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 0 20px rgba(124,58,237,0.25)",
    transition: "opacity 0.2s",
    width: "100%",
  },
  uploadStats: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "12px",
    background: "rgba(255,255,255,0.02)",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.04)",
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: "12px",
    color: "#52525B",
  },
  statValue: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#A1A1AA",
  },
};
