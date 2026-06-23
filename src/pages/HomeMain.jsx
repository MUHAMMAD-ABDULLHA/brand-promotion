import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Menu,
  X,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  BarChart2,
  Gift,
  Megaphone,
  Briefcase,
  Play,
  Target,
  Award,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import '../Home.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function HomeMain() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Refs for GSAP animations
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroCtaRef = useRef(null);
  const featuresRef = useRef(null);
  const rolesRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // GSAP Animations
  useEffect(() => {
    // Hero animations
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    heroTl
      .fromTo(heroTitleRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1 }
      )
      .fromTo(heroSubtitleRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(heroCtaRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.4"
      );

    // Features animation on scroll
    const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
    if (featureCards) {
      gsap.fromTo(featureCards,
        { opacity: 0, y: 80, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Roles animation
    const roleCards = rolesRef.current?.querySelectorAll('.role-card');
    if (roleCards) {
      gsap.fromTo(roleCards,
        { opacity: 0, x: -60, rotateY: 15 },
        {
          opacity: 1,
          x: 0,
          rotateY: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: rolesRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Stats counter animation
    const statItems = statsRef.current?.querySelectorAll('.stat-item');
    if (statItems) {
      gsap.fromTo(statItems,
        { opacity: 0, scale: 0.5 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "elastic.out(1, 0.5)",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // CTA animation
    if (ctaRef.current) {
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Button hover animation
  const handleButtonHover = (e, scale = 1.05) => {
    gsap.to(e.currentTarget, { scale, duration: 0.3, ease: "power2.out" });
  };

  const handleButtonLeave = (e) => {
    gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: "power2.out" });
  };

  // Role cards matching actual project roles
  const roles = [
    {
      id: 'endUser',
      title: 'User',
      icon: <Users className="role-icon" />,
      description: 'Engage with interactive ads, play games, and earn rewards through our gamification system.',
      color: 'role-user',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'influencer',
      title: 'Influencer',
      icon: <Megaphone className="role-icon" />,
      description: 'Partner with brands, create content, manage collaborations, and track your earnings.',
      color: 'role-influencer',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'brandAdmin',
      title: 'Brand',
      icon: <Briefcase className="role-icon" />,
      description: 'Launch campaigns, manage ads, connect with creators, and analyze performance metrics.',
      color: 'role-brand',
      gradient: 'from-amber-500 to-orange-600'
    }
  ];

  // Platform features based on actual project capabilities
  const features = [
    {
      icon: <BarChart2 size={32} />,
      title: 'Campaign Analytics',
      description: 'Track impressions, clicks, CTR, and conversions with real-time dashboards.'
    },
    {
      icon: <Users size={32} />,
      title: 'Creator Collaborations',
      description: 'Connect brands with influencers for authentic marketing partnerships.'
    },
    {
      icon: <Gift size={32} />,
      title: 'Gamified Rewards',
      description: 'Engage users with interactive ads and redeemable coupon rewards.'
    },
    {
      icon: <Target size={32} />,
      title: 'Smart Targeting',
      description: 'Reach the right audience with data-driven campaign optimization.'
    }
  ];

  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <span className="logo-text">AdEngage</span>
          </div>

          <div className="landing-nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#roles" className="nav-link">Get Started</a>
          </div>

          <div className="landing-nav-actions">
            <button
              className="nav-signin-btn"
              onClick={() => navigate('/role-selection')}
              onMouseEnter={(e) => handleButtonHover(e)}
              onMouseLeave={handleButtonLeave}
            >
              Sign In
            </button>
            <button
              className="nav-cta-btn"
              onClick={() => navigate('/registration')}
              onMouseEnter={(e) => handleButtonHover(e)}
              onMouseLeave={handleButtonLeave}
            >
              Get Started
            </button>
          </div>

          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="mobile-nav-menu">
            <a href="#features" className="mobile-nav-link" onClick={toggleMenu}>Features</a>
            <a href="#how-it-works" className="mobile-nav-link" onClick={toggleMenu}>How It Works</a>
            <a href="#roles" className="mobile-nav-link" onClick={toggleMenu}>Get Started</a>
            <div className="mobile-nav-auth">
              <button className="mobile-signin" onClick={() => navigate('/role-selection')}>Sign In</button>
              <button className="mobile-signup" onClick={() => navigate('/registration')}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="landing-hero" ref={heroRef}>
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Brand Promotion Platform</span>
          </div>

          <h1 className="hero-title" ref={heroTitleRef}>
            Connect <span className="hero-gradient-text">Brands</span> with
            <span className="hero-gradient-text"> Creators</span>
          </h1>

          <p className="hero-subtitle" ref={heroSubtitleRef}>
            Launch campaigns, collaborate with influencers, and engage users
            through gamified advertising experiences.
          </p>

          <div className="hero-cta-group" ref={heroCtaRef}>
            <button
              className="hero-primary-btn"
              onClick={() => navigate('/role-selection')}
              onMouseEnter={(e) => handleButtonHover(e, 1.08)}
              onMouseLeave={handleButtonLeave}
            >
              Start Free <ArrowRight size={18} />
            </button>
            <button
              className="hero-secondary-btn"
              onClick={() => navigate('/role-selection')}
              onMouseEnter={(e) => handleButtonHover(e)}
              onMouseLeave={handleButtonLeave}
            >
              <Play size={18} /> See How It Works
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">500+</span>
              <span className="hero-stat-label">Campaigns</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">10K+</span>
              <span className="hero-stat-label">Users</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">98%</span>
              <span className="hero-stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="hero-visual-card card-1">
            <BarChart2 size={24} />
            <span>Campaign Analytics</span>
          </div>
          <div className="hero-visual-card card-2">
            <Users size={24} />
            <span>Creator Network</span>
          </div>
          <div className="hero-visual-card card-3">
            <Gift size={24} />
            <span>Rewards System</span>
          </div>
          <div className="hero-visual-orb orb-1"></div>
          <div className="hero-visual-orb orb-2"></div>
          <div className="hero-visual-orb orb-3"></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-features" ref={featuresRef}>
        <div className="section-header">
          <span className="section-label">Platform Features</span>
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            Powerful tools to manage campaigns, track performance, and grow your brand
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              onMouseEnter={(e) => handleButtonHover(e, 1.03)}
              onMouseLeave={handleButtonLeave}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-how-it-works">
        <div className="section-header">
          <span className="section-label">Simple Process</span>
          <h2 className="section-title">How AdEngage Works</h2>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Choose Your Role</h3>
              <p>Sign up as a Brand, Influencer, or User based on your goals.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Create or Join Campaigns</h3>
              <p>Brands launch campaigns, creators apply, users engage with content.</p>
            </div>
          </div>
          <div className="step-connector"></div>
          <div className="step-item">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Track & Earn</h3>
              <p>Monitor analytics, track performance, and earn rewards or revenue.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="landing-roles" ref={rolesRef}>
        <div className="section-header">
          <span className="section-label">Get Started</span>
          <h2 className="section-title">Choose Your Path</h2>
          <p className="section-subtitle">
            Select how you want to use AdEngage
          </p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${role.color}`}
              onClick={() => navigate('/role-selection')}
              onMouseEnter={(e) => handleButtonHover(e, 1.05)}
              onMouseLeave={handleButtonLeave}
            >
              <div className="role-icon-wrapper">
                {role.icon}
              </div>
              <h3 className="role-title">{role.title}</h3>
              <p className="role-description">{role.description}</p>
              <div className="role-action">
                Get Started <ArrowRight size={16} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-stats" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-item">
            <Zap className="stat-icon" />
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Active Campaigns</p>
          </div>
          <div className="stat-item">
            <Users className="stat-icon" />
            <h3 className="stat-number">10K+</h3>
            <p className="stat-label">Registered Users</p>
          </div>
          <div className="stat-item">
            <TrendingUp className="stat-icon" />
            <h3 className="stat-number">$2M+</h3>
            <p className="stat-label">Campaign Value</p>
          </div>
          <div className="stat-item">
            <Award className="stat-icon" />
            <h3 className="stat-number">98%</h3>
            <p className="stat-label">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta" ref={ctaRef}>
        <div className="cta-content">
          <ShieldCheck size={48} className="cta-icon" />
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-text">
            Join AdEngage and start connecting with brands, creators, and engaged users today.
          </p>
          <div className="cta-buttons">
            <button
              className="cta-primary"
              onClick={() => navigate('/registration')}
              onMouseEnter={(e) => handleButtonHover(e, 1.08)}
              onMouseLeave={handleButtonLeave}
            >
              Create Free Account
            </button>
            <button
              className="cta-secondary"
              onClick={() => navigate('/role-selection')}
              onMouseEnter={(e) => handleButtonHover(e)}
              onMouseLeave={handleButtonLeave}
            >
              Sign In <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">
                <Zap size={20} />
              </div>
              <span className="logo-text">AdEngage</span>
            </div>
            <p className="footer-tagline">
              Connecting brands with creators for impactful advertising.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4>Platform</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#roles">Get Started</a>
            </div>
            <div className="footer-links-col">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">Documentation</a>
            </div>
            <div className="footer-links-col">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} AdEngage. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomeMain;