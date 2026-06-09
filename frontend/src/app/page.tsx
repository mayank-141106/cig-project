"use client";

import { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Zap,
  Shield,
  Users,
  Camera,
  Brain,
  Download,
  Star,
  ChevronDown,
  Image,
  Video,
  Search,
  Bell,
  Upload,
  Globe,
} from "lucide-react";

// ─── Mouse Glow Hook ────────────────────────────────────────────────
function useMouseGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return pos;
}

// ─── Animated Counter ───────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = target / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              setCount(target);
              clearInterval(timer);
            } else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Feature Card ───────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, gradient, delay }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: hovered
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.02)",
        border: hovered
          ? "1px solid rgba(124,58,237,0.3)"
          : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "20px",
        padding: "28px",
        cursor: "default",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, ${gradient}18, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: `linear-gradient(135deg, ${gradient}22, ${gradient}44)`,
          border: `1px solid ${gradient}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "18px",
        }}
      >
        <Icon size={22} color={gradient} />
      </div>
      <h3
        style={{
          fontSize: "16px",
          fontWeight: "700",
          color: "#F8F8FF",
          marginBottom: "8px",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "#71717A", lineHeight: "1.6" }}>
        {desc}
      </p>
    </motion.div>
  );
}

// ─── Floating Nav ───────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        width: "100%",
        maxWidth: "900px",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(7,7,10,0.85)" : "rgba(16,17,20,0.6)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "12px 20px",
          transition: "all 0.3s ease",
          boxShadow: scrolled ? "0 8px 32px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7C3AED, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={15} color="#fff" />
          </div>
          <span
            style={{
              fontSize: "16px",
              fontWeight: "800",
              color: "#F8F8FF",
              letterSpacing: "-0.3px",
            }}
          >
            CIG Media
          </span>
        </div>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {["Features", "Gallery", "Pricing"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "500",
                color: "#A1A1AA",
                transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#F8F8FF";
                (e.target as HTMLElement).style.background =
                  "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#A1A1AA";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            href="/login"
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "600",
              color: "#A1A1AA",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
          >
            Sign in
          </Link>
          <Link
            href="/register"
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #7C3AED, #6366F1)",
              fontSize: "13px",
              fontWeight: "600",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "0 0 16px rgba(124,58,237,0.4)",
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────
export default function LandingPage() {
  const mouse = useMouseGlow();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const features = [
    {
      icon: Brain,
      title: "AI Facial Recognition",
      desc: "Upload a selfie and instantly find every photo of yourself across all events. Powered by deep learning.",
      gradient: "#7C3AED",
      delay: 0,
    },
    {
      icon: Search,
      title: "AI-Powered Search",
      desc: "Search photos by emotion, color, scene, or any natural language query. No manual tagging needed.",
      gradient: "#6366F1",
      delay: 0.05,
    },
    {
      icon: Camera,
      title: "Smart Albums",
      desc: "Automatically organized event albums with intelligent clustering and moment detection.",
      gradient: "#06B6D4",
      delay: 0.1,
    },
    {
      icon: Download,
      title: "Watermarked Downloads",
      desc: "Download any media with your club branding automatically applied. One click, professional output.",
      gradient: "#10B981",
      delay: 0.15,
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      desc: "Granular privacy settings per album, event, and photo. You control who sees what.",
      gradient: "#F59E0B",
      delay: 0.2,
    },
    {
      icon: Globe,
      title: "Real-Time Collaboration",
      desc: "Multiple photographers upload simultaneously. Live activity feed. Instant notifications.",
      gradient: "#EF4444",
      delay: 0.25,
    },
  ];

  const stats = [
    { value: 50000, suffix: "+", label: "Photos Managed" },
    { value: 1200, suffix: "+", label: "Events Created" },
    { value: 98, suffix: "%", label: "Recognition Accuracy" },
    { value: 340, suffix: "+", label: "Clubs Active" },
  ];

  const galleryItems = [
    { h: 280, gradient: "linear-gradient(135deg, #7C3AED33, #06B6D433)" },
    { h: 200, gradient: "linear-gradient(135deg, #6366F133, #10B98133)" },
    { h: 320, gradient: "linear-gradient(135deg, #06B6D433, #7C3AED33)" },
    { h: 240, gradient: "linear-gradient(135deg, #10B98133, #6366F133)" },
    { h: 180, gradient: "linear-gradient(135deg, #F59E0B33, #EF444433)" },
    { h: 260, gradient: "linear-gradient(135deg, #7C3AED33, #F59E0B33)" },
    { h: 300, gradient: "linear-gradient(135deg, #06B6D433, #6366F133)" },
    { h: 220, gradient: "linear-gradient(135deg, #EF444433, #7C3AED33)" },
  ];

  return (
    <div
      style={{ background: "#07070A", minHeight: "100vh", overflowX: "hidden" }}
    >
      {/* Global mouse glow */}
      <div
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 0,
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)",
          left: mouse.x - 300,
          top: mouse.y - 300,
          transition: "left 0.15s ease, top 0.15s ease",
        }}
      />

      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <motion.section style={{ y: heroY, opacity: heroOpacity }} id="hero">
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "120px 24px 80px",
            position: "relative",
            textAlign: "center",
          }}
        >
          {/* Background orbs */}
          <div
            style={{
              position: "absolute",
              width: "800px",
              height: "800px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)",
              top: "20%",
              right: "10%",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)",
              bottom: "20%",
              left: "10%",
              pointerEvents: "none",
            }}
          />

          {/* Grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
              pointerEvents: "none",
            }}
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(124,58,237,0.3)",
              borderRadius: "100px",
              padding: "6px 16px 6px 10px",
              marginBottom: "32px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7C3AED, #6366F1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={10} color="#fff" />
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#A78BFA",
                letterSpacing: "0.3px",
              }}
            >
              AI-Powered Event Media Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: "clamp(42px, 7vw, 88px)",
              fontWeight: "900",
              lineHeight: "1.05",
              letterSpacing: "-2px",
              color: "#F8F8FF",
              maxWidth: "900px",
              marginBottom: "24px",
              position: "relative",
              zIndex: 1,
            }}
          >
            Every moment,{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, #7C3AED, #6366F1, #06B6D4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              perfectly captured
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            style={{
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "#71717A",
              maxWidth: "560px",
              lineHeight: "1.7",
              marginBottom: "44px",
              fontWeight: "400",
              position: "relative",
              zIndex: 1,
            }}
          >
            The AI-powered platform for clubs and event organizers. Upload,
            discover, and share memories — powered by facial recognition and
            intelligent search.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #7C3AED, #6366F1)",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "#fff",
                  textDecoration: "none",
                  boxShadow:
                    "0 0 32px rgba(124,58,237,0.4), 0 4px 16px rgba(0,0,0,0.3)",
                  letterSpacing: "-0.2px",
                }}
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 24px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#F8F8FF",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Play size={15} fill="#F8F8FF" />
                Watch demo
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#3F3F46",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Scroll
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ChevronDown size={16} color="#3F3F46" />
            </motion.div>
          </motion.div>

          {/* Hero visual — floating glass card preview */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              marginTop: "80px",
              width: "100%",
              maxWidth: "900px",
              borderRadius: "24px",
              background: "rgba(16,17,20,0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "20px",
              boxShadow:
                "0 40px 120px rgba(0,0,0,0.6), 0 0 60px rgba(124,58,237,0.1)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Fake browser bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: c,
                    opacity: 0.7,
                  }}
                />
              ))}
              <div
                style={{
                  flex: 1,
                  height: "24px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "10px",
                }}
              >
                <span style={{ fontSize: "11px", color: "#52525B" }}>
                  cig-media.app/events/annual-fest
                </span>
              </div>
            </div>
            {/* Fake masonry grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {galleryItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.06, duration: 0.4 }}
                  style={{
                    height: `${item.h / 2}px`,
                    borderRadius: "10px",
                    background: item.gradient,
                    border: "1px solid rgba(255,255,255,0.06)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.4))",
                    }}
                  />
                  {i === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(124,58,237,0.8)",
                        borderRadius: "6px",
                        padding: "3px 8px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#fff",
                      }}
                    >
                      AI MATCH
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                style={{
                  background: "#101114",
                  padding: "36px 28px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "-1px",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#52525B",
                    fontWeight: "500",
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "80px 24px 100px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: "100px",
                padding: "5px 14px",
                marginBottom: "20px",
              }}
            >
              <Zap size={12} color="#06B6D4" />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#06B6D4",
                }}
              >
                Powerful Features
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: "900",
                letterSpacing: "-1px",
                color: "#F8F8FF",
                marginBottom: "16px",
              }}
            >
              Everything your club needs
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#71717A",
                maxWidth: "500px",
                margin: "0 auto",
                lineHeight: "1.7",
              }}
            >
              From AI-powered photo discovery to real-time collaboration — built
              for modern event organizers.
            </p>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── AI SPOTLIGHT ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              borderRadius: "28px",
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))",
              border: "1px solid rgba(124,58,237,0.2)",
              padding: "60px 48px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
                top: "-100px",
                right: "-100px",
                pointerEvents: "none",
              }}
            />
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: "100px",
                  padding: "5px 14px",
                  marginBottom: "20px",
                }}
              >
                <Brain size={12} color="#A78BFA" />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#A78BFA",
                  }}
                >
                  AI Recognition
                </span>
              </div>
              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 38px)",
                  fontWeight: "900",
                  letterSpacing: "-0.8px",
                  color: "#F8F8FF",
                  marginBottom: "16px",
                  lineHeight: "1.1",
                }}
              >
                Find yourself in{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  every photo
                </span>
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "#71717A",
                  lineHeight: "1.7",
                  marginBottom: "28px",
                }}
              >
                Upload a single selfie and our AI instantly locates every photo
                you appear in across all events — no manual browsing required.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
                    borderRadius: "12px",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#fff",
                    textDecoration: "none",
                    boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                  }}
                >
                  Try it now <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* Right side visual */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Selfie upload card */}
              <div
                style={{
                  background: "rgba(16,17,20,0.8)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "16px",
                  padding: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #7C3AED44, #6366F144)",
                      border: "2px solid rgba(124,58,237,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Camera size={18} color="#A78BFA" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#F8F8FF",
                        marginBottom: "2px",
                      }}
                    >
                      Selfie uploaded
                    </div>
                    <div style={{ fontSize: "11px", color: "#52525B" }}>
                      Scanning 12,482 photos...
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(16,185,129,0.15)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Sparkles size={14} color="#10B981" />
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    height: "4px",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "78%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>

              {/* Results */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, rgba(${i === 0 ? "124,58,237" : i === 1 ? "99,102,241" : "6,182,212"},0.2), rgba(${i === 0 ? "99,102,241" : i === 1 ? "6,182,212" : "16,185,129"},0.2))`,
                      border: "1px solid rgba(255,255,255,0.08)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        left: "6px",
                        background: "rgba(16,185,129,0.85)",
                        borderRadius: "4px",
                        padding: "2px 6px",
                        fontSize: "9px",
                        fontWeight: "700",
                        color: "#fff",
                      }}
                    >
                      {["98%", "97%", "95%"][i]}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{ textAlign: "center", padding: "8px 0" }}>
                <span style={{ fontSize: "12px", color: "#52525B" }}>
                  Found{" "}
                  <span style={{ color: "#A78BFA", fontWeight: "700" }}>
                    47 photos
                  </span>{" "}
                  of you across 6 events
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GALLERY PREVIEW ──────────────────────────────────────── */}
      <section id="gallery" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "48px" }}
          >
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: "900",
                letterSpacing: "-1px",
                color: "#F8F8FF",
                marginBottom: "14px",
              }}
            >
              A gallery that feels{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #6366F1, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                alive
              </span>
            </h2>
            <p style={{ fontSize: "15px", color: "#71717A" }}>
              Pinterest-style masonry layout. Hover for previews. AI-tagged.
              Infinitely scrollable.
            </p>
          </motion.div>

          {/* Masonry-style fake gallery */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
            }}
          >
            {galleryItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                style={{
                  height: `${item.h}px`,
                  borderRadius: "14px",
                  background: item.gradient,
                  border: "1px solid rgba(255,255,255,0.06)",
                  position: "relative",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))",
                  }}
                />
                {/* AI tag badge */}
                {i % 3 === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: "600",
                      color: "#A78BFA",
                    }}
                  >
                    <Sparkles size={9} />
                    AI tagged
                  </div>
                )}
                {/* Hover action icons */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  {[Star, Download].map((Icon, j) => (
                    <div
                      key={j}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(8px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Icon size={12} color="#fff" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px 120px" }}>
        <div
          style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{
              borderRadius: "32px",
              background: "rgba(16,17,20,0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "64px 48px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
                top: "-200px",
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "16px",
                background: "linear-gradient(135deg, #7C3AED, #6366F1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                boxShadow: "0 0 32px rgba(124,58,237,0.4)",
              }}
            >
              <Sparkles size={24} color="#fff" />
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: "900",
                letterSpacing: "-1px",
                color: "#F8F8FF",
                marginBottom: "16px",
              }}
            >
              Ready to get started?
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#71717A",
                marginBottom: "36px",
                lineHeight: "1.6",
              }}
            >
              Join hundreds of clubs already managing their events and media on
              CIG Media Platform.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 32px",
                    background: "linear-gradient(135deg, #7C3AED, #6366F1)",
                    borderRadius: "14px",
                    fontSize: "15px",
                    fontWeight: "700",
                    color: "#fff",
                    textDecoration: "none",
                    boxShadow: "0 0 32px rgba(124,58,237,0.35)",
                  }}
                >
                  Create free account
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 28px",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "14px",
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#A1A1AA",
                    textDecoration: "none",
                  }}
                >
                  Sign in
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #7C3AED, #6366F1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={12} color="#fff" />
          </div>
          <span
            style={{ fontSize: "14px", fontWeight: "700", color: "#F8F8FF" }}
          >
            CIG Media
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "#3F3F46" }}>
          © 2025 CIG Media Platform. All rights reserved.
        </span>
      </footer>
    </div>
  );
}
