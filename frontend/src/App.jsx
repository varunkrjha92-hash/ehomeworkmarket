import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import HomePage from "./HomePage";
import LandingPage from "./LandingPage";

const API = "https://ehomeworkmarket-production.up.railway.app/api";
const SOCKET_URL = "https://ehomeworkmarket-production.up.railway.app";
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

const subjects = ["Nursing","Business","Psychology","Computer Science","Accounting","Statistics","Marketing","History","Economics","Law","Biology","English"];

// ── AUTH CONTEXT ──────────────────────────────────────────────
function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ehm_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ehm_token") || null);

  const login = (userData, tok) => {
    setUser(userData); setToken(tok);
    localStorage.setItem("ehm_user", JSON.stringify(userData));
    localStorage.setItem("ehm_token", tok);
  };
  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem("ehm_user");
    localStorage.removeItem("ehm_token");
  };
  return { user, token, login, logout };
}

// ── STYLES ────────────────────────────────────────────────────
const S = {
  page: { minHeight: "100vh", background: "#fff", fontFamily: "sans-serif" },
  nav: { background: "#0f3540", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 },
  navBrand: { color: "#c9a961", fontSize: 20, fontWeight: 700, textDecoration: "none" },
  navLink: { color: "#a8c4cc", fontSize: 14, textDecoration: "none", marginLeft: 20, fontFamily: "sans-serif" },
  container: { maxWidth: 900, margin: "0 auto", padding: "32px 20px" },
  card: { background: "#fff", border: "1px solid #d8d0c4", borderRadius: 6, padding: 28, marginBottom: 20 },
  h1: { fontFamily: "Georgia, serif", fontSize: 28, color: "#1a3a5c", marginBottom: 8 },
  h2: { fontFamily: "Georgia, serif", fontSize: 22, color: "#1a3a5c", marginBottom: 16 },
  label: { display: "block", fontFamily: "sans-serif", fontSize: 13, color: "#555", marginBottom: 6, fontWeight: 600 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #c8bfb0", borderRadius: 4, fontSize: 15, fontFamily: "sans-serif", background: "#fdfcfa", boxSizing: "border-box", marginBottom: 16 },
  select: { width: "100%", padding: "10px 12px", border: "1px solid #c8bfb0", borderRadius: 4, fontSize: 15, fontFamily: "sans-serif", background: "#fdfcfa", boxSizing: "border-box", marginBottom: 16 },
  textarea: { width: "100%", padding: "10px 12px", border: "1px solid #c8bfb0", borderRadius: 4, fontSize: 15, fontFamily: "sans-serif", background: "#fdfcfa", minHeight: 120, boxSizing: "border-box", marginBottom: 16, resize: "vertical" },
  btnPrimary: { background: "#1a3a5c", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 4, fontSize: 15, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 },
  btnGold: { background: "#f5c842", color: "#1a3a5c", border: "none", padding: "12px 28px", borderRadius: 4, fontSize: 15, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700 },
  btnSmall: { background: "#1a3a5c", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 3, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" },
  btnSecondary: { background: "transparent", color: "#1a3a5c", border: "2px solid #1a3a5c", padding: "10px 22px", borderRadius: 4, fontSize: 14, cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 },
  badge: (status) => {
    const colors = { pending: "#e8f0ff", in_progress: "#fff8e0", solved: "#e8ffe8", paid: "#e0ffe8" };
    const text = { pending: "#2244aa", in_progress: "#a07000", solved: "#1a7a1a", paid: "#0a5a0a" };
    return { background: colors[status] || "#eee", color: text[status] || "#333", padding: "3px 10px", borderRadius: 12, fontSize: 12, fontFamily: "sans-serif", fontWeight: 600, display: "inline-block" };
  },
  err: { color: "#c0392b", fontFamily: "sans-serif", fontSize: 14, marginBottom: 12 },
  success: { color: "#1a7a1a", fontFamily: "sans-serif", fontSize: 14, marginBottom: 12 },
  row: { display: "flex", gap: 16 },
  flex: { display: "flex", alignItems: "center", justifyContent: "space-between" },
};

function ConditionalNav({ user, logout }) {
  const location = useLocation();
  if (location.pathname === "/") return null;
  return <Nav user={user} logout={logout} />;
}

// ── NAV ──────────────────────────────────────────────────────
function Nav({ user, logout }) {
  const navigate = useNavigate();
  return (
    <nav style={S.nav}>
      <Link to="/" style={S.navBrand}>📚 eHomeworkMarket</Link>
      <div>
        <Link to="/library" style={S.navLink}>Library</Link>
        {user ? (
          <>
            <Link to="/dashboard" style={S.navLink}>My Assignments</Link>
            <Link to="/my-purchases" style={S.navLink}>My Purchases</Link>
            {user.role === "admin" && <Link to="/admin" style={{ ...S.navLink, color: "#f5c842" }}>Admin</Link>}
            <span style={{ ...S.navLink, cursor: "pointer" }} onClick={() => { logout(); navigate("/"); }}>Logout ({user.name})</span>
          </>
        ) : (
          <>
            <Link to="/ask" style={S.navLink}>Ask Question</Link>
            <Link to="/login" style={S.navLink}>Login</Link>
            <Link to="/register" style={{ ...S.navLink, background: "#f5c842", color: "#1a3a5c", padding: "6px 14px", borderRadius: 3, fontWeight: 700 }}>Sign Up Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ── HOME ─────────────────────────────────────────────────────
function Home() {
  const [recentSolutions, setRecentSolutions] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      eyebrow: "For College Students",
      title: "Tutoring,",
      title2: "done",
      accent: "thoughtfully.",
      subtitle: "Real help. Real experts. Browse readymade solutions or post your own assignment.",
      cta1: { label: "Post Your Assignment →", link: "/ask" },
      cta2: { label: "Browse Library", link: "/library" }
    },
    {
      eyebrow: "Our Promise",
      title: "Quality",
      title2: "you can",
      accent: "trust.",
      subtitle: "Every solution is reviewed for accuracy and originality before publishing. No shortcuts, no compromises.",
      cta1: { label: "Browse Library →", link: "/library" },
      cta2: { label: "Post Your Assignment", link: "/ask" }
    },
    {
      eyebrow: "Risk-Free",
      title: "100%",
      title2: "money-back",
      accent: "guarantee.",
      subtitle: "Not satisfied with your solution? Get a full refund, no questions asked. Your trust matters more than the sale.",
      cta1: { label: "Browse Library →", link: "/library" },
      cta2: { label: "Post Your Assignment", link: "/ask" }
    },
    {
      eyebrow: "Always On",
      title: "24/7",
      title2: "support,",
      accent: "always there.",
      subtitle: "Message us anytime — direct line via email or WhatsApp. Real replies, fast.",
      cta1: { label: "Contact Us →", link: "/contact" },
      cta2: { label: "Browse Library", link: "/library" }
    },
    {
      eyebrow: "Get Started",
      title: "Post your",
      title2: "assignment —",
      accent: "first one's on us.",
      subtitle: "Try us free. Submit your first assignment, get matched with an expert, and see the difference thoughtful help makes.",
      cta1: { label: "Claim Free Assignment →", link: "/ask" },
      cta2: { label: "Browse Library", link: "/library" }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    axios.get(`${API}/solutions?limit=6`)
      .then(r => setRecentSolutions(r.data.solutions || []))
      .catch(() => setRecentSolutions([]));
  }, []);

  return (
    <div>
      {/* Hero */}
      {/* Hero Slider */}
      <div style={{
        background: "linear-gradient(135deg, #0f3540 0%, #0a2a32 100%)",
        color: "#f0e3c4",
        padding: "100px 24px 90px",
        position: "relative",
        overflow: "hidden",
        minHeight: 560
      }}>
        {/* Atmospheric glow orbs */}
        <div style={{
          position: "absolute",
          top: "-120px",
          left: "-80px",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(201,169,97,0.18), transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-180px",
          right: "-120px",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13, 90, 95, 0.45), transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none"
        }} />

        {/* Slides */}
        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", zIndex: 2 }}>
          {heroSlides.map((slide, idx) => (
            <div
              key={idx}
              style={{
                position: idx === currentSlide ? "relative" : "absolute",
                top: 0, left: 0, right: 0,
                opacity: idx === currentSlide ? 1 : 0,
                transition: "opacity 1s ease-in-out",
                textAlign: "center",
                pointerEvents: idx === currentSlide ? "auto" : "none"
              }}
            >
              <div style={{
                fontFamily: "sans-serif",
                fontSize: 12,
                color: "#c9a961",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 32
              }}>
                {slide.eyebrow}
              </div>

              <h1 style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(42px, 6vw, 76px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.5px",
                color: "#f0e3c4",
                margin: "0 0 8px 0"
              }}>
                {slide.title}
              </h1>
              <h1 style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(42px, 6vw, 76px)",
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.5px",
                color: "#f0e3c4",
                margin: 0
              }}>
                {slide.title2}{" "}
                <em style={{ color: "#c9a961", fontStyle: "italic", fontWeight: 600 }}>
                  {slide.accent}
                </em>
              </h1>

              <div style={{
                width: 56,
                height: 2,
                background: "#c9a961",
                margin: "36px auto 28px"
              }} />

              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: 18,
                color: "#b9c4c8",
                maxWidth: 640,
                margin: "0 auto 40px",
                lineHeight: 1.55
              }}>
                {slide.subtitle}
              </p>

              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
                <Link to={slide.cta1.link} style={{ textDecoration: "none" }}>
                  <button style={{
                    background: "#c9a961",
                    color: "#0f3540",
                    border: "none",
                    padding: "14px 32px",
                    borderRadius: 4,
                    fontSize: 15,
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                    fontWeight: 700,
                    letterSpacing: "0.3px"
                  }}>
                    {slide.cta1.label}
                  </button>
                </Link>
                <Link to={slide.cta2.link} style={{ textDecoration: "none" }}>
                  <button style={{
                    background: "transparent",
                    color: "#c9a961",
                    border: "1px solid #c9a961",
                    padding: "14px 32px",
                    borderRadius: 4,
                    fontSize: 15,
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                    fontWeight: 600,
                    letterSpacing: "0.3px"
                  }}>
                    {slide.cta2.label}
                  </button>
                </Link>
              </div>
            </div>
          ))}

          {/* Slide indicators */}
          <div style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 24,
            position: "relative",
            zIndex: 3
          }}>
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                style={{
                  width: idx === currentSlide ? 36 : 10,
                  height: 4,
                  borderRadius: 2,
                  border: "none",
                  background: idx === currentSlide ? "#c9a961" : "rgba(201,169,97,0.3)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.4s ease"
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* How it works */}
      <div style={{ background: "#faf6ee", padding: "100px 24px 90px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#c9a961", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>How It Works</p>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 700, color: "#0f3540", margin: "0 0 14px 0", letterSpacing: "-0.5px" }}>
              Three steps. <em style={{ color: "#c9a961" }}>That's it.</em>
            </h2>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "#5a6670", maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
              From posting your question to downloading the solution — simple, direct, and built for students.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
            {[
              { n: "01", t: "Post your assignment", d: "Describe your question, set your budget, share your deadline. No account required to start." },
              { n: "02", t: "Or browse the library", d: "Find readymade solutions across 12+ subjects. Preview before you buy." },
              { n: "03", t: "First one is on us", d: "New students get their first work free. We earn your trust before you commit." }
            ].map(s => (
              <div key={s.n} style={{ background: "#fff", border: "1px solid #e8dfc8", borderRadius: 6, padding: "32px 28px", position: "relative" }}>
                <div style={{ position: "absolute", top: -22, left: 28, background: "#faf6ee", padding: "0 12px" }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#c9a961", fontWeight: 700, letterSpacing: "0.1em" }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "#0f3540", margin: "0 0 14px 0", lineHeight: 1.3 }}>{s.t}</h3>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 15, color: "#5a6670", margin: 0, lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Added Solutions */}
      {recentSolutions.length > 0 && (
        <div style={{ background: "#faf6ee", padding: "100px 24px 90px" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#c9a961", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12, fontWeight: 600 }}>From the Library</p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 38, fontWeight: 700, color: "#0f3540", margin: "0 0 14px 0", letterSpacing: "-0.5px" }}>
                Recently Added <em style={{ color: "#c9a961" }}>Solutions</em>.
              </h2>
              <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "#666" }}>Browse our latest study help — solutions across {subjects.length} subjects</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
              {recentSolutions.map(sol => (
                <div
                  key={sol._id}
                  onClick={() => navigate(`/library/${sol._id}`)}
                  style={{ background: "#fff", border: "1px solid #e0d8c8", borderRadius: 6, padding: 20, cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 58, 92, 0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ background: "#1a3a5c", color: "#f5c842", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{sol.subject}</span>
                    {sol.classCode && <span style={{ color: "#888", fontSize: 12 }}>{sol.classCode}</span>}
                  </div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#1a3a5c", margin: "0 0 8px 0", lineHeight: 1.3, minHeight: 42, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{sol.title}</h3>
                  <p style={{ color: "#666", fontSize: 13, margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", minHeight: 38 }}>{sol.description}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0e8d8" }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#1a3a5c", fontFamily: "Georgia, serif" }}>${sol.price}</span>
                    <span style={{ fontSize: 12, color: "#888" }}>View →</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link to="/library">
                <button style={{ ...S.btnPrimary, fontSize: 15, padding: "12px 32px" }}>Browse Full Library →</button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Subjects */}
      <div style={{ background: "#0f3540", padding: "70px 24px", textAlign: "center", position: "relative" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#c9a961", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16, fontWeight: 600 }}>Subjects We Cover</p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 700, color: "#f0e3c4", margin: "0 0 36px 0", letterSpacing: "-0.5px" }}>
            Help across <em style={{ color: "#c9a961" }}>every major</em>.
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {subjects.map(s => (
              <span key={s} style={{ background: "rgba(201,169,97,0.08)", color: "#f0e3c4", padding: "8px 18px", borderRadius: 4, fontSize: 14, fontFamily: "Georgia, serif", border: "1px solid rgba(201,169,97,0.3)", letterSpacing: "0.2px" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ─────────────────────────────────────────────────
function Register({ login }) {
  usePageTitle("Create Free Account | eHomeworkMarket", "Sign up free and get expert academic assistance for your college assignments.");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    setErr("");
    try {
      const { data } = await axios.post(`${API}/auth/register`, form);
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={S.container}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <div style={S.card}>
          <h2 style={S.h2}>Create Free Account</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "#888", marginBottom: 20 }}>Takes 30 seconds. No credit card required.</p>
          {err && <p style={S.err}>⚠ {err}</p>}
          <label style={S.label}>Your Name</label>
          <input style={S.input} placeholder="e.g. John Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label style={S.label}>Email Address</label>
          <input style={S.input} type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" placeholder="Choose any password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={{ ...S.btnPrimary, width: "100%" }} onClick={submit}>Create Account →</button>
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#888", marginTop: 16, textAlign: "center" }}>
            Already have an account? <Link to="/login" style={{ color: "#1a3a5c" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────
function Login({ login }) {
  usePageTitle("Log In | eHomeworkMarket", "Log in to your eHomeworkMarket account to track assignments and access purchased solutions.");
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    setErr("");
    try {
      const { data } = await axios.post(`${API}/auth/login`, form);
      login(data.user, data.token);
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={S.container}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={S.card}>
          <h2 style={S.h2}>Log In</h2>
          {err && <p style={S.err}>⚠ {err}</p>}
          <label style={S.label}>Email</label>
          <input style={S.input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <label style={S.label}>Password</label>
          <input style={S.input} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <button style={{ ...S.btnPrimary, width: "100%" }} onClick={submit}>Log In →</button>
          <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#888", marginTop: 16, textAlign: "center" }}>
            New here? <Link to="/register" style={{ color: "#1a3a5c" }}>Create free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── ASK / SUBMIT QUESTION ─────────────────────────────────────
function AskQuestion({ user, token }) {
  usePageTitle("Post Your Assignment — Get Expert Help | eHomeworkMarket", "Submit your assignment and get matched with a qualified subject specialist. Fast turnaround, confidential, 24/7 support.");
  const [form, setForm] = useState({ subject: "", description: "", budget: "", deadline: "", guestEmail: "" });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!form.subject || !form.description) return setErr("Subject and description are required");
    if (!user && !form.guestEmail) return setErr("Please enter your email so we can notify you");
    setLoading(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("file", file);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/questions/submit`, fd, { headers });
      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.message || "Submission failed");
    }
    setLoading(false);
  };

  if (done) return (
    <div style={S.container}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
          <h2 style={S.h2}>Assignment Submitted!</h2>
          <p style={{ fontFamily: "sans-serif", color: "#555" }}>Our expert will review your assignment and get back to you shortly. You'll receive an email notification when the solution is ready.</p>
          {!user && <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#888", marginTop: 16 }}>💡 <Link to="/register">Create a free account</Link> to track your assignment status in real time.</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={S.card}>
          <h2 style={S.h2}>📋 Post Your Assignment</h2>
          <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "#888", marginBottom: 20 }}>No account needed. Fill in the details and our expert will get back to you.</p>
          {err && <p style={S.err}>⚠ {err}</p>}

          {!user && (
            <>
              <label style={S.label}>Your Email (for notifications) *</label>
              <input style={S.input} type="email" placeholder="your@email.com" value={form.guestEmail} onChange={e => setForm({ ...form, guestEmail: e.target.value })} />
            </>
          )}

          <label style={S.label}>Subject *</label>
          <select style={S.select} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
            <option value="">Select a subject...</option>
            {subjects.map(s => <option key={s}>{s}</option>)}
            <option value="Other">Other</option>
          </select>

          <label style={S.label}>Assignment Description *</label>
          <textarea style={S.textarea} placeholder="Describe your assignment in detail. Include any special instructions, formatting requirements, or specific questions..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <div style={S.row}>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Your Budget (USD)</label>
              <input style={S.input} type="number" placeholder="e.g. 25" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Deadline</label>
              <input style={S.input} type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>

          <label style={S.label}>Upload File (optional — PDF, DOC, image)</label>
          <input style={{ ...S.input, padding: "8px 12px" }} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e => setFile(e.target.files[0])} />

          <button style={{ ...S.btnGold, width: "100%", fontSize: 16, padding: "14px" }} onClick={submit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Assignment →"}
          </button>
          {!user && <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#888", textAlign: "center", marginTop: 12 }}>Have an account? <Link to="/login">Log in</Link> to track your submissions.</p>}
        </div>
      </div>
    </div>
  );
}

// ── STUDENT DASHBOARD ─────────────────────────────────────────
function Dashboard({ user, token }) {
  const [questions, setQuestions] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get(`${API}/questions/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setQuestions(r.data);
        // Auto-open if redirected from payment
        const params = new URLSearchParams(location.search);
        const paidId = params.get("paid");
        if (paidId) setActive(r.data.find(q => q._id === paidId) || null);
      });
  }, [token]);

  useEffect(() => {
    if (!active) return;
    axios.get(`${API}/questions/${active._id}/messages`).then(r => setMessages(r.data));
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    socketRef.current.emit("join_room", active._id);
    socketRef.current.on("receive_message", (data) => {
      setMessages(prev => [...prev, data]);
    });
    return () => socketRef.current?.off("receive_message");
  }, [active]);

  const sendMsg = async () => {
    if (!msg.trim()) return;
    const data = { questionId: active._id, roomId: active._id, sender: "student", text: msg, createdAt: new Date() };
    socketRef.current?.emit("send_message", data);
    await axios.post(`${API}/questions/${active._id}/message`, { text: msg }, { headers: { Authorization: `Bearer ${token}` } });
    setMsg("");
  };

  const payNow = async (qId) => {
    const { data } = await axios.post(`${API}/payment/checkout/${qId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    window.location.href = data.url;
  };

  return (
    <div style={S.container}>
      <div style={S.flex}>
        <h1 style={S.h1}>My Assignments</h1>
        <Link to="/ask"><button style={S.btnGold}>+ New Assignment</button></Link>
      </div>

      {questions.length === 0 && (
        <div style={{ ...S.card, textAlign: "center", padding: 48 }}>
          <p style={{ fontFamily: "sans-serif", color: "#888" }}>No assignments yet. <Link to="/ask">Post your first question →</Link></p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: active ? "1fr 1.4fr" : "1fr", gap: 20, marginTop: 20 }}>
        <div>
          {questions.map(q => (
            <div key={q._id} style={{ ...S.card, cursor: "pointer", borderLeft: active?._id === q._id ? "4px solid #1a3a5c" : "4px solid transparent" }} onClick={() => setActive(q)}>
              <div style={S.flex}>
                <span style={{ fontFamily: "Georgia", fontWeight: 700, color: "#1a3a5c" }}>{q.subject}</span>
                <span style={S.badge(q.status)}>{q.status.replace("_", " ")}</span>
              </div>
              <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#777", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.description}</p>
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {q.budget && <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "#aaa" }}>Budget: ${q.budget}</span>}
                {q.price && <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "#1a7a1a", fontWeight: 700 }}>Price: ${q.price}</span>}
              </div>
            </div>
          ))}
        </div>

        {active && (
          <div style={S.card}>
            <h3 style={{ fontFamily: "Georgia", color: "#1a3a5c", marginBottom: 4 }}>{active.subject}</h3>
            <span style={S.badge(active.status)}>{active.status.replace("_", " ")}</span>
            <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "#555", marginTop: 12 }}>{active.description}</p>

            {active.status === "solved" && (
              <div style={{ background: "#e8ffe8", border: "1px solid #b0d8b0", borderRadius: 4, padding: 16, margin: "16px 0" }}>
                <p style={{ fontFamily: "sans-serif", fontWeight: 700, color: "#1a5a1a" }}>✅ Solution Ready!</p>
                <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "#333", marginTop: 6 }}>{active.solutionText?.substring(0, 200)}...</p>
                <p style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 16, color: "#1a5a1a", marginTop: 8 }}>Price: ${active.price}</p>
                <button style={{ ...S.btnGold, marginTop: 10 }} onClick={() => payNow(active._id)}>Pay & Download Solution →</button>
              </div>
            )}

            {active.status === "paid" && active.solutionFile && (
              <div style={{ background: "#e8f0ff", border: "1px solid #b0c8e8", borderRadius: 4, padding: 16, margin: "16px 0" }}>
                <p style={{ fontFamily: "sans-serif", fontWeight: 700, color: "#1a3a5c" }}>🎉 Paid — Download your solution</p>
                <a href={`https://ehomeworkmarket-production.up.railway.app${active.solutionFile}`} target="_blank" rel="noreferrer">
                  <button style={{ ...S.btnPrimary, marginTop: 10 }}>⬇ Download Solution</button>
                </a>
              </div>
            )}

            {/* Chat */}
            <div style={{ marginTop: 16 }}>
              <p style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, color: "#1a3a5c", marginBottom: 8 }}>💬 Chat with Expert</p>
              <div style={{ background: "#f9f7f4", border: "1px solid #ddd", borderRadius: 4, height: 200, overflowY: "auto", padding: 12, marginBottom: 8 }}>
                {messages.length === 0 && <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#aaa" }}>No messages yet. Ask a question below.</p>}
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 8, textAlign: m.sender === "student" ? "right" : "left" }}>
                    <span style={{ background: m.sender === "student" ? "#1a3a5c" : "#f5c842", color: m.sender === "student" ? "#fff" : "#1a3a5c", padding: "6px 12px", borderRadius: 12, fontSize: 13, fontFamily: "sans-serif", display: "inline-block", maxWidth: "80%" }}>{m.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...S.input, margin: 0, flex: 1 }} placeholder="Type a message..." value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} />
                <button style={S.btnPrimary} onClick={sendMsg}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────
function AdminDashboard({ user, token }) {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({});
  const [active, setActive] = useState(null);
  const [sol, setSol] = useState({ text: "", price: "" });
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [adminMsg, setAdminMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== "admin") { navigate("/"); return; }
    loadAll();
  }, [token]);

  const loadAll = () => {
    const h = { headers: { Authorization: `Bearer ${token}` } };
    axios.get(`${API}/admin/questions`, h).then(r => setQuestions(r.data));
    axios.get(`${API}/admin/stats`, h).then(r => setStats(r.data));
  };

  useEffect(() => {
    if (!active) return;
    axios.get(`${API}/questions/${active._id}/messages`).then(r => setMessages(r.data));
    if (!socketRef.current) socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join_room", active._id);
    socketRef.current.on("receive_message", d => setMessages(prev => [...prev, d]));
    return () => socketRef.current?.off("receive_message");
  }, [active]);

  const postSolution = async () => {
    if (!sol.text || !sol.price) return alert("Enter solution text and price");
    setSaving(true);
    const fd = new FormData();
    fd.append("solutionText", sol.text);
    fd.append("price", sol.price);
    if (file) fd.append("file", file);
    await axios.post(`${API}/admin/questions/${active._id}/solve`, fd, { headers: { Authorization: `Bearer ${token}` } });
    setSaving(false);
    loadAll();
    alert("Solution posted! Student notified by email.");
  };

  const sendAdminMsg = async () => {
    if (!adminMsg.trim()) return;
    const data = { questionId: active._id, roomId: active._id, sender: "admin", text: adminMsg, createdAt: new Date() };
    socketRef.current?.emit("send_message", data);
    await axios.post(`${API}/admin/questions/${active._id}/message`, { text: adminMsg }, { headers: { Authorization: `Bearer ${token}` } });
    setAdminMsg("");
  };

  const statusColors = { pending: "#fff8e0", in_progress: "#fff0e0", solved: "#e8ffe8", paid: "#e0f0ff" };

  return (
    <div style={S.container}>
      <h1 style={S.h1}>🛠 Admin Dashboard</h1>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Link to="/admin/upload"><button style={S.btnPrimary}>+ Upload Solution</button></Link>
        <Link to="/admin/manage"><button style={S.btnSecondary}>📋 Manage Library</button></Link>
        <Link to="/admin/sales"><button style={S.btnSecondary}>📊 Sales Report</button></Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total", value: stats.total || 0 },
          { label: "Pending", value: stats.pending || 0 },
          { label: "Solved", value: stats.solved || 0 },
          { label: "Paid", value: stats.paid || 0 },
          { label: "Students", value: stats.users || 0 },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontFamily: "Georgia", fontSize: 28, fontWeight: 700, color: "#1a3a5c" }}>{s.value}</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: active ? "1fr 1.5fr" : "1fr", gap: 20 }}>
        {/* Question list */}
        <div>
          {questions.map(q => (
            <div key={q._id} style={{ ...S.card, cursor: "pointer", background: statusColors[q.status], borderLeft: active?._id === q._id ? "4px solid #1a3a5c" : "4px solid transparent", padding: "16px 20px" }} onClick={() => { setActive(q); setSol({ text: q.solutionText || "", price: q.price || "" }); }}>
              <div style={S.flex}>
                <span style={{ fontFamily: "Georgia", fontWeight: 700, color: "#1a3a5c", fontSize: 15 }}>{q.subject}</span>
                <span style={S.badge(q.status)}>{q.status.replace("_", " ")}</span>
              </div>
              <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#777", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.description}</p>
              <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#aaa", marginTop: 4 }}>
                {q.userId?.email || q.guestEmail || "Guest"} · {new Date(q.createdAt).toLocaleDateString()}
                {q.budget && ` · Budget: $${q.budget}`}
              </div>
            </div>
          ))}
        </div>

        {/* Active question */}
        {active && (
          <div style={S.card}>
            <h3 style={{ fontFamily: "Georgia", color: "#1a3a5c", marginBottom: 4 }}>{active.subject}</h3>
            <p style={{ fontFamily: "sans-serif", fontSize: 12, color: "#aaa", marginBottom: 12 }}>
              From: {active.userId?.email || active.guestEmail || "Guest"} | Budget: ${active.budget || "Open"} | Deadline: {active.deadline || "N/A"}
            </p>
            <p style={{ fontFamily: "sans-serif", fontSize: 14, color: "#444", marginBottom: 16, background: "#f9f7f4", padding: 12, borderRadius: 4 }}>{active.description}</p>
            {active.fileUrl && <a href={`https://ehomeworkmarket-production.up.railway.app${active.fileUrl}`} target="_blank" rel="noreferrer" style={{ fontFamily: "sans-serif", fontSize: 13, color: "#1a3a5c" }}>📎 Download attached file</a>}

            {/* Post Solution */}
            {active.status !== "paid" && (
              <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 16 }}>
                <p style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 10 }}>Post Solution</p>
                <textarea style={S.textarea} placeholder="Write your solution here..." value={sol.text} onChange={e => setSol({ ...sol, text: e.target.value })} />
                <div style={S.row}>
                  <input style={{ ...S.input, flex: 1 }} type="number" placeholder="Set price (USD)" value={sol.price} onChange={e => setSol({ ...sol, price: e.target.value })} />
                  <input style={{ ...S.input, flex: 1 }} type="file" onChange={e => setFile(e.target.files[0])} />
                </div>
                <button style={{ ...S.btnGold, width: "100%" }} onClick={postSolution} disabled={saving}>{saving ? "Saving..." : "Post Solution & Notify Student →"}</button>
              </div>
            )}

            {/* Chat */}
            <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 16 }}>
              <p style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 13, color: "#1a3a5c", marginBottom: 8 }}>💬 Chat with Student</p>
              <div style={{ background: "#f9f7f4", border: "1px solid #ddd", borderRadius: 4, height: 180, overflowY: "auto", padding: 12, marginBottom: 8 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 8, textAlign: m.sender === "admin" ? "right" : "left" }}>
                    <span style={{ background: m.sender === "admin" ? "#1a3a5c" : "#f0ebe3", color: m.sender === "admin" ? "#fff" : "#333", padding: "6px 12px", borderRadius: 12, fontSize: 13, fontFamily: "sans-serif", display: "inline-block" }}>{m.text}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...S.input, margin: 0, flex: 1 }} placeholder="Reply to student..." value={adminMsg} onChange={e => setAdminMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAdminMsg()} />
                <button style={S.btnPrimary} onClick={sendAdminMsg}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────
// ── UPLOAD SOLUTION (admin) ───────────────────────────────────
// ── MY PURCHASES (student view) ───────────────────────────────
function MyPurchases({ user, token }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    axios.get(`${API}/payment/my-purchases`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setPurchases(r.data || []))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async (solutionId) => {
    setError("");
    setDownloadingId(solutionId);
    try {
      const r = await axios.get(`${API}/solutions/${solutionId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.open(r.data.url, "_blank");
    } catch (err) {
      setError("Could not generate download link. Please try again.");
    }
    setDownloadingId(null);
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={S.container}>
      <h1 style={S.h1}>📥 My Purchases</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        {purchases.length === 0
          ? "Your purchased solutions will appear here."
          : `You've purchased ${purchases.length} solution${purchases.length === 1 ? "" : "s"}. Click Download to get the file again anytime.`}
      </p>

      {error && <div style={{ background: "#fee", color: "#b00", padding: 10, borderRadius: 4, marginBottom: 12, fontSize: 14 }}>{error}</div>}

      {loading ? (
        <div style={{ ...S.card, textAlign: "center" }}>Loading...</div>
      ) : purchases.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: 10 }}>No purchases yet.</p>
          <Link to="/library"><button style={S.btnPrimary}>Browse Library</button></Link>
        </div>
      ) : (
        purchases.map(p => {
          const sol = p.solutionId;
          if (!sol) return null;
          return (
            <div key={p._id} style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "#1a3a5c", color: "#f5c842", padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{sol.subject}</span>
                    {sol.classCode && <span style={{ color: "#888", fontSize: 13 }}>{sol.classCode}</span>}
                    {sol.week && <span style={{ color: "#888", fontSize: 13 }}>· {sol.week}</span>}
                    <span style={{ background: "#2a8c4a", color: "#fff", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>✓ Purchased</span>
                  </div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1a3a5c", margin: "0 0 6px 0" }}>{sol.title}</h3>
                  <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
                    Purchased {formatDate(p.completedAt)} · ${p.amount} {p.currency}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => handleDownload(sol._id)}
                    disabled={downloadingId === sol._id}
                    style={{ ...S.btnPrimary, padding: "10px 20px", fontSize: 14 }}
                  >
                    {downloadingId === sol._id ? "Loading..." : "📥 Download"}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── PUBLIC LIBRARY ────────────────────────────────────────────
function Library() {
  usePageTitle("Solution Library — Browse Academic Solutions | eHomeworkMarket", "Browse thousands of expert-written academic solutions across Computer Science, Nursing, Statistics, MBA, and more. Preview before you buy.");
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("q", search);
    if (subjectFilter) params.append("subject", subjectFilter);
    params.append("limit", "50");

    axios.get(`${API}/solutions?${params.toString()}`)
      .then(r => setSolutions(r.data.solutions || []))
      .catch(() => setSolutions([]))
      .finally(() => setLoading(false));
  }, [search, subjectFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSubjectFilter("");
  };

  return (
    <div style={S.container}>
      <h1 style={S.h1}>📚 Solution Library</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Browse readymade solutions across subjects. Find what you need, pay, and download instantly.
      </p>

      <div style={S.card}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input
            style={{ ...S.input, flex: "2 1 250px", marginBottom: 0 }}
            placeholder="Search by class code, subject, or keyword (e.g. BUS375, leadership)"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <select
            style={{ ...S.input, flex: "1 1 150px", marginBottom: 0 }}
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" style={{ ...S.btnPrimary, marginBottom: 0 }}>Search</button>
          {(search || subjectFilter) && (
            <button type="button" onClick={clearFilters} style={{ ...S.btnSecondary, marginBottom: 0 }}>Clear</button>
          )}
        </form>

        {search || subjectFilter ? (
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>
            Showing results {search && <>for "<b>{search}</b>"</>}
            {search && subjectFilter && " "}
            {subjectFilter && <>in <b>{subjectFilter}</b></>}
            {" "}— <b>{solutions.length}</b> found
          </p>
        ) : (
          <p style={{ color: "#666", fontSize: 14, margin: 0 }}>{solutions.length} solutions available</p>
        )}
      </div>

      {loading ? (
        <div style={{ ...S.card, textAlign: "center" }}>Loading...</div>
      ) : solutions.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: 8 }}>No solutions found.</p>
          {(search || subjectFilter) && (
            <button onClick={clearFilters} style={S.btnSecondary}>Clear filters</button>
          )}
        </div>
      ) : (
        solutions.map(sol => (
          <div
            key={sol._id}
            style={{ ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}
            onClick={() => navigate(`/library/${sol._id}`)}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ background: "#1a3a5c", color: "#f5c842", padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{sol.subject}</span>
                {sol.classCode && <span style={{ color: "#888", fontSize: 13 }}>{sol.classCode}</span>}
                {sol.week && <span style={{ color: "#888", fontSize: 13 }}>· {sol.week}</span>}
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1a3a5c", margin: "0 0 6px 0" }}>{sol.title}</h3>
              <p style={{ color: "#555", fontSize: 14, margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {sol.description}
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1a3a5c" }}>${sol.price}</div>
              <div style={{ fontSize: 12, color: "#888" }}>View →</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── SOLUTION DETAIL ───────────────────────────────────────────
function SolutionDetail({ user, token }) {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const navigate = useNavigate();
  const id = window.location.pathname.split("/").pop();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/solutions/${id}`)
      .then(r => {
        setSolution(r.data);
        if (r.data?.title) {
          document.title = r.data.title + " | eHomeworkMarket";
          let meta = document.querySelector('meta[name="description"]');
          if (meta && r.data.description) meta.setAttribute('content', r.data.description.slice(0, 160));
        }
      })
      .catch(() => setSolution(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Check if user owns this solution (only if logged in)
  useEffect(() => {
    if (!token || !solution) return;
    axios.get(`${API}/payment/check/${solution._id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setOwned(r.data.owned))
      .catch(() => setOwned(false));
  }, [token, solution]);

  const handleDownload = async () => {
    try {
      const r = await axios.get(`${API}/solutions/${solution._id}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDownloadUrl(r.data.url);
      window.open(r.data.url, "_blank");
    } catch (err) {
      setError("Could not generate download link. Please try again.");
    }
  };

  if (loading) return <div style={S.container}><div style={S.card}>Loading...</div></div>;

  if (!solution) {
    return (
      <div style={S.container}>
        <div style={{ ...S.card, textAlign: "center" }}>
          <p>Solution not found.</p>
          <Link to="/library"><button style={S.btnPrimary}>← Back to Library</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div style={S.container}>
      <div style={{ marginBottom: 14 }}>
        <Link to="/library" style={{ color: "#1a3a5c", fontSize: 14, fontFamily: "sans-serif", textDecoration: "none" }}>← Back to Library</Link>
      </div>

      <div style={S.card}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ background: "#1a3a5c", color: "#f5c842", padding: "3px 12px", borderRadius: 4, fontSize: 13, fontWeight: 600 }}>{solution.subject}</span>
          {solution.classCode && <span style={{ color: "#888", fontSize: 14 }}>{solution.classCode}</span>}
          {solution.week && <span style={{ color: "#888", fontSize: 14 }}>· {solution.week}</span>}
        </div>

        <h1 style={{ ...S.h1, marginBottom: 14 }}>{solution.title}</h1>

        <div style={{ background: "#f9f7f1", padding: 16, borderRadius: 6, marginBottom: 18 }}>
          <p style={{ color: "#333", fontSize: 15, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>{solution.description}</p>
        </div>
        

        {solution.keywords && solution.keywords.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>Topics covered:</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {solution.keywords.map(k => (
                <span key={k} style={{ background: "#e8e3d5", color: "#1a3a5c", padding: "3px 10px", borderRadius: 12, fontSize: 12 }}>{k}</span>
              ))}
            </div>
          </div>
        )}

        {solution.previewText && solution.previewText.trim() && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "#c9a961", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>Preview</span>
              {solution.pageCount && (
                <span style={{ color: "#888", fontSize: 13 }}>· {solution.pageCount} page{solution.pageCount > 1 ? "s" : ""}</span>
              )}
            </div>
            <div style={{ background: "#fffdf6", border: "1px solid #e8dfc8", borderLeft: "3px solid #c9a961", padding: 16, borderRadius: 6 }}>
              <p style={{ color: "#444", fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", fontFamily: "Georgia, serif" }}>{solution.previewText}</p>
              <div style={{ marginTop: 10, fontSize: 12, color: "#999", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                Sample shown. Full solution available after purchase.
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid #e0d8c8", paddingTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Price</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1a3a5c", fontFamily: "Georgia, serif" }}>${solution.price}</div>
            </div>
            {owned && <span style={{ background: "#2a8c4a", color: "#fff", padding: "6px 14px", borderRadius: 4, fontSize: 14, fontWeight: 600 }}>✓ Purchased</span>}
          </div>

          {error && <div style={{ background: "#fee", color: "#b00", padding: 10, borderRadius: 4, marginBottom: 12, fontSize: 14 }}>{error}</div>}
          {success && <div style={{ background: "#efe", color: "#060", padding: 10, borderRadius: 4, marginBottom: 12, fontSize: 14 }}>{success}</div>}

          {owned ? (
            <button onClick={handleDownload} style={{ ...S.btnPrimary, width: "100%", fontSize: 16, padding: "12px 28px" }}>
              📥 Download Solution
            </button>
          ) : !token ? (
            <div>
              <p style={{ color: "#666", marginBottom: 10 }}>Please log in or sign up to purchase this solution.</p>
              <Link to="/login"><button style={{ ...S.btnPrimary, width: "100%", fontSize: 16, padding: "12px 28px" }}>Login to Buy →</button></Link>
            </div>
          ) : (
            <div>
              <p style={{ color: "#666", marginBottom: 10, fontSize: 14 }}>Pay securely via PayPal:</p>
              <PayPalButtons
                disabled={paying}
                style={{ layout: "vertical", color: "blue", shape: "rect", label: "pay" }}
                createOrder={async () => {
                  setError("");
                  setPaying(true);
                  try {
                    const r = await axios.post(
                      `${API}/payment/create-order/${solution._id}`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    return r.data.orderId;
                  } catch (err) {
                    setPaying(false);
                    if (err.response?.data?.alreadyOwned) {
                      setOwned(true);
                      setError("");
                      throw new Error("Already owned");
                    }
                    setError(err.response?.data?.message || "Could not start payment");
                    throw err;
                  }
                }}
                onApprove={async (data) => {
                  try {
                    await axios.post(
                      `${API}/payment/capture-order/${data.orderID}`,
                      {},
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setOwned(true);
                    setSuccess("Payment successful! You can now download.");
                    setPaying(false);
                  } catch (err) {
                    setPaying(false);
                    setError("Payment captured but recording failed. Please contact support.");
                  }
                }}
                onError={(err) => {
                  setPaying(false);
                  setError("PayPal error. Please try again.");
                }}
                onCancel={() => {
                  setPaying(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN SALES REPORT ────────────────────────────────────────
function AdminSalesReport({ user, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== "admin") { navigate("/"); return; }
    setLoading(true);
    axios.get(`${API}/payment/admin/sales-summary`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => setError("Could not load sales data"))
      .finally(() => setLoading(false));
  }, [token]);

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatMonth = (m) => {
    if (!m) return "";
    const [y, mo] = m.split("-");
    const date = new Date(parseInt(y), parseInt(mo) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (loading) return <div style={S.container}><div style={S.card}>Loading sales data...</div></div>;
  if (error) return <div style={S.container}><div style={{ ...S.card, color: "#b00" }}>{error}</div></div>;
  if (!data) return null;

  const avgSale = data.totalSales > 0 ? (data.totalRevenue / data.totalSales).toFixed(2) : "0.00";
  const monthEntries = Object.entries(data.byMonth || {}).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div style={S.container}>
      <h1 style={S.h1}>📊 Sales Report</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Overview of all completed purchases on eHomeworkMarket.
      </p>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "20px", textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#1a3a5c" }}>${data.totalRevenue.toFixed(2)}</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Total Revenue</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "20px", textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#1a3a5c" }}>{data.totalSales}</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Total Sales</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "20px", textAlign: "center" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 32, fontWeight: 700, color: "#1a3a5c" }}>${avgSale}</div>
          <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>Average Sale</div>
        </div>
      </div>

      {/* Monthly breakdown */}
      {monthEntries.length > 0 && (
        <div style={{ ...S.card, marginBottom: 20 }}>
          <h2 style={{ ...S.h2, fontSize: 18, marginBottom: 12 }}>Monthly Breakdown</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Month</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Sales</th>
                <th style={{ textAlign: "right", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {monthEntries.map(([month, stats]) => (
                <tr key={month} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px 6px", color: "#1a3a5c", fontWeight: 600 }}>{formatMonth(month)}</td>
                  <td style={{ textAlign: "right", padding: "10px 6px" }}>{stats.count}</td>
                  <td style={{ textAlign: "right", padding: "10px 6px", fontWeight: 600 }}>${stats.revenue.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent purchases */}
      <div style={S.card}>
        <h2 style={{ ...S.h2, fontSize: 18, marginBottom: 12 }}>Recent Purchases ({data.recent.length})</h2>
        {data.recent.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", padding: 20 }}>No purchases yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "sans-serif", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: "left", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Buyer</th>
                  <th style={{ textAlign: "left", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Solution</th>
                  <th style={{ textAlign: "right", padding: "8px 6px", color: "#666", fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map(p => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px 6px", color: "#666" }}>{formatDate(p.completedAt)}</td>
                    <td style={{ padding: "10px 6px" }}>
                      <div style={{ color: "#1a3a5c", fontWeight: 600 }}>{p.userId?.name || "Unknown"}</div>
                      <div style={{ color: "#888", fontSize: 11 }}>{p.userId?.email || "-"}</div>
                    </td>
                    <td style={{ padding: "10px 6px" }}>
                      <div style={{ color: "#1a3a5c" }}>{p.solutionId?.title || "Deleted solution"}</div>
                      {p.solutionId?.classCode && <div style={{ color: "#888", fontSize: 11 }}>{p.solutionId.classCode}</div>}
                    </td>
                    <td style={{ textAlign: "right", padding: "10px 6px", fontWeight: 600, color: "#1a3a5c" }}>${p.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN MANAGE LIBRARY ──────────────────────────────────────
function AdminManageLibrary({ user, token }) {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // solution being edited (or null)
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== "admin") { navigate("/"); return; }
    loadAll();
  }, [token]);

  const loadAll = () => {
    setLoading(true);
    axios.get(`${API}/solutions?limit=200`)
      .then(r => setSolutions(r.data.solutions || []))
      .catch(() => setSolutions([]))
      .finally(() => setLoading(false));
  };

const startEdit = (sol) => {
    setEditing(sol._id);
    setEditForm({
      title: sol.title,
      subject: sol.subject,
      classCode: sol.classCode || "",
      week: sol.week || "",
      description: sol.description,
      previewText: sol.previewText || "",
      pageCount: sol.pageCount || "",
      keywords: (sol.keywords || []).join(", "),
      price: sol.price
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editForm.title || !editForm.description || !editForm.price) {
      return alert("Title, description, and price are required");
    }
    setSaving(true);
    try {
      await axios.put(`${API}/solutions/${editing}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      cancelEdit();
      loadAll();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.message || err.message));
    }
    setSaving(false);
  };

  const doDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API}/solutions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmDelete(null);
      loadAll();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
    setDeletingId(null);
  };

  const formatDate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div style={S.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ ...S.h1, marginBottom: 0 }}>📋 Manage Library</h1>
        <Link to="/admin/upload"><button style={S.btnPrimary}>+ Upload New Solution</button></Link>
      </div>
      <p style={{ color: "#666", marginBottom: 20 }}>
        {solutions.length} solution{solutions.length === 1 ? "" : "s"} in library. Click Edit to update details, or Delete to remove permanently.
      </p>

      {loading ? (
        <div style={{ ...S.card, textAlign: "center" }}>Loading...</div>
      ) : solutions.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center" }}>
          <p style={{ color: "#666", marginBottom: 10 }}>No solutions uploaded yet.</p>
          <Link to="/admin/upload"><button style={S.btnPrimary}>Upload Your First Solution</button></Link>
        </div>
      ) : (
        solutions.map(sol => (
          <div key={sol._id} style={S.card}>
            {editing === sol._id ? (
              // EDIT MODE — form
              <div>
                <label style={S.label}>Title *</label>
                <input style={S.input} value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />

                <label style={S.label}>Subject *</label>
                <select style={S.input} value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })}>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Class Code</label>
                    <input style={S.input} value={editForm.classCode} onChange={e => setEditForm({ ...editForm, classCode: e.target.value })} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Week</label>
                    <input style={S.input} value={editForm.week} onChange={e => setEditForm({ ...editForm, week: e.target.value })} />
                  </div>
                </div>

                <label style={S.label}>Description *</label>
                <textarea style={{ ...S.input, minHeight: 80 }} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />

                <label style={S.label}>Preview Text</label>
                <textarea style={{ ...S.input, minHeight: 80 }} value={editForm.previewText} onChange={e => setEditForm({ ...editForm, previewText: e.target.value })} placeholder="Public preview text shown to students" />

                <label style={S.label}>Total Pages</label>
                <input style={S.input} type="number" min="1" value={editForm.pageCount} onChange={e => setEditForm({ ...editForm, pageCount: e.target.value })} placeholder="e.g. 12" />

                <label style={S.label}>Keywords (comma separated)</label>
                <input style={S.input} value={editForm.keywords} onChange={e => setEditForm({ ...editForm, keywords: e.target.value })} />

                <label style={S.label}>Price (USD) *</label>
                <input style={S.input} type="number" step="0.01" min="0" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />

                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={saveEdit} disabled={saving} style={{ ...S.btnPrimary, flex: 1 }}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={cancelEdit} style={{ ...S.btnSecondary, flex: 1 }}>Cancel</button>
                </div>
              </div>
            ) : confirmDelete === sol._id ? (
              // DELETE CONFIRMATION
              <div>
                <p style={{ color: "#b00", fontWeight: 600, marginBottom: 8 }}>⚠️ Delete "{sol.title}"?</p>
                <p style={{ color: "#666", fontSize: 14, marginBottom: 14 }}>
                  This will permanently delete the file from storage and the record from the database. Students who already purchased it will lose access. This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => doDelete(sol._id)} disabled={deletingId === sol._id} style={{ ...S.btnPrimary, background: "#b00", flex: 1 }}>
                    {deletingId === sol._id ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button onClick={() => setConfirmDelete(null)} style={{ ...S.btnSecondary, flex: 1 }}>Cancel</button>
                </div>
              </div>
            ) : (
              // VIEW MODE — list row
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "#1a3a5c", color: "#f5c842", padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{sol.subject}</span>
                    {sol.classCode && <span style={{ color: "#888", fontSize: 13 }}>{sol.classCode}</span>}
                    {sol.week && <span style={{ color: "#888", fontSize: 13 }}>· {sol.week}</span>}
                    <span style={{ color: "#888", fontSize: 13 }}>· {formatDate(sol.createdAt)}</span>
                  </div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#1a3a5c", margin: "0 0 6px 0" }}>{sol.title}</h3>
                  <p style={{ color: "#666", fontSize: 13, margin: "0 0 4px 0" }}>📄 {sol.fileName}</p>
                  <p style={{ color: "#555", fontSize: 14, margin: 0, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {sol.description}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#1a3a5c" }}>${sol.price}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(sol)} style={{ ...S.btnSecondary, padding: "6px 14px", fontSize: 13 }}>Edit</button>
                    <button onClick={() => setConfirmDelete(sol._id)} style={{ ...S.btnSecondary, padding: "6px 14px", fontSize: 13, color: "#b00", borderColor: "#b00" }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── UPLOAD SOLUTION (admin) ───────────────────────────────────
function UploadSolution({ user, token }) {
  const [form, setForm] = useState({ title: "", subject: "Business", classCode: "", week: "", description: "", previewText: "", pageCount: "", keywords: "", price: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== "admin") navigate("/");
  }, [token]);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !file) {
      return alert("Title, description, price, and file are required");
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      fd.append("file", file);
      await axios.post(`${API}/solutions`, fd, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess(true);
      setForm({ title: "", subject: "Business", classCode: "", week: "", description: "", previewText: "", pageCount: "", keywords: "", price: "" });
      setFile(null);
      const fileInput = document.getElementById("upload-file-input");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    }
    setSaving(false);
  };

  if (success) {
    return (
      <div style={S.container}>
        <div style={{ ...S.card, textAlign: "center" }}>
          <div style={{ fontSize: 48, color: "#2a8c4a", marginBottom: 12 }}>✅</div>
          <h2 style={S.h2}>Solution Uploaded!</h2>
          <p>Your solution is now in the library.</p>
          <button onClick={() => setSuccess(false)} style={{ ...S.btnPrimary, marginRight: 10 }}>Upload Another</button>
          <button onClick={() => navigate("/admin")} style={S.btnSecondary}>Back to Admin</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.container}>
      <h1 style={S.h1}>📚 Upload Solution to Library</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>Add a readymade solution that students can search and purchase.</p>
      <form onSubmit={submit} style={S.card}>
        <label style={S.label}>Title *</label>
        <input style={S.input} value={form.title} onChange={e => update("title", e.target.value)} placeholder="e.g. BUS375 Week 8 Discussion Solution" required />

        <label style={S.label}>Subject *</label>
        <select style={S.input} value={form.subject} onChange={e => update("subject", e.target.value)} required>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Class Code</label>
            <input style={S.input} value={form.classCode} onChange={e => update("classCode", e.target.value)} placeholder="e.g. BUS375" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Week</label>
            <input style={S.input} value={form.week} onChange={e => update("week", e.target.value)} placeholder="e.g. Week 8" />
          </div>
        </div>

        <label style={S.label}>Description *</label>
        <textarea style={{ ...S.input, minHeight: 80 }} value={form.description} onChange={e => update("description", e.target.value)} placeholder="Brief preview shown to students before purchase" required />
          <label style={S.label}>Preview Text</label>
        <textarea style={{ ...S.input, minHeight: 80 }} value={form.previewText} onChange={e => update("previewText", e.target.value)} placeholder="A few lines from the solution shown publicly. For long solutions paste 2-3 paragraphs; for short solutions paste 3-4 lines only. Students see this as a 'taste' before purchasing." />

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Total Pages</label>
            <input style={S.input} type="number" min="1" value={form.pageCount} onChange={e => update("pageCount", e.target.value)} placeholder="e.g. 12" />
          </div>
          <div style={{ flex: 1 }}>
            
          </div>
        </div>

        <label style={S.label}>Keywords (comma separated)</label>
        <input style={S.input} value={form.keywords} onChange={e => update("keywords", e.target.value)} placeholder="leadership, management, ethics" />

        <label style={S.label}>Price (USD) *</label>
        <input style={S.input} type="number" step="0.01" min="0" value={form.price} onChange={e => update("price", e.target.value)} placeholder="15" required />

        <label style={S.label}>Solution File * (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX — max 50MB)</label>
        <input id="upload-file-input" style={S.input} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" onChange={e => setFile(e.target.files[0])} required />

        <button type="submit" disabled={saving} style={{ ...S.btnPrimary, marginTop: 16, width: "100%" }}>
          {saving ? "Uploading..." : "Upload Solution"}
        </button>
      </form>
    </div>
  );
}


// ── CONTACT PAGE ─────────────────────────────────────────────
function ContactPage() {
  usePageTitle("Contact Us | eHomeworkMarket", "Get in touch with eHomeworkMarket. We typically reply within a few hours.");
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return alert('Please fill in all required fields');
    const mailtoLink = `mailto:support@ehomeworkmarket.com?subject=${encodeURIComponent(form.subject || 'Contact from website')}&body=${encodeURIComponent('Name: ' + form.name + '\nEmail: ' + form.email + '\n\n' + form.message)}`;
    window.location.href = mailtoLink;
    setSent(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '52px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#14748F', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Get in touch</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0D2137', marginBottom: 10 }}>Contact Us</h1>
          <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.65 }}>Have a question or need help? We typically reply within a few hours.</p>
        </div>

        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '32px 28px', marginBottom: 20 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0D2137', marginBottom: 8 }}>Message sent!</h2>
              <p style={{ color: '#6B7280' }}>We will get back to you at {form.email} shortly.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Your name *</label>
                  <input style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', boxSizing: 'border-box' }} placeholder="John Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email address *</label>
                  <input style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', boxSizing: 'border-box' }} type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject</label>
                <input style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', boxSizing: 'border-box' }} placeholder="e.g. Question about an order" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message *</label>
                <textarea style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontFamily: 'sans-serif', minHeight: 140, resize: 'vertical', boxSizing: 'border-box' }} placeholder="Tell us how we can help..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              </div>
              <button onClick={handleSubmit} style={{ width: '100%', padding: '13px', background: '#14748F', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'sans-serif' }}>Send Message →</button>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { icon: '📧', label: 'Email us', value: 'support@ehomeworkmarket.com' },
            { icon: '⏱️', label: 'Response time', value: 'Within a few hours' },
            { icon: '🌍', label: 'Available', value: '24/7 support' },
          ].map(item => (
            <div key={item.label} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: '#0D2137', fontWeight: 600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── LEGAL PAGE TEMPLATE ───────────────────────────────────────
function LegalPage({ title, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '52px 24px 80px' }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#14748F', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Legal</p>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#0D2137', marginBottom: 10 }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF' }}>Last updated: June 2026 &nbsp;·&nbsp; eHomeworkMarket is operated by Massinfotech, India</p>
        </div>
        <div style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '36px 32px', lineHeight: 1.75, color: '#374151', fontSize: 15 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const lh = (text) => <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0D2137', margin: '28px 0 10px' }}>{text}</h2>;
const lp = (text) => <p style={{ marginBottom: 14 }}>{text}</p>;
const ll = (items) => <ul style={{ paddingLeft: 20, marginBottom: 14 }}>{items.map((i,k) => <li key={k} style={{ marginBottom: 6 }}>{i}</li>)}</ul>;

function PrivacyPage() {
  usePageTitle("Privacy Policy | eHomeworkMarket", "Read eHomeworkMarket's privacy policy to understand how we collect, use, and protect your information.");
  return (
    <LegalPage title="Privacy Policy">
      {lp("This Privacy Policy explains what information eHomeworkMarket (operated by Massinfotech, India) collects when you use www.ehomeworkmarket.com, how we use it, and the choices you have.")}
      {lh("Information we collect")}
      {ll(["Account information: when you register, we collect your name and email address.", "Payment information: payments are processed by PayPal. We do not collect or store your credit/debit card details.", "Usage and analytics data: we use Google Analytics (GA4) to understand how visitors use the Site.", "Communications: transactional emails are sent using Resend."])}
      {lh("How we use your information")}
      {ll(["Create and manage your account", "Process purchases and deliver the materials you buy", "Send transactional emails related to your account and purchases", "Understand and improve how the Site is used"])}
      {lh("Sharing of information")}
      {lp("We do not sell your personal information to third parties. We share information only with service providers that help us operate the Site (PayPal, Google Analytics, Resend, Cloudflare R2), and only as needed for them to provide their service, or where required by law.")}
      {lh("Cookies and analytics")}
      {lp("The Site uses cookies and similar technologies, mainly through Google Analytics, to measure usage. You can control or disable cookies through your browser settings.")}
      {lh("Data retention")}
      {lp("We keep your information for as long as your account is active or as needed to provide the service and meet legal or business requirements.")}
      {lh("Your choices")}
      {lp("You can contact us at support@ehomeworkmarket.com to ask about the information we hold about you, to request corrections, or to request deletion of your account.")}
      {lh("Children")}
      {lp("The Site is intended for college students and adults. It is not directed at children under the age of 13.")}
      {lh("Contact")}
      {lp("Questions about privacy: support@ehomeworkmarket.com — Massinfotech, India.")}
    </LegalPage>
  );
}

function TermsPage() {
  usePageTitle("Terms of Service | eHomeworkMarket", "Read the terms of service for using eHomeworkMarket's academic assistance platform.");
  return (
    <LegalPage title="Terms of Service">
      {lh("1. Who we are")}
      {lp("eHomeworkMarket is a service operated by Massinfotech, a company registered in India. By accessing or using www.ehomeworkmarket.com or buying anything through it, you agree to these Terms of Service.")}
      {lh("2. What we provide")}
      {lp("eHomeworkMarket offers academic study materials and tutoring-related services, including readymade solutions available for purchase and download, and the ability to post assignment questions. All materials are provided as study, research, and reference resources.")}
      {lh("3. Accounts")}
      {lp("To buy or download materials you may need to create an account. You are responsible for keeping your login details secure and for all activity that happens under your account.")}
      {lh("4. Acceptable use")}
      {ll(["Do not use the Site for any unlawful purpose", "Do not resell, redistribute, or publicly share materials purchased from the Site", "Do not attempt to gain unauthorized access to the Site or other users' accounts", "Do not interfere with or disrupt the Site's operation"])}
      {lh("5. Purchases and payment")}
      {lp("Prices are listed in US dollars. Payments are processed by PayPal. When you buy a solution, you receive a personal-use license to download and use it for your own study and reference.")}
      {lh("6. Refunds")}
      {lp("Refunds are handled under our Refund Policy. If a purchased solution does not deliver what was described, contact us at support@ehomeworkmarket.com with details and we will review and issue a refund where the claim is valid.")}
      {lh("7. Intellectual property")}
      {lp("All content on the Site is owned by Massinfotech or its licensors. Purchasing a solution gives you a personal-use license — it does not transfer ownership or the right to redistribute.")}
      {lh("8. Academic responsibility")}
      {lp("Materials are provided for educational and reference purposes only. You are solely responsible for how you use them and for complying with the academic-integrity rules of your institution.")}
      {lh("9. Limitation of liability")}
      {lp("The Site and its materials are provided 'as is'. To the maximum extent permitted by law, Massinfotech is not liable for any indirect, incidental, or consequential damages. Our total liability for any claim is limited to the amount you paid for that purchase.")}
      {lh("10. Governing law")}
      {lp("These Terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of the courts of India.")}
      {lh("11. Contact")}
      {lp("Questions: support@ehomeworkmarket.com — Massinfotech, India.")}
    </LegalPage>
  );
}

function RefundPage() {
  usePageTitle("Refund Policy | eHomeworkMarket", "Learn about eHomeworkMarket's refund policy for purchased academic solutions.");
  return (
    <LegalPage title="Refund Policy">
      {lh("Our commitment")}
      {lp("We want you to get genuine value from what you buy on eHomeworkMarket. If a purchased solution does not deliver what was described on its product page, we will make it right.")}
      {lh("When you can request a refund")}
      {ll(["The solution does not match the description, subject, or scope shown on its product page", "The solution is incomplete, unusable, or substantially different from what was advertised"])}
      {lh("How to request a refund")}
      {lp("Email us at support@ehomeworkmarket.com with: the email address used for the purchase, the name of the solution and your order/transaction reference, and a clear explanation of the problem with supporting proof.")}
      {lh("How we handle requests")}
      {lp("We review each request individually. Where the claim is valid, we issue a refund to your original payment method via PayPal. We aim to review requests promptly after receiving the necessary information.")}
      {lh("What is not covered")}
      {ll(["The solution delivered matches its description and was usable, but you simply changed your mind", "The request is based on issues outside the solution itself (for example, how it was used)"])}
      {lh("Contact")}
      {lp("Refund questions: support@ehomeworkmarket.com — Massinfotech, India.")}
    </LegalPage>
  );
}

function AcademicIntegrityPage() {
  usePageTitle("Academic Integrity Disclaimer | eHomeworkMarket", "eHomeworkMarket's academic integrity policy and responsible use guidelines.");
  return (
    <LegalPage title="Academic Integrity Disclaimer">
      {lp("eHomeworkMarket provides academic study materials and tutoring-related services strictly for educational and reference purposes.")}
      {lh("Intended use")}
      {lp("All materials available on eHomeworkMarket — including readymade solutions and expert-assisted work — are intended to be used as study aids, reference materials, and learning resources. They are designed to help students understand concepts, approaches, and structures used in academic work.")}
      {lh("Your responsibility")}
      {ll(["You are solely responsible for how you use materials purchased or obtained from eHomeworkMarket", "You must review, verify, and prepare your own work before submitting anything to any institution or platform", "You are responsible for complying with your institution's academic-integrity policies, honor codes, and any applicable rules"])}
      {lh("No contract cheating")}
      {lp("eHomeworkMarket does not endorse, encourage, or facilitate academic dishonesty, plagiarism, or any violation of institutional policies. Any misuse of our materials in violation of your institution's rules is solely your responsibility.")}
      {lh("Contact")}
      {lp("Questions: support@ehomeworkmarket.com — Massinfotech, India.")}
    </LegalPage>
  );
}

function DMCAPage() {
  usePageTitle("DMCA Policy | eHomeworkMarket", "eHomeworkMarket's DMCA copyright policy and infringement reporting process.");
  return (
    <LegalPage title="DMCA Policy">
      {lp("eHomeworkMarket (operated by Massinfotech) respects intellectual property rights and expects users to do the same.")}
      {lh("Reporting copyright infringement")}
      {lp("If you believe that content on www.ehomeworkmarket.com infringes your copyright, please send a notice to support@ehomeworkmarket.com with the following information:")}
      {ll(["A description of the copyrighted work you claim has been infringed", "A description of where the infringing material is located on our Site", "Your contact information (name, address, email, phone number)", "A statement that you have a good faith belief that the use is not authorized by the copyright owner", "A statement that the information in your notice is accurate and, under penalty of perjury, that you are the copyright owner or authorized to act on their behalf", "Your physical or electronic signature"])}
      {lh("Response")}
      {lp("We will review all valid DMCA notices and respond promptly. We reserve the right to remove content alleged to be infringing and to terminate accounts of repeat infringers.")}
      {lh("Contact")}
      {lp("DMCA notices: support@ehomeworkmarket.com — Massinfotech, India.")}
    </LegalPage>
  );
}


// ── SITE FOOTER (shown on all pages except homepage) ──────────
function SiteFooter() {
  const location = useLocation();
  if (location.pathname === "/") return null;
  return (
    <footer style={{ background: '#0D2137', padding: '36px 24px 20px', marginTop: 40, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: 28, marginBottom: 28 }}>
          <div>
            <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 10 }}>📚 eHomeworkMarket</div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, maxWidth: 220 }}>Expert academic assistance for college students worldwide. Confidential, fast, and reliable.</p>
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Services</h4>
            <Link to="/ask" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Assignment help</Link>
            <Link to="/library" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Solutions library</Link>
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Company</h4>
            <Link to="/contact" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Contact us</Link>
            <Link to="/register" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Create account</Link>
          </div>
          <div>
            <h4 style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Legal</h4>
            <Link to="/privacy" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Privacy policy</Link>
            <Link to="/terms" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Terms & conditions</Link>
            <Link to="/refund" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Refund policy</Link>
            <Link to="/academic-integrity" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>Academic integrity</Link>
            <Link to="/dmca" style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8 }}>DMCA policy</Link>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© 2026 Massinfotech. All rights reserved. eHomeworkMarket is a service of Massinfotech, India.</span>
        </div>
      </div>
    </footer>
  );
}


// ── PER-PAGE SEO TITLES ─────────────────────────────────────
function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}

export default function App() {
  const { user, token, login, logout } = useAuth();

  useEffect(() => {
    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
    s1.async=true;
    s1.src='https://embed.tawk.to/6a311e978f2f141d3fcb905e/1jr7tv0a3';
    s1.charset='UTF-8';
    s1.setAttribute('crossorigin','*');
    s0.parentNode.insertBefore(s1,s0);
  }, []);


  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
    <BrowserRouter>
      <div style={S.page}>
        <ConditionalNav user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register login={login} />} />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="/ask" element={<AskQuestion user={user} token={token} />} />
          <Route path="/dashboard" element={<Dashboard user={user} token={token} />} />
          <Route path="/admin" element={<AdminDashboard user={user} token={token} />} />
          <Route path="/admin/upload" element={<UploadSolution user={user} token={token} />} />
          <Route path="/admin/manage" element={<AdminManageLibrary user={user} token={token} />} />
          <Route path="/admin/sales" element={<AdminSalesReport user={user} token={token} />} />
          <Route path="/library" element={<Library />} />
          <Route path="/my-purchases" element={<MyPurchases user={user} token={token} />} />
          <Route path="/library/:id" element={<SolutionDetail user={user} token={token} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund" element={<RefundPage />} />
          <Route path="/academic-integrity" element={<AcademicIntegrityPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
          <Route path="/subjects/:slug" element={<LandingPage type="subject" />} />
          <Route path="/help/:slug" element={<LandingPage type="help" />} />
          <Route path="/universities/:slug" element={<LandingPage type="university" />} />
        </Routes>
        <SiteFooter />
      </div>
    </BrowserRouter>
    </PayPalScriptProvider>
  );
}
