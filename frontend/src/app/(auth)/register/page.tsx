"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Lock,
  AtSign,
} from "lucide-react";
import { authService } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    full_name: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.username || !form.full_name || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        email: form.email,
        username: form.username,
        full_name: form.full_name,
        password: form.password,
      });
      toast.success("Account created!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "full_name",
      label: "Full Name",
      placeholder: "John Doe",
      type: "text",
      icon: <User size={15} color="#52525B" />,
    },
    {
      name: "username",
      label: "Username",
      placeholder: "johndoe",
      type: "text",
      icon: <AtSign size={15} color="#52525B" />,
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      type: "email",
      icon: <Mail size={15} color="#52525B" />,
    },
  ];

  return (
    <div style={styles.root}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />
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
              Create account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={styles.subtitle}
            >
              Join the platform and start sharing moments
            </motion.p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Text fields */}
            {fields.map((field, i) => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={styles.fieldGroup}
              >
                <label style={styles.label}>{field.label}</label>
                <div style={styles.inputWrapper}>
                  <div style={styles.inputIcon}>{field.icon}</div>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(124,58,237,0.6)";
                      e.target.style.boxShadow =
                        "0 0 0 3px rgba(124,58,237,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              style={styles.fieldGroup}
            >
              <label style={styles.label}>Password</label>
              <div style={{ ...styles.inputWrapper, position: "relative" }}>
                <div style={styles.inputIcon}>
                  <Lock size={15} color="#52525B" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={styles.fieldGroup}
            >
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <div style={styles.inputIcon}>
                  <Lock size={15} color="#52525B" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
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

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
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
                  <span>Create account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Login link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={styles.loginText}
          >
            Already have an account?{" "}
            <Link href="/login" style={styles.loginLink}>
              Sign in
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
    right: "-100px",
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
    left: "-100px",
    pointerEvents: "none",
  },
  orb3: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    top: "40%",
    right: "60%",
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
    marginBottom: "32px",
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
    maxWidth: "460px",
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
    marginBottom: "28px",
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
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 16px 12px 38px",
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
  loginText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#71717A",
    marginTop: "24px",
  },
  loginLink: {
    color: "#7C3AED",
    fontWeight: "600",
  },
};
