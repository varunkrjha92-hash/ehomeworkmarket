import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./HomePage.css";

const API = "https://ehomeworkmarket-production.up.railway.app/api";

const SERVICE_CARDS = [
  { title: "Get assignment help", desc: "Post your assignment and get matched with a qualified expert in minutes. Fast turnaround, 24/7.", link: "/ask", still: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80&auto=format&fit=crop", motion: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80&auto=format&fit=crop", options: ["Computer Science", "Nursing", "Statistics", "MBA / Business", "Mathematics"] },
  { title: "Browse ready solutions", desc: "Thousands of expert-written, verified solutions available instantly — preview before you buy.", link: "/library", still: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80&auto=format&fit=crop", motion: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=80&auto=format&fit=crop", options: ["Programming Solutions", "Nursing Case Plans", "Business Analysis", "Statistics Reports", "Psychology Papers"] },
  { title: "Ask an expert now", desc: "Direct one-on-one help from subject specialists. Real replies, not bots. Available 24/7.", link: "/ask", still: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80&auto=format&fit=crop", motion: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop", options: ["Computer Science Expert", "Nursing Specialist", "Statistics Tutor", "MBA Advisor", "Engineering Help"] },
  { title: "Discussion post help", desc: "Struggling with online discussion boards? Get well-crafted, original responses delivered fast.", link: "/ask", still: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80&auto=format&fit=crop", motion: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80&auto=format&fit=crop", options: ["DQ Responses", "Peer Replies", "Weekly Discussions", "Forum Posts", "Online Boards"] },
  { title: "Research & writing support", desc: "Essays, research papers, literature reviews — written by subject experts to your exact brief.", link: "/ask", still: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80&auto=format&fit=crop", motion: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80&auto=format&fit=crop", options: ["Research Papers", "Essays & Reports", "Literature Reviews", "Case Studies", "Capstone Projects"] },
  { title: "Online class assistance", desc: "Full online course support — quizzes, assignments, and discussions handled by verified experts.", link: "/ask", still: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80&auto=format&fit=crop", motion: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&auto=format&fit=crop", options: ["Walden University", "University of Phoenix", "SNHU Courses", "Strayer University", "Other Programs"] },
];

const SUBJECTS = [
  { name: 'Computer Science', icon: '💻', count: '320+' },
  { name: 'Nursing', icon: '🏥', count: '210+' },
  { name: 'Statistics', icon: '📊', count: '180+' },
  { name: 'MBA / Business', icon: '💼', count: '250+' },
  { name: 'Accounting', icon: '🧾', count: '140+' },
  { name: 'Mathematics', icon: '📐', count: '160+' },
  { name: 'Psychology', icon: '🧠', count: '130+' },
  { name: 'Economics', icon: '📈', count: '110+' },
  { name: 'Engineering', icon: '⚙️', count: '190+' },
  { name: 'English / Writing', icon: '✍️', count: '120+' },
  { name: 'History', icon: '📜', count: '90+' },
  { name: 'Biology', icon: '🔬', count: '100+' },
  { name: 'Chemistry', icon: '⚗️', count: '80+' },
  { name: 'Law', icon: '⚖️', count: '70+' },
  { name: 'Marketing', icon: '📣', count: '95+' },
  { name: 'Finance', icon: '💰', count: '110+' },
  { name: 'Philosophy', icon: '🤔', count: '60+' },
  { name: 'Sociology', icon: '👥', count: '75+' },
  { name: 'Political Science', icon: '🏛️', count: '65+' },
  { name: 'All subjects', icon: '📚', count: 'View all' },
];

const UNIVERSITIES = [
  'University of Phoenix', 'Walden University', 'SNHU',
  'Strayer University', 'Liberty University', 'DeVry University',
  'Embry-Riddle Aeronautical', 'UMGC', 'Capella University',
  'Grand Canyon University', 'American Military University',
  'Ashford University', 'Colorado Technical University',
  'Western Governors University', 'Chamberlain University',
  'Purdue Global', 'National University', 'Regent University',
  'South University', 'Kaplan University',
];

const EXPERTS = [
  { initials: "DR", name: "Daniel R.", role: "Computer Science Specialist", tags: ["MS Software Eng.", "9 yrs exp"], rating: "4.9", reviews: "312", color: "#14748F" },
  { initials: "ES", name: "Emily S.", role: "Statistics & Data Analysis", tags: ["PhD Candidate", "11 yrs exp"], rating: "4.8", reviews: "287", color: "#2D7D46" },
  { initials: "MK", name: "Maria K.", role: "Nursing & Healthcare", tags: ["MSN, RN", "7 yrs exp"], rating: "4.9", reviews: "198", color: "#B45309" },
];

const REVIEWS = [
  { initials: "JM", text: "Submitted my Java assignment 3 hours before the deadline and got a perfect solution. Absolutely saved my semester.", name: "J. M.", uni: "University of Phoenix", color: "#14748F" },
  { initials: "KR", text: "The statistics expert explained every step clearly. I actually understood the solution before submitting it.", name: "K. R.", uni: "Walden University", color: "#2D7D46" },
  { initials: "AL", text: "Fast, professional, and confidential. Used this 4 times and it has been consistent every time.", name: "A. L.", uni: "SNHU", color: "#B45309" },
];

const FAQS = [
  { icon: "🔒", q: "Is my information confidential?", a: "Yes — your personal details and order are 100% private. We never share data with third parties." },
  { icon: "⏱️", q: "How fast can I get help?", a: "Turnaround starts from 3 hours for urgent requests, depending on subject complexity." },
  { icon: "💳", q: "What payment methods do you accept?", a: "We accept PayPal, debit, and major credit cards. All transactions are fully secured." },
  { icon: "🔄", q: "Do you provide revisions?", a: "Yes — free revisions are included if the work does not match your original requirements." },
  { icon: "📚", q: "What subjects do you support?", a: "We cover 50+ subjects including Computer Science, Nursing, MBA, Statistics, Psychology, and more." },
  { icon: "🎁", q: "Is there a free trial?", a: "Yes! New students can post their first assignment free to see the quality before committing." },
];

function ServiceCard({ card }) {
  const navigate = useNavigate();
  return (
    <div className="ehp-card" onClick={() => navigate(card.link)}>
      <div className="ehp-card-img">
        <img className="still" src={card.still} alt={card.title} loading="lazy" />
        <img className="motion" src={card.motion} alt="" loading="lazy" />
      </div>
      <div className="ehp-card-body">
        <div className="ehp-card-title">{card.title} →</div>
        <p className="ehp-card-desc">{card.desc}</p>
        <select className="ehp-card-select" defaultValue="" onClick={(e) => e.stopPropagation()} onChange={(e) => { if (e.target.value) navigate(card.link); }}>
          <option value="" disabled>Explore options</option>
          {card.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function HomePage() {
  useEffect(() => {
    document.title = "eHomeworkMarket — Expert Academic Assistance for College Students";
  }, []);
  const [recentSolutions, setRecentSolutions] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/solutions?limit=6`)
      .then((r) => setRecentSolutions(r.data.solutions || []))
      .catch(() => setRecentSolutions([]));
  }, []);

  return (
    <div className="ehp">
      <nav className="ehp-nav">
        <Link to="/" className="ehp-logo"><div className="ehp-logo-icon">📚</div>eHomeworkMarket</Link>
        <div className="ehp-nav-links">
          <button className="ehp-nav-link" onClick={() => navigate('/ask')}>Ask Expert</button>
          <button className="ehp-nav-link" onClick={() => navigate('/library')}>Library</button>
          <button className="ehp-nav-link" onClick={() => navigate('/contact')}>Contact</button>
        </div>
        <div className="ehp-nav-right">
          <button className="ehp-btn-login" onClick={() => navigate('/login')}>Log In</button>
          <button className="ehp-btn-signup" onClick={() => navigate('/register')}>Sign Up</button>
          <button className="ehp-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Menu">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="ehp-mobile-menu">
          <button onClick={() => { navigate('/ask'); setMobileMenuOpen(false); }}>Ask Expert</button>
          <button onClick={() => { navigate('/library'); setMobileMenuOpen(false); }}>Library</button>
          <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }}>Contact</button>
          <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Log In</button>
          <button onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Sign Up Free</button>
        </div>
      )}

      <div className="ehp-hero">
        <span className="ehp-hero-star-left">✳</span>
        <span className="ehp-hero-star-right">✳</span>
        <h1>Learn faster. Study smarter.<br />Achieve more every semester.</h1>
      </div>

      <div className="ehp-cards-bg">
        <div className="ehp-cards-grid">
          {SERVICE_CARDS.map((card) => <ServiceCard key={card.title} card={card} />)}
        </div>
      </div>

      <div className="ehp-stats">
        {[["5,000+","Assignments completed"],["2,000+","Students supported"],["150+","Subject experts"],["98%","Satisfaction rate"]].map(([num, lbl]) => (
          <div key={lbl} className="ehp-stat"><div className="ehp-stat-num">{num}</div><div className="ehp-stat-lbl">{lbl}</div></div>
        ))}
      </div>

      <div className="ehp-subjects">
        <div className="ehp-sec-label">Browse subjects</div>
        <div className="ehp-sec-title">What subject do you need help with?</div>
        <p className="ehp-sec-sub">From STEM to humanities — our experts cover 50+ subject areas.</p>
        <div className="ehp-subj-grid">
          {SUBJECTS.map((s) => (
            <div key={s.name} className="ehp-subj-card" onClick={() => navigate('/ask')}>
              <span className="ehp-subj-icon">{s.icon}</span>
              <div className="ehp-subj-name">{s.name}</div>
              <div className="ehp-subj-count">{s.count} solutions</div>
            </div>
          ))}
        </div>
      </div>


      <div className="ehp-unis">
        <div className="ehp-sec-label">Universities we support</div>
        <div className="ehp-sec-title">Helping students at 20+ top online universities</div>
        <p className="ehp-sec-sub" style={{ marginBottom: 24 }}>From UOP to Walden — we know your curriculum inside out.</p>
        <div className="ehp-unis-grid">
          {UNIVERSITIES.map((u) => (
            <button key={u} className="ehp-uni-pill" onClick={() => navigate('/ask')}>{u}</button>
          ))}
        </div>
      </div>

      <div className="ehp-how">
        <img src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&q=80&auto=format&fit=crop" alt="Student working" loading="lazy" />
        <div className="ehp-how-overlay">
          <div className="ehp-how-steps">
            {[{n:"01",t:"Submit requirements",d:"Share your assignment details and deadline"},{n:"02",t:"Get matched",d:"We assign the best expert for your subject"},{n:"03",t:"Track progress",d:"Follow your order and message your expert"},{n:"04",t:"Receive solution",d:"Download your completed reviewed work"}].map((s) => (
              <div key={s.n} className="ehp-step">
                <div className="ehp-step-num">{s.n}</div>
                <div className="ehp-step-title">{s.t}</div>
                <div className="ehp-step-desc">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ehp-experts">
        <div className="ehp-experts-photo">
          <img src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=700&q=80&auto=format&fit=crop" alt="Expert tutor" loading="lazy" />
        </div>
        <div className="ehp-experts-content">
          <div className="ehp-sec-label">Our experts</div>
          <div className="ehp-sec-title">Qualified specialists in every field</div>
          <p className="ehp-sec-sub">All experts carry verified academic credentials and years of real subject experience.</p>
          <div className="ehp-expert-list">
            {EXPERTS.map((e) => (
              <div key={e.name} className="ehp-expert-row">
                <div className="ehp-exp-av" style={{ background: e.color }}>{e.initials}</div>
                <div className="ehp-exp-info">
                  <div className="ehp-exp-name">{e.name}</div>
                  <div className="ehp-exp-role">{e.role}</div>
                  <div className="ehp-exp-tags">{e.tags.map((t) => <span key={t} className="ehp-exp-tag">{t}</span>)}</div>
                </div>
                <div className="ehp-exp-stars">
                  <div className="ehp-exp-star-row">★★★★★</div>
                  <div className="ehp-exp-rev">{e.rating} · {e.reviews} reviews</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ehp-reviews">
        <div className="ehp-reviews-photo">
          <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&q=80&auto=format&fit=crop" alt="Happy students" loading="lazy" />
          <div className="ehp-reviews-overlay">
            <div className="ehp-rating-big">4.9</div>
            <div className="ehp-rating-stars">★★★★★</div>
            <div className="ehp-rating-count">Based on 2,000+ reviews</div>
          </div>
        </div>
        <div className="ehp-reviews-cards">
          <div className="ehp-sec-label">Student reviews</div>
          <div className="ehp-sec-title" style={{ marginBottom: "16px" }}>What students are saying</div>
          {REVIEWS.map((r) => (
            <div key={r.name} className="ehp-review-card">
              <div className="ehp-review-top"><div className="ehp-review-stars">★★★★★</div><span className="ehp-review-badge">{r.uni}</span></div>
              <p className="ehp-review-text">"{r.text}"</p>
              <div className="ehp-review-user">
                <div className="ehp-rev-av" style={{ background: r.color }}>{r.initials}</div>
                <div><div className="ehp-rev-name">{r.name}</div><div className="ehp-rev-uni">Verified student</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recentSolutions.length > 0 && (
        <div className="ehp-recent">
          <div className="ehp-sec-label">From the library</div>
          <div className="ehp-sec-title">Recently added solutions</div>
          <p className="ehp-sec-sub">Browse our latest study help — preview before you buy.</p>
          <div className="ehp-recent-grid">
            {recentSolutions.map((sol) => (
              <div key={sol._id} className="ehp-sol-card" onClick={() => navigate(`/library/${sol._id}`)}>
                <span className="ehp-sol-subj">{sol.subject}</span>
                <div className="ehp-sol-title">{sol.title}</div>
                <div className="ehp-sol-desc">{sol.description}</div>
                <div className="ehp-sol-footer"><span className="ehp-sol-price">${sol.price}</span><span className="ehp-sol-view">View →</span></div>
              </div>
            ))}
          </div>
          <button className="ehp-browse-btn" onClick={() => navigate("/library")}>Browse full library →</button>
        </div>
      )}

      <div className="ehp-faq">
        <div className="ehp-sec-label">FAQ</div>
        <div className="ehp-sec-title">Common questions</div>
        <p className="ehp-sec-sub">Everything students ask before getting started.</p>
        <div className="ehp-faq-grid">
          {FAQS.map((f) => (
            <div key={f.q} className="ehp-faq-card">
              <div className="ehp-faq-q"><span className="ehp-faq-icon">{f.icon}</span>{f.q}</div>
              <p className="ehp-faq-a">{f.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ehp-cta">
        <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&q=80&auto=format&fit=crop" alt="Students collaborating" loading="lazy" />
        <div className="ehp-cta-overlay">
          <h2>Ready to get expert help?</h2>
          <p>Join thousands of college students who trust eHomeworkMarket for fast, confidential academic support.</p>
          <div className="ehp-cta-btns">
            <button className="ehp-cta-white" onClick={() => navigate("/ask")}>Post your assignment — free</button>
            <button className="ehp-cta-outline" onClick={() => navigate("/library")}>Browse solutions</button>
          </div>
        </div>
      </div>

      <footer className="ehp-footer">
        <div className="ehp-footer-top">
          <div>
            <div className="ehp-footer-logo">📚 eHomeworkMarket</div>
            <p className="ehp-footer-desc">Expert academic assistance for college students worldwide. Confidential, fast, and reliable.</p>
          </div>
          <div className="ehp-footer-col"><h4>Services</h4><Link to="/ask">Assignment help</Link><Link to="/ask">Research & writing</Link><Link to="/ask">Discussion posts</Link><Link to="/ask">Online coursework</Link></div>
          <div className="ehp-footer-col"><h4>Company</h4><Link to="/library">Solutions library</Link><a href="mailto:support@ehomeworkmarket.com">Contact us</a><Link to="/register">Create account</Link><Link to="/login">Log in</Link></div>
          <div className="ehp-footer-col"><h4>Legal</h4><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms & conditions</Link><Link to="/refund">Refund policy</Link><Link to="/academic-integrity">Academic integrity</Link><Link to="/dmca">DMCA policy</Link></div>
        </div>
        <div className="ehp-footer-bottom">
          <span className="ehp-footer-copy">© 2026 Massinfotech. All rights reserved.</span>
          <div className="ehp-pay-row"><span className="ehp-pay-pill">PayPal</span><span className="ehp-pay-pill">Visa</span><span className="ehp-pay-pill">Mastercard</span></div>
        </div>
      </footer>

      <div className="ehp-mobile-cta"><Link to="/ask">💬 Need help? Post your assignment — it is free</Link></div>
    </div>
  );
}
