import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { SUBJECTS, HELP, UNIVERSITIES } from "./landingData";
import "./HomePage.css";

// University pages reuse a generic content template built from the uni name
function buildUniversity(uni) {
  return {
    name: uni.name, icon: "🎓",
    metaTitle: `${uni.name} Homework Help — Assignment & Coursework Support | eHomeworkMarket`,
    metaDesc: `Expert homework help for ${uni.name} students. Get assignment, discussion, and coursework support across all subjects. Confidential, fast, reliable.`,
    intro: `${uni.name} coursework moves fast, and keeping up with weekly assignments, discussions, and exams isn't always possible alone. eHomeworkMarket connects ${uni.short} students with verified subject experts who know the format and pace your program expects — confidentially and on time.`,
    topics: ["Weekly assignments","Discussion posts & replies","Research papers","Quizzes & exams","Case studies","Capstone projects","Lab reports","Presentations","Reflection journals","Group project contributions"],
    whoFor: `Undergraduate and graduate students enrolled at ${uni.name} across all degree programs and subjects.`,
    help: [["Any subject covered",`From nursing to business to IT — ${uni.short} coursework across 20+ subject areas.`],["Weekly coursework","Stay current with assignments, discussions, and quizzes."],["Confidential support","Your identity and coursework are never disclosed."],["Fast turnaround","Tight deadline? Many assignments are completed within hours."]],
    faqs: [[`Do you know the ${uni.short} format?`,`Yes — our experts are familiar with ${uni.name}'s coursework structure and expectations.`],["Is it confidential?","Completely — your name, school, and details are never shared."],["Which subjects?","20+ subjects including nursing, business, computer science, and more."],["How fast?","Many assignments are completed within hours, depending on complexity."]]
  };
}

export default function LandingPage({ type }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  let data;
  if (type === "subject") data = SUBJECTS[slug];
  else if (type === "help") data = HELP[slug];
  else if (type === "university") {
    const uni = UNIVERSITIES[slug];
    data = uni ? buildUniversity(uni) : null;
  }

  const headingSuffix = type === "help" ? "" : (type === "university" ? " Homework Help" : " Homework Help");

  useEffect(() => {
    if (!data) return;
    document.title = data.metaTitle;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', data.metaDesc);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": data.faqs.map(([q, a]) => ({
        "@type": "Question", "name": q,
        "acceptedAnswer": { "@type": "Answer", "text": a }
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'landing-faq-schema';
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);
    return () => document.getElementById('landing-faq-schema')?.remove();
  }, [data]);

  if (!data) {
    return (
      <div style={{ padding: 60, textAlign: 'center', fontFamily: 'sans-serif', minHeight: '60vh' }}>
        <h1 style={{ color: '#0D2137' }}>Page not found</h1>
        <p style={{ color: '#6B7280', margin: '10px 0 20px' }}>This page doesn't exist yet.</p>
        <Link to="/library" style={{ color: '#14748F', fontWeight: 600 }}>Browse the library →</Link>
      </div>
    );
  }

  const h1 = (type === "help") ? data.name : data.name + headingSuffix;

  return (
    <div className="ehp" style={{ background: '#fff' }}>
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
        </div>
      </nav>

      <div style={{ background: '#0D2137', padding: '52px 32px 44px', textAlign: 'center' }}>
        <div style={{ fontSize: 42, marginBottom: 12 }}>{data.icon}</div>
        <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#fff', marginBottom: 14, fontFamily: 'inherit' }}>{h1}</h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 640, margin: '0 auto 24px', lineHeight: 1.7 }}>{data.intro}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/ask')} style={{ padding: '12px 26px', background: '#fff', color: '#14748F', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Post your assignment →</button>
          <button onClick={() => navigate('/library')} style={{ padding: '12px 26px', background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Browse solutions</button>
        </div>
      </div>

      <div style={{ padding: '48px 32px', maxWidth: 900, margin: '0 auto' }}>
        <p className="ehp-sec-label">What we cover</p>
        <h2 className="ehp-sec-title">Topics our experts handle</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 20 }}>
          {data.topics.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 10 }}>
              <span style={{ color: '#14748F', fontSize: 16 }}>✓</span>
              <span style={{ fontSize: 14, color: '#0D2137', fontWeight: 500 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#f8fafc', padding: '48px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p className="ehp-sec-label">How we help</p>
          <h2 className="ehp-sec-title">Support tailored to your coursework</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
            {data.help.map(([title, desc]) => (
              <div key={title} style={{ background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '20px 22px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0D2137', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '44px 32px', maxWidth: 900, margin: '0 auto' }}>
        <p className="ehp-sec-label">Who this is for</p>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.75 }}>{data.whoFor}</p>
      </div>

      <div style={{ background: '#f8fafc', padding: '48px 32px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="ehp-sec-label">FAQ</p>
          <h2 className="ehp-sec-title">Common questions</h2>
          <div className="ehp-faq-grid" style={{ marginTop: 24 }}>
            {data.faqs.map(([q, a]) => (
              <div key={q} className="ehp-faq-card">
                <div className="ehp-faq-q">{q}</div>
                <p className="ehp-faq-a" style={{ paddingLeft: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: '#14748F', padding: '48px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: '#fff', marginBottom: 10, fontFamily: 'inherit' }}>Ready to get started?</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 22 }}>Post your assignment now and get matched with a specialist.</p>
        <button onClick={() => navigate('/ask')} style={{ padding: '12px 28px', background: '#fff', color: '#14748F', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Get started — it's free →</button>
      </div>
    </div>
  );
}
