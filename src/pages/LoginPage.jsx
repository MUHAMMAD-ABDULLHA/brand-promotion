import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../slice/userSlice";
import { Zap, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

// Product/Campaign showcase items
const showcaseItems = [
  {
    id: 1,
    name: "Campaign Analytics",
    icon: "📊",
    color: "#4E7A51",
  },
  {
    id: 2,
    name: "Creator Network",
    icon: "👥",
    color: "#8b5cf6",
  },
  {
    id: 3,
    name: "Reward System",
    icon: "🎁",
    color: "#f59e0b",
  },
];

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const cardsRef = useRef([]);
  const stringsRef = useRef([]);

  // Redux state
  const { loading, error } = useSelector((state) => state.user);

  // Local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState(localStorage.getItem("selectedRole") || "");

  // Redirect if no role selected
  useEffect(() => {
    if (role === "") {
      navigate("/role-selection");
    }
  }, [role, navigate]);

  // GSAP Animations - dynamically imported
  useEffect(() => {
    if (role === "") return;

    import("gsap").then(({ gsap }) => {
      const ctx = gsap.context(() => {
        // Form slide in animation
        gsap.fromTo(formRef.current,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" }
        );

        // Hanging cards animation - drop from above with swing
        cardsRef.current.forEach((card, index) => {
          if (!card) return;

          const string = stringsRef.current[index];

          // Initial drop animation
          gsap.fromTo([string, card],
            {
              y: -300,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 1.2,
              delay: 0.3 + (index * 0.2),
              ease: "elastic.out(1, 0.5)",
            }
          );

          // Continuous swinging animation
          gsap.to(card, {
            rotateZ: 5,
            duration: 2 + (index * 0.3),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 1.5 + (index * 0.2),
          });

          // String also swings
          if (string) {
            gsap.to(string, {
              rotateZ: 3,
              duration: 2 + (index * 0.3),
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: 1.5 + (index * 0.2),
            });
          }
        });
      }, containerRef);

      return () => ctx.revert();
    });
  }, [role]);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const payload = { role, email, password };

    try {
      const result = await dispatch(loginUser(payload)).unwrap();

      if (result.user?.id) {
        localStorage.setItem("user_id", result.user.id);
      }

      const userRole = result.user?.role;
      if (userRole === "brandAdmin") {
        navigate("/unified-ad-dashboard");
      } else if (userRole === "endUser") {
        navigate("/user-management");
      } else if (userRole === "influencer") {
        navigate("/influencer");
      } else {
        navigate("/administrator-dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch (role) {
      case "endUser": return "User";
      case "influencer": return "Influencer";
      case "brandAdmin": return "Brand";
      default: return "";
    }
  };

  if (role === "") return null;

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex"
      style={{ background: "linear-gradient(135deg, #f8faf8 0%, #f0f7f1 100%)" }}
    >
      {/* Left Side - Login Form */}
      <div
        ref={formRef}
        className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-12"
      >
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link
            to="/role-selection"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            Change Role
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4E7A51 0%, #52aa78 100%)" }}
            >
              <Zap size={24} color="white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AdEngage</span>
          </div>

          {/* Welcome Text */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in as <span className="font-semibold text-gray-700">{getRoleDisplayName()}</span> to continue
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-base focus:border-[#4E7A51] focus:ring-2 focus:ring-[#4E7A51]/20 focus:outline-none transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-base focus:border-[#4E7A51] focus:ring-2 focus:ring-[#4E7A51]/20 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/Forget-Password"
                className="text-sm font-medium text-[#4E7A51] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #4E7A51 0%, #52aa78 100%)",
                boxShadow: "0 4px 15px rgba(78, 122, 81, 0.3)"
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-gray-500">
            Don't have an account?{" "}
            <Link to="/registration" className="font-semibold text-[#4E7A51] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hanging Cards Showcase (Hidden on mobile) */}
      <div
        className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4E7A51 0%, #3d6140 100%)" }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, white 0%, transparent 50%),
                              radial-gradient(circle at 70% 80%, white 0%, transparent 40%)`
          }}
        />

        {/* Hanging Cards */}
        <div className="relative w-full h-full flex items-start justify-center pt-0">
          {showcaseItems.map((item, index) => {
            const xOffset = (index - 1) * 180; // -180, 0, 180
            const yOffset = index === 1 ? 80 : 40; // Middle one hangs lower

            return (
              <div
                key={item.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(50% + ${xOffset}px)`,
                  top: `${yOffset}px`,
                  transform: "translateX(-50%)",
                  transformOrigin: "top center",
                }}
              >
                {/* String */}
                <div
                  ref={el => stringsRef.current[index] = el}
                  className="w-0.5 bg-white/40"
                  style={{
                    height: index === 1 ? "120px" : "80px",
                    transformOrigin: "top center",
                  }}
                />

                {/* Card */}
                <div
                  ref={el => cardsRef.current[index] = el}
                  className="bg-white rounded-2xl p-6 shadow-2xl"
                  style={{
                    width: "160px",
                    transformOrigin: "top center",
                  }}
                >
                  <div
                    className="text-4xl mb-4 text-center"
                    style={{ lineHeight: 1 }}
                  >
                    {item.icon}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 text-center">
                    {item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Start Your Journey
          </h2>
          <p className="text-white/70 text-sm max-w-xs mx-auto">
            Connect with brands, creators, and users on our platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
