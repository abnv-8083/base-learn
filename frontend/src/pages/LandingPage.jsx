import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/student-landing.css';

const LandingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqs = [
        { q: "Is this platform really free to start?", a: "Yes! You can sign up for free and access our sample video lessons and basic quizzes to get a feel of the platform before upgrading." },
        { q: "What subjects do you cover?", a: "We currently cover Mathematics, Physics, Chemistry, Biology, English, and Social Studies for Grades 8, 9, and 10." },
        { q: "Can I watch the classes on my mobile?", a: "Absolutely. Our platform is fully responsive and optimized for a seamless mobile learning experience." },
        { q: "Do I get notes and assignments?", a: "Yes, all premium plans include comprehensive study materials, chapter-wise notes, and regular assignments graded by experts." },
        { q: "How can I clear my doubts?", a: "You can post questions in our dedicated Doubt Forum or ask directly during the live interactive sessions included in the Grade 9 and 10 plans." },
        { q: "Are there regular tests?", a: "Yes, we conduct weekly practice tests and monthly mock exams to ensure you are well-prepared for your finals." },
        { q: "Can I change my grade later?", a: "Yes, you can update your grade and profile settings from your student dashboard anytime." },
        { q: "What is your refund policy?", a: "We offer a 7-day money-back guarantee if you are not satisfied with the platform. No questions asked." }
    ];

    return (
        <div className="landing-body">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="logo">
                    <i className="ph-fill ph-graduation-cap"></i>
                    <span>Base Learn</span>
                </div>
                <div className="nav-links">
                    <a href="#subjects" className="nav-link">Subjects</a>
                    <a href="#how-it-works" className="nav-link">How it Works</a>
                    <a href="#pricing" className="nav-link">Pricing</a>
                    <Link to="/student" className="btn-primary">Go to Portal</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content animate-fade-in">
                    <h1>Learn. Score. <span className="gradient-text">Repeat.</span></h1>
                    <p>Master your school syllabus with India's most interactive E-Learning platform designed for Grade 8-10 students. Clear concepts, take tests, and top your class!</p>
                    <div className="hero-actions">
                        <Link to="/student/register" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Start Learning Free</Link>
                        <button className="btn-outline" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            <i className="ph ph-play-circle" style={{ fontSize: '1.5rem' }}></i>
                            Watch Demo
                        </button>
                    </div>
                </div>
                <div className="hero-illustration">
                    <div className="floating-element" style={{ top: '10%', left: '20%', background: '#EBF3FD', padding: '20px', borderRadius: '20px', boxShadow: 'var(--shadow-lg)' }}>
                        <i className="ph-fill ph-atom text-blue" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <div className="floating-element" style={{ top: '40%', right: '10%', background: '#FFF5E6', padding: '25px', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', animationDelay: '1s' }}>
                        <i className="ph-fill ph-calculator text-muted" style={{ fontSize: '3.5rem', color: 'var(--warning-orange)' }}></i>
                    </div>
                    <div className="floating-element" style={{ bottom: '15%', left: '30%', background: '#E8F8EE', padding: '15px', borderRadius: '20px', boxShadow: 'var(--shadow-lg)', animationDelay: '2s' }}>
                        <i className="ph-fill ph-dna text-green" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                         <i className="ph-fill ph-book-open" style={{ fontSize: '10rem', color: 'var(--primary-blue)', opacity: 0.1 }}></i>
                    </div>
                </div>
            </header>

            {/* Stats Bar */}
            <section className="stats-bar">
                <div className="stat-item">
                    <h3>12,000+</h3>
                    <p className="text-muted">Active Students</p>
                </div>
                <div className="stat-item">
                    <h3>500+</h3>
                    <p className="text-muted">Recorded Classes</p>
                </div>
                <div className="stat-item">
                    <h3>95%</h3>
                    <p className="text-muted">Score Improvement</p>
                </div>
            </section>

            {/* Subjects Section */}
            <section id="subjects" className="section">
                <div className="section-title-wrap">
                    <h2>Master Every Subject</h2>
                    <p className="text-muted">Expert-led courses tailored for your curriculum</p>
                </div>
                <div className="subject-grid">
                    <div className="subject-card">
                        <div className="card-inner">
                            <div className="card-front"><i className="ph-fill ph-function"></i><h3>Mathematics</h3></div>
                            <div className="card-back"><h3>Mathematics</h3><p>Algebra, Geometry, Trigonometry, and Calculus basics.</p><button className="btn-outline" style={{background: 'white', marginTop: '1rem'}}>View Syllabus</button></div>
                        </div>
                    </div>
                    <div className="subject-card">
                        <div className="card-inner">
                            <div className="card-front"><i className="ph-fill ph-lightning"></i><h3>Physics</h3></div>
                            <div className="card-back"><h3>Physics</h3><p>Mechanics, Optics, Electricity, and Modern Physics.</p><button className="btn-outline" style={{background: 'white', marginTop: '1rem'}}>View Syllabus</button></div>
                        </div>
                    </div>
                    <div className="subject-card">
                        <div className="card-inner">
                            <div className="card-front"><i className="ph-fill ph-flask"></i><h3>Chemistry</h3></div>
                            <div className="card-back"><h3>Chemistry</h3><p>Organic, Inorganic, and Physical Chemistry concepts.</p><button className="btn-outline" style={{background: 'white', marginTop: '1rem'}}>View Syllabus</button></div>
                        </div>
                    </div>
                    <div className="subject-card">
                        <div className="card-inner">
                            <div className="card-front"><i className="ph-fill ph-dna"></i><h3>Biology</h3></div>
                            <div className="card-back"><h3>Biology</h3><p>Botany, Zoology, Genetics, and Human Anatomy.</p><button className="btn-outline" style={{background: 'white', marginTop: '1rem'}}>View Syllabus</button></div>
                        </div>
                    </div>
                    <div className="subject-card">
                        <div className="card-inner">
                            <div className="card-front"><i className="ph-fill ph-translate"></i><h3>English</h3></div>
                            <div className="card-back"><h3>English</h3><p>Grammar, Literature, Composition, and Communication.</p><button className="btn-outline" style={{background: 'white', marginTop: '1rem'}}>View Syllabus</button></div>
                        </div>
                    </div>
                    <div className="subject-card">
                        <div className="card-inner">
                            <div className="card-front"><i className="ph-fill ph-globe-hemisphere-west"></i><h3>Social Studies</h3></div>
                            <div className="card-back"><h3>Social Studies</h3><p>History, Geography, Civics, and Economics.</p><button className="btn-outline" style={{background: 'white', marginTop: '1rem'}}>View Syllabus</button></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="section bg-app">
                <div className="section-title-wrap">
                    <h2>How It Works</h2>
                    <p className="text-muted">Three simple steps to mastery</p>
                </div>
                <div className="how-it-works-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <div className="icon-wrapper blue" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}><i className="ph-fill ph-user-plus"></i></div>
                        <h3>Sign Up</h3>
                        <p className="text-muted">Create your free account in seconds and set up your profile.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <div className="icon-wrapper orange" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}><i className="ph-fill ph-books"></i></div>
                        <h3>Pick Subjects</h3>
                        <p className="text-muted">Select your grade and the subjects you want to focus on.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <div className="icon-wrapper green" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}><i className="ph-fill ph-play-circle"></i></div>
                        <h3>Watch & Score</h3>
                        <p className="text-muted">Watch expert video lessons, take tests, and track progress.</p>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="section bg-app">
                <div className="section-title-wrap">
                    <h2>Student Success Stories</h2>
                    <p className="text-muted">Hear from those who are already topping their class</p>
                </div>
                <div className="testimonial-carousel">
                    <div className="testimonial-track">
                        {[
                            { name: "Aditi S.", grade: "Grade 10", text: "\"Base Learn helped me improve my Math score from 65% to 92%. The video lessons are so easy to understand!\"" },
                            { name: "Rohan M.", grade: "Grade 9", text: "\"The practice tests are exactly like the real exams. I go into the exam hall with zero fear now.\"" },
                            { name: "Kavya P.", grade: "Grade 8", text: "\"I love earning badges and competing on the leaderboard. It makes studying feel like a game!\"" }
                        ].map((t, i) => (
                            <div className="testimonial-card" key={i}>
                                <div className="stars">★★★★★</div>
                                <p>{t.text}</p>
                                <div className="student-info">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`} alt={t.name} className="avatar avatar-md" />
                                    <div>
                                        <h4>{t.name}</h4>
                                        <span className="text-muted text-xs">{t.grade}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="section">
                <div className="section-title-wrap">
                    <h2>Simple, Transparent Pricing</h2>
                    <p className="text-muted">Choose the plan that fits your academic year</p>
                </div>
                <div className="pricing-grid">
                    <div className="price-card">
                        <h3>Grade 8</h3>
                        <div className="price">₹499<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
                        <ul className="features-list">
                            <li><i className="ph-fill ph-check-circle"></i> All 6 Subjects Included</li>
                            <li><i className="ph-fill ph-check-circle"></i> 200+ Video Lessons</li>
                            <li><i className="ph-fill ph-check-circle"></i> Weekly Practice Tests</li>
                            <li><i className="ph-fill ph-check-circle"></i> Doubt Clearing Forum</li>
                        </ul>
                        <button className="btn-outline" style={{ width: '100%' }}>Get Started</button>
                    </div>
                    <div className="price-card featured">
                        <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>Most Popular</span>
                        <h3>Grade 9</h3>
                        <div className="price">₹599<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
                        <ul className="features-list">
                            <li><i className="ph-fill ph-check-circle"></i> Everything in Grade 8</li>
                            <li><i className="ph-fill ph-check-circle"></i> Pre-Board Prep Material</li>
                            <li><i className="ph-fill ph-check-circle"></i> 1-on-1 Mentorship (Monthly)</li>
                            <li><i className="ph-fill ph-check-circle"></i> Live Group Sessions</li>
                        </ul>
                        <button className="btn-primary" style={{ width: '100%' }}>Get Started</button>
                    </div>
                    <div className="price-card">
                        <h3>Grade 10</h3>
                        <div className="price">₹799<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/mo</span></div>
                        <ul className="features-list">
                            <li><i className="ph-fill ph-check-circle"></i> Everything in Grade 9</li>
                            <li><i className="ph-fill ph-check-circle"></i> 10 Previous Year Papers</li>
                            <li><i className="ph-fill ph-check-circle"></i> Intensive Revision Course</li>
                            <li><i className="ph-fill ph-check-circle"></i> Board Exam Strategy</li>
                        </ul>
                        <button className="btn-outline" style={{ width: '100%' }}>Get Started</button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="section bg-app">
                <div className="section-title-wrap">
                    <h2>Frequently Asked Questions</h2>
                    <p className="text-muted">Answers to your common queries</p>
                </div>
                <div className="faq-accordion">
                    {faqs.map((faq, index) => (
                        <div className={`faq-item ${activeFaq === index ? 'active' : ''}`} key={index}>
                            <button className="faq-question" onClick={() => toggleFaq(index)}>
                                <span>{faq.q}</span>
                                <i className="ph ph-caret-down"></i>
                            </button>
                            <div className="faq-answer">
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="logo">
                            <i className="ph-fill ph-graduation-cap"></i>
                            <span>Base Learn</span>
                        </div>
                        <p className="text-muted">Empowering the next generation of learners with interactive, accessible, and high-quality education. Join 12,000+ students today.</p>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Explore</h4>
                        <ul className="flex-col gap-2">
                            <li><a href="#" className="text-muted hover-underline">Courses</a></li>
                            <li><a href="#" className="text-muted hover-underline">Live Classes</a></li>
                            <li><a href="#" className="text-muted hover-underline">Quizzes</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Company</h4>
                        <ul className="flex-col gap-2">
                            <li><a href="#" className="text-muted hover-underline">About Us</a></li>
                            <li><a href="#" className="text-muted hover-underline">Contact</a></li>
                            <li><a href="#" className="text-muted hover-underline">Privacy Policy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ marginBottom: '1.5rem' }}>Support</h4>
                        <ul className="flex-col gap-2">
                            <li><a href="#" className="text-muted hover-underline">Help Center</a></li>
                            <li><a href="#" className="text-muted hover-underline">FAQs</a></li>
                            <li><a href="#" className="text-muted hover-underline">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom text-center pt-8 border-top">
                    <p className="text-muted text-xs">&copy; 2026 Base Learn Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
