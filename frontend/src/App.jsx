import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

const API = "https://ehomeworkmarket-production.up.railway.app/api";
const SOCKET_URL = "https://ehomeworkmarket-production.up.railway.app";

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
  page: { minHeight: "100vh", background: "#f5f3ee", fontFamily: "'Georgia', serif" },
  nav: { background: "#1a3a5c", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 },
  navBrand: { color: "#f5c842", fontSize: 20, fontWeight: 700, textDecoration: "none" },
  navLink: { color: "#cce0f5", fontSize: 14, textDecoration: "none", marginLeft: 20, fontFamily: "sans-serif" },
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

// ── NAV ──────────────────────────────────────────────────────
function Nav({ user, logout }) {
  const navigate = useNavigate();
  return (
    <nav style={S.nav}>
      <Link to="/" style={S.navBrand}>📚 eHomeworkMarket</Link>
      <div>
        {user ? (
          <>
            <Link to="/dashboard" style={S.navLink}>My Assignments</Link>
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
  return (
    <div>
      {/* Hero */}
      <div style={{ background: "#1a3a5c", color: "#fff", padding: "64px 24px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia", fontSize: 40, color: "#f5c842", marginBottom: 12 }}>Get Help With Your Assignment</h1>
        <p style={{ fontSize: 18, color: "#cce0f5", maxWidth: 600, margin: "0 auto 28px", fontFamily: "sans-serif" }}>
          Post your question, get expert help, and <strong style={{ color: "#f5c842" }}>100% original & plagiarism free assignments</strong>.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/ask"><button style={S.btnGold}>Post Your Question →</button></Link>
          <Link to="/register"><button style={{ ...S.btnPrimary, background: "transparent", border: "2px solid #cce0f5" }}>Create Free Account</button></Link>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "#f5f3ee", padding: "52px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ ...S.h2, textAlign: "center", fontSize: 28 }}>How It Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginTop: 28 }}>
            {[
              { n: "1", icon: "📋", t: "Post Assignment", d: "Describe your question, set your budget & deadline", highlight: false },
              { n: "2", icon: "✍️", t: "Expert Assigned", d: "A verified tutor picks up your assignment", highlight: false },
              { n: "3", icon: "📬", t: "Get Solution", d: "Receive notification when your work is ready", highlight: false },
              { n: "4", icon: "🎁", t: "First Assignment FREE!", d: "Get your very first assignment solved at absolutely no cost. Zero risk, zero payment.", highlight: true },
            ].map(s => (
              <div key={s.n} style={{ ...S.card, ...(s.highlight ? { background: "#1a3a5c", border: "2px solid #f5c842", transform: "scale(1.04)" } : {}) }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                {!s.highlight && <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#1a3a5c", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Step {s.n}</div>}
                {s.highlight && <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#f5c842", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>🌟 Special Offer</div>}
                <div style={{ fontFamily: "Georgia", fontSize: 16, fontWeight: 700, color: s.highlight ? "#f5c842" : "#1a3a5c", marginBottom: 6 }}>{s.t}</div>
                <div style={{ fontFamily: "sans-serif", fontSize: 13, color: s.highlight ? "#cce0f5" : "#666" }}>{s.d}</div>
                {s.highlight && <div style={{ marginTop: 12 }}><Link to="/ask"><button style={{ ...S.btnGold, fontSize: 12, padding: "8px 16px" }}>Claim Free Assignment →</button></Link></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div style={{ background: "#1a3a5c", padding: "36px 24px", textAlign: "center" }}>
        <p style={{ color: "#cce0f5", fontFamily: "sans-serif", fontSize: 14, marginBottom: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}>Subjects We Cover</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, maxWidth: 700, margin: "0 auto" }}>
          {subjects.map(s => <span key={s} style={{ background: "#2a4a6c", color: "#cce0f5", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontFamily: "sans-serif" }}>{s}</span>)}
        </div>
      </div>
    </div>
  );
}

// ── REGISTER ─────────────────────────────────────────────────
function Register({ login }) {
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
                <a href={`http://localhost:5000${active.solutionFile}`} target="_blank" rel="noreferrer">
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
            {active.fileUrl && <a href={`http://localhost:5000${active.fileUrl}`} target="_blank" rel="noreferrer" style={{ fontFamily: "sans-serif", fontSize: 13, color: "#1a3a5c" }}>📎 Download attached file</a>}

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
export default function App() {
  const { user, token, login, logout } = useAuth();

  return (
    <BrowserRouter>
      <div style={S.page}>
        <Nav user={user} logout={logout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register login={login} />} />
          <Route path="/login" element={<Login login={login} />} />
          <Route path="/ask" element={<AskQuestion user={user} token={token} />} />
          <Route path="/dashboard" element={<Dashboard user={user} token={token} />} />
          <Route path="/admin" element={<AdminDashboard user={user} token={token} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
