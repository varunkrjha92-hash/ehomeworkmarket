// ── LANDING PAGE CONTENT (SEO) ────────────────────────────────
// Categories: subjects, help (task-type / intent), universities

export const SUBJECTS = {
  "computer-science": {
    name: "Computer Science", icon: "💻",
    metaTitle: "Computer Science Homework Help — Python, Java, Data Structures | eHomeworkMarket",
    metaDesc: "Get expert Computer Science homework help with Python, Java, C++, data structures, algorithms and databases. Step-by-step solutions from verified specialists, 24/7.",
    intro: "Computer Science coursework is unforgiving — one misplaced bracket and an entire program fails to compile. Whether you're debugging recursion at 2am or untangling Big-O notation before a deadline, eHomeworkMarket connects you with specialists who write and review code for a living.",
    topics: ["Python programming & scripting","Java & object-oriented design","Data structures & algorithms","Database design & SQL","Web development (HTML/CSS/JS, React)","Operating systems","Computer networks","Software engineering","Machine learning basics","C/C++ programming"],
    whoFor: "Computer Science, Software Engineering, and IT students at University of Phoenix, Walden, SNHU, Strayer, and DeVry.",
    help: [["Code review & debugging","Stuck on a bug? Our experts trace your logic and fix what's broken — with explanations, not just patches."],["Assignments from scratch","Submit requirements and get a complete, working, well-commented solution built to spec."],["Concept explanations","Understand recursion, Big-O, or normalization before an exam, explained in plain language."],["Projects & capstones","Multi-week projects get structured, milestone-based support from one expert."]],
    faqs: [["Do you cover my course language?","Yes — Python, Java, C++, C#, JavaScript, SQL, and most languages in standard CS curricula."],["Is the code original?","Every solution is written for your assignment and checked against plagiarism and AI-detection tools."],["Can you help with a tight deadline?","Often yes — share your deadline and we'll confirm feasibility."],["Do you explain the code?","Yes — comments plus an optional full walkthrough of the logic."]]
  },
  "statistics": {
    name: "Statistics", icon: "📊",
    metaTitle: "Statistics Homework Help — SPSS, Regression, Probability | eHomeworkMarket",
    metaDesc: "Expert Statistics homework help with SPSS, regression, hypothesis testing, probability and data interpretation. Step-by-step solutions from qualified specialists.",
    intro: "Statistics is where many strong students hit a wall — it's not just calculation, it's knowing which test to run and how to read the output. Our specialists handle everything from basic probability to multi-variable regression in SPSS, Excel, and R.",
    topics: ["Hypothesis testing","Regression analysis","SPSS data analysis","Probability distributions","ANOVA & t-tests","Descriptive statistics","Confidence intervals","Chi-square tests","Correlation analysis","R & Excel statistical work"],
    whoFor: "Statistics, Psychology, Business, and research-methods students across all major online universities.",
    help: [["Full SPSS reports","Complete analysis with annotated output and plain-language interpretation."],["Step-by-step solutions","Every calculation shown so you follow the method, not just the answer."],["Data interpretation","We explain what your results mean for your research question."],["Exam & quiz prep","Concept walkthroughs for tests on probability, distributions, and inference."]],
    faqs: [["Do you work in SPSS, R, and Excel?","Yes — all three, plus whatever software your course requires."],["Will you interpret the output?","Yes — interpretation is where students need the most help, and it's included."],["Can you handle large datasets?","Yes, including full datasets for research and capstone projects."],["Do you show your work?","Always — every step is shown."]]
  },
  "mathematics": {
    name: "Mathematics", icon: "📐",
    metaTitle: "Math Homework Help — Algebra, Calculus, Discrete Math | eHomeworkMarket",
    metaDesc: "Expert Math homework help covering algebra, calculus, discrete math, differential equations and more. Step-by-step solutions so you understand every step.",
    intro: "Math builds on itself — miss one concept and the next three feel impossible. Our specialists don't just give answers; they show the full working so you can follow the method and apply it yourself on the exam.",
    topics: ["College algebra","Calculus I, II & III","Linear algebra","Discrete mathematics","Differential equations","Trigonometry","Probability & statistics","Number theory","Mathematical proofs","Applied & business math"],
    whoFor: "STEM, business, and general-education math students at every level.",
    help: [["Step-by-step solutions","Every step shown so you understand the method, not just the final answer."],["Proof writing","Clear, rigorous proofs for discrete math and higher-level courses."],["Exam preparation","Worked examples covering the exact topics on your test."],["Problem sets","Full problem sets solved accurately with working shown."]],
    faqs: [["Do you show every step?","Yes — seeing the full method is how you learn the material."],["What levels do you cover?","From college algebra through advanced calculus, linear algebra, and proofs."],["Can you help before an exam?","Yes — worked examples on your topics are a popular request."],["Is the work checked?","Yes, every solution is verified before delivery."]]
  },
  "calculus": {
    name: "Calculus", icon: "∫",
    metaTitle: "Calculus Homework Help — Limits, Derivatives, Integrals | eHomeworkMarket",
    metaDesc: "Expert Calculus homework help with limits, derivatives, integrals, series and multivariable calculus. Step-by-step worked solutions from math specialists.",
    intro: "Calculus is the gatekeeper course for most STEM degrees — and the place where careful, step-by-step working matters most. From limits and derivatives to integration techniques and infinite series, our specialists show every step so the method actually sticks.",
    topics: ["Limits & continuity","Derivatives & differentiation rules","Integration techniques","Applications of derivatives","Definite & indefinite integrals","Infinite series & sequences","Multivariable calculus","Partial derivatives","Differential equations","Related rates & optimization"],
    whoFor: "Engineering, math, physics, economics, and pre-med students taking Calculus I, II, or III.",
    help: [["Worked solutions","Every limit, derivative, and integral solved step by step."],["Integration techniques","Substitution, parts, partial fractions — explained clearly."],["Exam prep","Practice problems matching your exam's exact topics."],["Concept clarity","Understand the why behind the rules, not just the procedure."]],
    faqs: [["Which calculus levels do you cover?","Calc I, II, and III, including multivariable and differential equations."],["Do you show all the steps?","Yes — every step, which is essential for calculus."],["Can you help with applications?","Yes — optimization, related rates, area/volume, and physics applications."],["Is it accurate?","Every solution is checked before delivery."]]
  },
  "nursing": {
    name: "Nursing", icon: "🏥",
    metaTitle: "Nursing Homework Help — Care Plans, NCLEX, Case Studies | eHomeworkMarket",
    metaDesc: "Expert Nursing homework help from RN and MSN-qualified specialists. Care plans, case studies, NCLEX prep, pharmacology and clinical documentation support.",
    intro: "Nursing programs demand precision few other fields require — a single miscalculated dosage or mismatched diagnosis can mean a failing grade. Our nursing specialists, many practicing RNs, understand both the clinical reasoning and the academic format your instructors expect.",
    topics: ["Nursing care plans (NCP)","Case study analysis","Pharmacology & dosage calculations","NCLEX-style questions","Pathophysiology","Evidence-based practice papers","SOAP notes & documentation","Community & public health nursing","Mental health nursing","Maternal & pediatric nursing"],
    whoFor: "BSN, MSN, and RN-to-BSN students at Walden, Chamberlain, Grand Canyon, and Capella University.",
    help: [["Care plan development","Clinically accurate care plans with correct NANDA diagnoses, interventions, and rationales."],["Case study breakdowns","Structured analysis connecting symptoms to diagnoses to interventions."],["Dosage & pharmacology","Step-by-step calculation walkthroughs so you understand the math."],["Discussion & reflection","Well-reasoned, properly cited responses for weekly coursework."]],
    faqs: [["Are your experts qualified nurses?","Our specialists hold credentials including RN, MSN, and clinical experience."],["Can you match my care plan format?","Yes — share your template or rubric and we'll match it exactly."],["Do you cite in APA?","All nursing work is formatted in APA 7th edition unless specified."],["Is this confidential?","Completely. Your details are never disclosed."]]
  },
  "business": {
    name: "Business", icon: "💼",
    metaTitle: "Business Homework Help — Management, Strategy, Case Studies | eHomeworkMarket",
    metaDesc: "Expert Business homework help with case analysis, management, strategy, marketing and operations. For MBA and undergraduate business students.",
    intro: "Business coursework rewards clear frameworks and real analysis, not just opinion. From SWOT and Porter's Five Forces to operations and organizational behavior, our specialists bring the structured thinking that earns marks in business programs.",
    topics: ["Business case analysis","Strategic management & SWOT","Marketing strategy","Organizational behavior","Operations management","Human resource management","Business ethics","International business","Project management","Business plan development"],
    whoFor: "MBA, DBA, and undergraduate business students at University of Phoenix, Walden, Strayer, and Liberty.",
    help: [["Case study analysis","Structured breakdowns using established business frameworks."],["Strategy papers","Well-argued recommendations backed by analysis and citations."],["Reports & memos","Professional business documents formatted to your brief."],["Discussion posts","Substantive, referenced responses for weekly coursework."]],
    faqs: [["Can you use a specific framework?","Yes — SWOT, PESTLE, Porter's Five Forces, BCG matrix, and others."],["Do you handle group project parts?","Yes, we can complete your individual contribution to a group assignment."],["Will work be cited?","Yes, in APA, Harvard, or your program's required style."],["Can you help with a business plan?","Yes, from executive summary through projections."]]
  },
  "accounting": {
    name: "Accounting", icon: "🧾",
    metaTitle: "Accounting Homework Help — Financial, Managerial, Tax | eHomeworkMarket",
    metaDesc: "Expert Accounting homework help covering financial accounting, managerial accounting, tax and auditing. Accurate solutions with full working shown.",
    intro: "Accounting leaves no room for 'close enough' — the numbers either balance or they don't. Our specialists handle journal entries, financial statements, cost accounting, and tax problems with the accuracy your coursework demands, showing every step.",
    topics: ["Journal entries & ledgers","Financial statement preparation","Managerial & cost accounting","Tax accounting","Auditing principles","Bank reconciliation","Depreciation methods","Ratio & financial analysis","Budgeting & forecasting","Bookkeeping fundamentals"],
    whoFor: "Accounting, Finance, and Business students across community colleges and online universities.",
    help: [["Problems with full working","Every journal entry and calculation shown so you follow the logic."],["Financial statements","Balance sheets, income statements, and cash flows built correctly."],["Cost & managerial accounting","Variance analysis, costing, and budgeting solved step by step."],["Exam prep","Concept reviews for tests on core accounting principles."]],
    faqs: [["Do you show all the working?","Yes — essential for accounting coursework."],["Financial and managerial both?","Yes, plus tax, auditing, and cost accounting."],["Will the numbers balance?","Accuracy is the whole point — solutions are checked first."],["Excel-based work?","Yes, including Excel and standard accounting formats."]]
  },
  "economics": {
    name: "Economics", icon: "📈",
    metaTitle: "Economics Homework Help — Micro, Macro, Econometrics | eHomeworkMarket",
    metaDesc: "Expert Economics homework help covering microeconomics, macroeconomics, econometrics and graphs. Clear solutions with diagrams and explanations.",
    intro: "Economics blends math, graphs, and real-world reasoning — and losing track of any one of them sinks an assignment. Our specialists handle supply-and-demand models, macro policy analysis, and econometric problems with clear diagrams and explanations.",
    topics: ["Microeconomics","Macroeconomics","Supply & demand analysis","Market structures","Econometrics","Game theory","Fiscal & monetary policy","International trade","Elasticity & utility","Economic graphing"],
    whoFor: "Economics, Business, and Finance students at all levels of study.",
    help: [["Graphing & models","Correctly drawn and labeled economic diagrams with explanation."],["Problem sets","Micro and macro problems solved with working shown."],["Econometrics","Regression-based economic analysis and interpretation."],["Essay & policy analysis","Well-argued responses on economic policy and theory."]],
    faqs: [["Micro and macro both?","Yes, plus econometrics, international trade, and game theory."],["Do you draw the graphs?","Yes — properly labeled diagrams with explanation."],["Can you handle econometrics?","Yes, including regression analysis and interpretation."],["Is the work original?","Yes, written for your assignment and checked."]]
  },
  "psychology": {
    name: "Psychology", icon: "🧠",
    metaTitle: "Psychology Homework Help — Research, APA Papers, Case Studies | eHomeworkMarket",
    metaDesc: "Expert Psychology homework help with research papers, APA formatting, case studies and statistics. Support across all areas of psychology.",
    intro: "Psychology coursework spans everything from research methods and statistics to theory-heavy essays — and all of it expects flawless APA formatting. Our specialists handle research papers, case analyses, and psych statistics with the rigor your program demands.",
    topics: ["Research methods","APA-format papers","Case study analysis","Abnormal psychology","Developmental psychology","Cognitive psychology","Social psychology","Psychological statistics","Theory & literature reviews","Experimental design"],
    whoFor: "Psychology, Counseling, and Social Work students across undergraduate and graduate programs.",
    help: [["Research & APA papers","Properly structured, cited papers in correct APA 7th edition."],["Case study analysis","Theory-grounded breakdowns of psychological case scenarios."],["Statistics support","Psych stats including SPSS analysis and interpretation."],["Discussion responses","Substantive, referenced weekly discussion posts."]],
    faqs: [["Do you format in APA?","Yes — correct APA 7th edition formatting and citations."],["Can you help with research methods?","Yes, including design, analysis, and write-up."],["Psych statistics too?","Yes — SPSS analysis and interpretation included."],["Is it confidential?","Completely — your details are never shared."]]
  },
  "engineering": {
    name: "Engineering", icon: "⚙️",
    metaTitle: "Engineering Homework Help — Mechanical, Electrical, Civil | eHomeworkMarket",
    metaDesc: "Expert Engineering homework help across mechanical, electrical, civil and chemical engineering. Problem sets, calculations and projects with full working.",
    intro: "Engineering problems reward precision and method — partial credit lives and dies on showing the right steps. Our specialists cover mechanical, electrical, civil, and chemical engineering coursework with clearly worked calculations and diagrams.",
    topics: ["Statics & dynamics","Thermodynamics","Circuit analysis","Fluid mechanics","Strength of materials","Control systems","Engineering mathematics","MATLAB problems","CAD & design basics","Engineering economics"],
    whoFor: "Mechanical, Electrical, Civil, and Chemical Engineering students at all levels.",
    help: [["Worked calculations","Every step shown for full-credit, method-based solutions."],["MATLAB & simulations","Code and analysis for engineering computation assignments."],["Diagrams & free-body","Properly drawn diagrams supporting your solution."],["Project support","Multi-part engineering projects handled end to end."]],
    faqs: [["Which disciplines do you cover?","Mechanical, electrical, civil, chemical, and general engineering."],["Do you do MATLAB?","Yes — code plus explanation of the approach."],["Do you show working?","Always — essential for engineering credit."],["Can you handle projects?","Yes, including multi-week design and analysis projects."]]
  },
  "chemistry": {
    name: "Chemistry", icon: "⚗️",
    metaTitle: "Chemistry Homework Help — Organic, Reactions, Stoichiometry | eHomeworkMarket",
    metaDesc: "Expert Chemistry homework help with organic chemistry, reactions, stoichiometry and lab reports. Clear step-by-step solutions from chemistry specialists.",
    intro: "Chemistry punishes small mistakes — a missed coefficient or wrong sign and the whole answer is off. Our specialists handle stoichiometry, organic mechanisms, and lab reports with clear, balanced, step-by-step working.",
    topics: ["Stoichiometry","Organic chemistry & mechanisms","Chemical reactions & balancing","Thermochemistry","Acids, bases & equilibrium","Atomic structure & bonding","Gas laws","Solutions & concentration","Lab report writing","Electrochemistry"],
    whoFor: "Chemistry, Biology, pre-med, and engineering students taking general or organic chemistry.",
    help: [["Step-by-step problems","Balanced equations and calculations shown in full."],["Organic mechanisms","Clearly drawn reaction mechanisms with explanation."],["Lab reports","Complete, properly formatted lab reports with analysis."],["Exam prep","Practice on the exact reactions and concepts you're tested on."]],
    faqs: [["Organic and general both?","Yes, plus physical and analytical chemistry."],["Do you write lab reports?","Yes — full reports with data analysis and discussion."],["Do you balance equations and show steps?","Always — every step is shown."],["Is it accurate?","Solutions are checked before delivery."]]
  },
  "biology": {
    name: "Biology", icon: "🔬",
    metaTitle: "Biology Homework Help — Genetics, Anatomy, Cell Biology | eHomeworkMarket",
    metaDesc: "Expert Biology homework help covering genetics, anatomy, physiology, cell biology and lab reports. Clear explanations from biology specialists.",
    intro: "Biology is detail-dense — terminology, processes, and systems that all connect. Our specialists help you make sense of genetics, anatomy, and cellular processes, and write the lab reports and essays your courses require.",
    topics: ["Cell biology","Genetics & heredity","Human anatomy & physiology","Microbiology","Ecology","Evolution","Molecular biology","Biochemistry basics","Lab report writing","Biology essays & research"],
    whoFor: "Biology, nursing, pre-med, and health-science students at all levels.",
    help: [["Concept explanations","Complex processes broken into clear, connected steps."],["Lab reports","Properly structured reports with data analysis."],["Research & essays","Well-cited biology papers and literature reviews."],["Exam prep","Focused review on the systems and processes you're tested on."]],
    faqs: [["What areas do you cover?","Genetics, anatomy, physiology, microbiology, ecology, and more."],["Do you write lab reports?","Yes — complete, formatted reports with analysis."],["Are sources cited?","Yes, in APA or your required style."],["Is the work original?","Yes, written for your assignment and checked."]]
  },
  "history": {
    name: "History", icon: "📜",
    metaTitle: "History Homework Help — Essays, Research Papers, Analysis | eHomeworkMarket",
    metaDesc: "Expert History homework help with essays, research papers, source analysis and discussion posts. Well-researched, properly cited work from history specialists.",
    intro: "History coursework lives or dies on argument and evidence — a strong thesis backed by credible sources. Our specialists write well-researched, properly cited essays and analyses across US, world, and thematic history courses.",
    topics: ["History essays","Research papers","Primary source analysis","US history","World history","Historiography","Document-based questions","Thematic essays","Annotated bibliographies","Discussion responses"],
    whoFor: "History, Liberal Arts, and general-education students across all programs.",
    help: [["Researched essays","Thesis-driven essays backed by credible, cited sources."],["Source analysis","Careful analysis of primary and secondary sources."],["Research papers","Full-length papers with proper structure and citations."],["Discussion posts","Substantive, referenced weekly responses."]],
    faqs: [["What citation styles?","Chicago, MLA, APA — whatever your course requires."],["Is the research credible?","Yes — credible, verifiable sources, properly cited."],["Do you analyze primary sources?","Yes, including document-based questions."],["Is the work original?","Yes, written from scratch and checked."]]
  },
  "english": {
    name: "English / Writing", icon: "✍️",
    metaTitle: "English & Essay Writing Help — Papers, Literature, Composition | eHomeworkMarket",
    metaDesc: "Expert English homework help with essays, literature analysis, composition and research papers. Well-written, original, properly cited work.",
    intro: "Strong writing is its own skill — thesis, structure, evidence, and clean prose all have to come together. Our specialists help with essays, literature analysis, and composition assignments that read well and meet the rubric.",
    topics: ["Essay writing","Literature analysis","Composition & rhetoric","Research papers","Argumentative essays","Creative writing","Annotated bibliographies","Poetry & prose analysis","Reflection papers","Citation & formatting"],
    whoFor: "English, Liberal Arts, and any students with writing-intensive coursework.",
    help: [["Essays & papers","Well-structured, original essays built around a clear thesis."],["Literature analysis","Insightful analysis of novels, poems, and plays."],["Editing & revision","Polish your draft for clarity, flow, and correctness."],["Citation help","Correct MLA, APA, or Chicago formatting."]],
    faqs: [["Is the writing original?","Yes — written from scratch and checked for plagiarism."],["Can you edit my draft?","Yes — editing and revision are available."],["Which citation styles?","MLA, APA, Chicago, and others."],["Can you match a rubric?","Yes — share it and we'll write to it."]]
  }
};

export const HELP = {
  "do-my-homework": {
    name: "Do My Homework", icon: "✍️",
    metaTitle: "Do My Homework — Pay for Expert Homework Help Online | eHomeworkMarket",
    metaDesc: "Need someone to do your homework? Get expert help across 20+ subjects from verified specialists. Confidential, fast turnaround, money-back guarantee.",
    intro: "When deadlines pile up and there just aren't enough hours, 'can someone do my homework?' becomes a real question. eHomeworkMarket connects you with verified subject experts who handle your assignment accurately, confidentially, and on time — so you can breathe again.",
    topics: ["Written assignments & essays","Problem sets & calculations","Online discussion posts","Lab reports","Research papers","Presentations & slides","Quizzes & practice work","Case studies","Coding assignments","Math & statistics problems"],
    whoFor: "College students across every subject and online university who need reliable, confidential help meeting deadlines.",
    help: [["Any subject, one place","From nursing to programming to business — 20+ subject areas with specialist experts."],["Fast turnaround","Urgent deadline? Many assignments can be done in hours. Share your deadline upfront."],["100% confidential","Your identity and details are never shared. Privacy is built in."],["Money-back guarantee","If the work doesn't match what was described, you get a refund."]],
    faqs: [["Is this confidential?","Completely — we never share your name, school, or details."],["How fast can you do it?","Many assignments are done within hours, depending on length and complexity."],["What subjects?","20+ including nursing, computer science, business, statistics, and more."],["What if I'm not satisfied?","Our money-back guarantee covers work that doesn't match requirements."]]
  },
  "assignment-help": {
    name: "Assignment Help", icon: "📝",
    metaTitle: "Assignment Help Online — Expert Academic Assistance | eHomeworkMarket",
    metaDesc: "Professional assignment help across all subjects. Expert academic support for essays, problem sets, projects and coursework. Fast, confidential, reliable.",
    intro: "Good assignment help isn't about cutting corners — it's getting expert guidance when a topic is unfamiliar, a deadline is tight, or you need a worked example to learn from. Our specialists deliver accurate, original work tailored to your exact requirements.",
    topics: ["Essays & written assignments","Research projects","Problem sets","Discussion responses","Lab & technical reports","Capstone projects","Dissertations & theses","Presentations","Annotated bibliographies","Literature reviews"],
    whoFor: "Undergraduate and graduate students who want dependable, high-quality support across any subject.",
    help: [["Tailored to your brief","Built to your exact requirements, rubric, and formatting."],["Original & checked","Written from scratch and checked against plagiarism tools."],["Expert-matched","Paired with a specialist in your specific subject."],["Revisions included","Free revisions if the work doesn't match your brief."]],
    faqs: [["What subjects?","All major subjects — STEM, business, healthcare, and humanities."],["Is the work original?","Yes, written from scratch and checked before delivery."],["Revisions?","Yes, free revisions if it doesn't match your brief."],["How do I start?","Post your assignment with details and deadline — two minutes."]]
  },
  "essay-writing-help": {
    name: "Essay Writing Help", icon: "📄",
    metaTitle: "Essay Writing Help — Custom Essays & Papers | eHomeworkMarket",
    metaDesc: "Expert essay writing help for argumentative, analytical and research essays. Original, well-structured, properly cited papers from qualified writers.",
    intro: "A strong essay needs a clear thesis, logical structure, and credible evidence — and getting all three right under deadline pressure is hard. Our writers craft original, well-argued essays tailored to your prompt and citation style.",
    topics: ["Argumentative essays","Analytical essays","Research papers","Persuasive essays","Compare & contrast essays","Reflective essays","Narrative essays","Literature essays","Admissions & scholarship essays","Annotated bibliographies"],
    whoFor: "Students across all subjects with essay and writing-intensive assignments.",
    help: [["Original essays","Written from scratch around a clear, arguable thesis."],["Any citation style","MLA, APA, Chicago, Harvard — formatted correctly."],["Editing & proofreading","Polish your own draft for clarity and correctness."],["Research included","Credible sources found and integrated for you."]],
    faqs: [["Is the essay original?","Yes — written for your prompt and checked for plagiarism."],["Can you match a word count?","Yes, and your rubric and formatting requirements."],["Which citation styles?","MLA, APA, Chicago, Harvard, and others."],["Can you edit my draft instead?","Yes — editing and proofreading are available."]]
  },
  "exam-help": {
    name: "Exam Help", icon: "📚",
    metaTitle: "Online Exam Help & Test Prep — Expert Support | eHomeworkMarket",
    metaDesc: "Get expert exam help and test preparation across subjects. Practice problems, concept reviews and study support to walk in prepared.",
    intro: "Exams reward preparation, not panic. Whether you need worked practice problems, a concept review, or focused help on the exact topics you'll be tested on, our specialists help you walk in ready.",
    topics: ["Practice problems","Concept reviews","Study guides","Timed problem walkthroughs","Formula & method summaries","Quiz preparation","Final exam review","Subject-specific drills","Worked examples","Test-taking strategy"],
    whoFor: "Students preparing for quizzes, midterms, and finals across all subjects.",
    help: [["Practice problems","Worked problems matching your exam's exact topics."],["Concept reviews","Clear summaries of the methods and ideas you'll be tested on."],["Study guides","Focused, subject-specific guides built for your course."],["One-on-one support","Direct help on the specific areas you're stuck on."]],
    faqs: [["Do you provide practice problems?","Yes — worked problems on your exact exam topics."],["Can you build a study guide?","Yes, tailored to your course and exam."],["Which subjects?","All major subjects — STEM, business, healthcare, and more."],["Is it confidential?","Completely — your details are never shared."]]
  },
  "lab-report-help": {
    name: "Lab Report Help", icon: "🧪",
    metaTitle: "Lab Report Help — Science Lab Writing Support | eHomeworkMarket",
    metaDesc: "Expert lab report help for chemistry, biology, physics and engineering. Properly structured reports with data analysis, results and discussion.",
    intro: "Lab reports have a strict structure and unforgiving grading — abstract, methods, results, discussion, all done right. Our specialists write complete, properly formatted lab reports with accurate data analysis across the sciences.",
    topics: ["Chemistry lab reports","Biology lab reports","Physics lab reports","Engineering lab reports","Data analysis & graphs","Results & discussion sections","Abstract & methods writing","Error analysis","APA/IEEE formatting","Lab calculations"],
    whoFor: "Science and engineering students with lab-based coursework.",
    help: [["Complete reports","Full lab reports from abstract through discussion."],["Data analysis","Accurate calculations, graphs, and interpretation."],["Proper formatting","APA, IEEE, or your course's required structure."],["Results & discussion","Clear interpretation of what your data means."]],
    faqs: [["Which sciences?","Chemistry, biology, physics, and engineering labs."],["Can you analyze my data?","Yes — share your data and we'll analyze and write it up."],["Do you do graphs?","Yes — properly labeled figures and tables."],["Is the formatting correct?","Yes — APA, IEEE, or your required format."]]
  },
  "presentation-help": {
    name: "Presentation Help", icon: "📊",
    metaTitle: "Presentation Help — PowerPoint & Slide Design | eHomeworkMarket",
    metaDesc: "Expert presentation help with PowerPoint slides, speaker notes and design. Clear, professional academic presentations built to your brief.",
    intro: "A good presentation balances clear content with clean design — and turning a dense assignment into engaging slides takes time you may not have. Our specialists build professional, well-organized presentations with speaker notes included.",
    topics: ["PowerPoint presentations","Google Slides decks","Speaker notes","Slide design & layout","Research-based content","Data visualization","Poster presentations","Pitch decks","Presentation scripts","Visual storytelling"],
    whoFor: "Students across all subjects with presentation and slide-deck assignments.",
    help: [["Complete slide decks","Well-organized, visually clean presentations built to your brief."],["Speaker notes","Talking points so you can present confidently."],["Design & layout","Professional, readable slides — not walls of text."],["Research content","Accurate, cited content turned into clear slides."]],
    faqs: [["PowerPoint and Google Slides?","Yes — both, plus Canva and other formats."],["Do you include speaker notes?","Yes, on request, so you're ready to present."],["Can you match a template?","Yes — share your school or course template."],["Is the content cited?","Yes, where sources are used."]]
  },
  "project-help": {
    name: "Project Help", icon: "📁",
    metaTitle: "Project Help — Academic & Capstone Project Support | eHomeworkMarket",
    metaDesc: "Expert help with academic projects, capstones and multi-part assignments. Structured, milestone-based support from a dedicated specialist.",
    intro: "Big projects are where students fall behind — they span weeks, have multiple deliverables, and one weak section drags the whole grade. Our specialists provide structured, milestone-based support across the entire project, from proposal to final submission.",
    topics: ["Capstone projects","Final-year projects","Group project contributions","Research projects","Software & coding projects","Engineering design projects","Business projects","Multi-part assignments","Project proposals","Project reports & documentation"],
    whoFor: "Undergraduate and graduate students with major project-based coursework.",
    help: [["End-to-end support","From proposal through final deliverable, handled in stages."],["Single dedicated expert","One specialist who knows your project throughout."],["Documentation","Reports, proposals, and write-ups done right."],["Group project parts","Your individual contribution completed to spec."]],
    faqs: [["Can you handle a full capstone?","Yes — many students get full capstone support from one expert."],["Multi-week projects?","Yes, with milestone-based delivery."],["Coding or engineering projects?","Yes — both, plus business and research projects."],["Is it confidential?","Completely — your details are never shared."]]
  },
  "discussion-post-help": {
    name: "Discussion Post Help", icon: "💬",
    metaTitle: "Discussion Post Help — Online Discussion Board Responses | eHomeworkMarket",
    metaDesc: "Expert discussion post help for online classes. Original, well-reasoned discussion board responses and peer replies that meet rubric requirements.",
    intro: "Weekly discussion posts add up fast, and a generic response won't earn full marks. Our specialists write original, well-reasoned discussion posts and peer replies that engage the prompt and meet your rubric — every week.",
    topics: ["Initial discussion posts","Peer reply responses","Weekly DQ responses","Reflection posts","Forum discussions","Case-based discussions","Citation-supported posts","Substantive responses","Debate-style posts","Reading responses"],
    whoFor: "Online students at Walden, UOP, SNHU, Strayer, and other distance-learning programs.",
    help: [["Original posts","Written for your prompt, never generic or recycled."],["Peer replies","Thoughtful responses to classmates that meet reply requirements."],["Properly cited","Sources integrated and cited as your rubric requires."],["Weekly support","Ongoing help across an entire course's discussions."]],
    faqs: [["Are posts original?","Yes — written for your specific prompt and checked."],["Do you write peer replies too?","Yes — initial posts and peer responses."],["Will they meet word count?","Yes, and any rubric or citation requirements."],["Is it confidential?","Completely — your identity is never disclosed."]]
  },
  "online-class-help": {
    name: "Online Class Help", icon: "💻",
    metaTitle: "Online Class Help — Take My Online Class Support | eHomeworkMarket",
    metaDesc: "Struggling with an online class? Get expert help with weekly assignments, discussions, quizzes and coursework. Confidential support for online students.",
    intro: "Online classes move fast, and falling a week behind can snowball. Whether it's discussion posts, quizzes, or a stack of assignments you can't get to, our experts help you stay on top of your coursework without the all-nighters.",
    topics: ["Weekly assignments","Discussion posts & replies","Quiz & test prep","Reading responses","Group project contributions","Research papers","Lab assignments","Reflection journals","Peer reviews","Final projects"],
    whoFor: "Online students at Walden, University of Phoenix, SNHU, Strayer, Liberty, UMGC, and other programs.",
    help: [["Weekly coursework","Stay current with discussions, assignments, and quizzes."],["Full course support","Ongoing help across a full term from one specialist."],["Quiz & exam prep","Reviews and practice so you walk in prepared."],["Confidential & reliable","Your identity and coursework are never disclosed."]],
    faqs: [["Can you help all term?","Yes — many students get full-course support from one expert."],["Are assignments original?","Yes, written for your course and checked."],["Which universities?","Walden, UOP, SNHU, Strayer, Liberty, UMGC, and most online programs."],["Is it confidential?","Completely — your details are never disclosed."]]
  }
};

export const UNIVERSITIES = {
  "walden": { name: "Walden University", short: "Walden" },
  "university-of-phoenix": { name: "University of Phoenix", short: "UOP" },
  "snhu": { name: "Southern New Hampshire University", short: "SNHU" },
  "strayer": { name: "Strayer University", short: "Strayer" },
  "liberty": { name: "Liberty University", short: "Liberty" },
  "devry": { name: "DeVry University", short: "DeVry" },
  "umgc": { name: "University of Maryland Global Campus", short: "UMGC" },
  "capella": { name: "Capella University", short: "Capella" },
  "grand-canyon": { name: "Grand Canyon University", short: "GCU" },
  "chamberlain": { name: "Chamberlain University", short: "Chamberlain" },
  "purdue-global": { name: "Purdue University Global", short: "Purdue Global" },
  "wgu": { name: "Western Governors University", short: "WGU" },
  "colorado-technical": { name: "Colorado Technical University", short: "CTU" },
  "embry-riddle": { name: "Embry-Riddle Aeronautical University", short: "Embry-Riddle" },
  "south": { name: "South University", short: "South" },
  "regent": { name: "Regent University", short: "Regent" },
  "national": { name: "National University", short: "National" },
  "ashford": { name: "Ashford University", short: "Ashford" },
  "american-military": { name: "American Military University", short: "AMU" },
  "kaplan": { name: "Kaplan University", short: "Kaplan" }
};
