"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { authService } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      await authService.login(form);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Animated background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* Grid overlay */}
      <div style={styles.grid} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.logo}
      >
        <div style={styles.logoIcon}>
          <Sparkles size={18} color="#7C3AED" />
        </div>
        <span style={styles.logoText}>CIG Media</span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={styles.card}
      >
        {/* Card glow */}
        <div style={styles.cardGlow} />

        <div style={styles.cardInner}>
          {/* Header */}
          <div style={styles.header}>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={styles.title}
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={styles.subtitle}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              style={styles.fieldGroup}
            >
              <label style={styles.label}>Email address</label>
              <div style={styles.inputWrapper}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={styles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,58,237,0.6)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={styles.fieldGroup}
            >
              <label style={styles.label}>Password</label>
              <div style={{ ...styles.inputWrapper, position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  style={{ ...styles.input, paddingRight: "48px" }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(124,58,237,0.6)";
                    e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? (
                    <EyeOff size={16} color="#71717A" />
                  ) : (
                    <Eye size={16} color="#71717A" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <div style={styles.spinner} />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={styles.divider}
          >
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </motion.div>

          {/* Register link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={styles.registerText}
          >
            Don't have an account?{" "}
            <Link href="/register" style={styles.registerLink}>
              Create one free
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#07070A",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "absolute",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
    top: "-200px",
    left: "-100px",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
    bottom: "-100px",
    right: "-100px",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    top: "50%",
    left: "60%",
    pointerEvents: "none",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "40px",
    position: "relative",
    zIndex: 10,
  },
  logoIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    background: "rgba(124,58,237,0.15)",
    border: "1px solid rgba(124,58,237,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#F8F8FF",
    letterSpacing: "-0.3px",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    position: "relative",
    zIndex: 10,
  },
  cardGlow: {
    position: "absolute",
    inset: "-1px",
    borderRadius: "25px",
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.1), transparent)",
    padding: "1px",
    zIndex: -1,
  },
  cardInner: {
    background: "rgba(16,17,20,0.8)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "40px",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#F8F8FF",
    letterSpacing: "-0.5px",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#71717A",
    fontWeight: "400",
  },
  form: {
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
    letterSpacing: "0.1px",
  },
  inputWrapper: {
    width: "100%",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    color: "#F8F8FF",
    fontSize: "14px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  submitBtn: {
    width: "100%",
    padding: "13px 24px",
    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
    border: "none",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginTop: "4px",
    boxShadow: "0 0 24px rgba(124,58,237,0.3)",
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
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.06)",
  },
  dividerText: {
    fontSize: "12px",
    color: "#52525B",
    fontWeight: "500",
  },
  registerText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#71717A",
  },
  registerLink: {
    color: "#7C3AED",
    fontWeight: "600",
    transition: "color 0.2s",
  },
};
