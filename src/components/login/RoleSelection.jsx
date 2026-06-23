import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { gsap } from "gsap";
import {
  Users,
  Megaphone,
  Briefcase,
  ArrowRight,
  Zap,
  ArrowLeft
} from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const cardsRef = useRef(null);

  const handleRoleSelect = (role) => {
    // Store the role in localStorage
    localStorage.setItem("selectedRole", role);
    // Navigate to login
    navigate("/login-page");
  };

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Cards stagger animation
      const cards = cardsRef.current?.querySelectorAll('.role-select-card');
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 50, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: "back.out(1.4)",
            delay: 0.3
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Button hover animation
  const handleCardHover = (e) => {
    gsap.to(e.currentTarget, {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const handleCardLeave = (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
      duration: 0.3,
      ease: "power2.out"
    });
  };

  const roles = [
    {
      id: "endUser",
      title: "User",
      icon: <Users />,
      description: "Engage with interactive ads, play games, and earn real-world rewards through our gamification system.",
      color: "#3b82f6",
      gradient: "from-blue-500 to-indigo-600",
      bgLight: "rgba(59, 130, 246, 0.1)",
    },
    {
      id: "influencer",
      title: "Influencer",
      icon: <Megaphone />,
      description: "Partner with brands, create promotional content, manage collaborations, and track your earnings.",
      color: "#8b5cf6",
      gradient: "from-purple-500 to-pink-600",
      bgLight: "rgba(139, 92, 246, 0.1)",
    },
    {
      id: "brandAdmin",
      title: "Brand",
      icon: <Briefcase />,
      description: "Launch campaigns, manage ads, connect with influencers, and analyze engagement metrics.",
      color: "#f59e0b",
      gradient: "from-amber-500 to-orange-600",
      bgLight: "rgba(245, 158, 11, 0.1)",
    },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f8faf8 0%, #f0f7f1 100%)"
      }}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(78, 122, 81, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(140, 184, 159, 0.08) 0%, transparent 40%)
          `
        }}
      />

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      {/* Header */}
      <div ref={headerRef} className="text-center mb-12 z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #4E7A51 0%, #52aa78 100%)"
            }}
          >
            <Zap size={24} color="white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">AdEngage</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
          Choose Your Role
        </h1>
        <p className="text-base text-gray-500 max-w-md mx-auto leading-relaxed">
          Select how you want to use AdEngage and get started today
        </p>
      </div>

      {/* Role Cards */}
      <div
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full z-10"
      >
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            onMouseEnter={handleCardHover}
            onMouseLeave={handleCardLeave}
            className="role-select-card group cursor-pointer bg-white rounded-2xl p-8 flex flex-col h-full transition-all"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
              border: "1px solid rgba(0, 0, 0, 0.06)"
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
              style={{
                backgroundColor: role.bgLight,
              }}
            >
              <div style={{ color: role.color }} className="w-8 h-8">
                {role.icon}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              {role.title}
            </h3>

            {/* Description */}
            <p className="text-gray-500 mb-8 leading-relaxed text-sm flex-grow">
              {role.description}
            </p>

            {/* Action */}
            <div
              className="flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300"
              style={{ color: role.color }}
            >
              Continue as {role.title} <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Sign Up Link */}
      <div className="mt-10 text-center z-10">
        <p className="text-gray-500 text-sm">
          Don't have an account?{" "}
          <Link
            to="/registration"
            className="font-semibold hover:underline"
            style={{ color: "#4E7A51" }}
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;