import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  registerUser,
  registerBrand,
  registerInfluencer,
} from '../../slice/userSlice';
import { ArrowLeft, Zap, Users, Megaphone, Briefcase, Check } from 'lucide-react';

import RoleSelectionStep from './RoleSelectionStep';
import RegistrationDetailsStep from './RegistrationDetailsStep';

const roleDetails = {
  brand: {
    title: "Forge Your Brand's Digital Frontier",
    catchline: "Showcase your products, find collaborators, and grow your market reach.",
    icon: <Briefcase size={48} />,
    color: "#f59e0b",
  },
  influencer: {
    title: "Amplify Your Influence",
    catchline: "Partner with top brands, monetize your social presence, and create impactful content.",
    icon: <Megaphone size={48} />,
    color: "#8b5cf6",
  },
  user: {
    title: "Explore, Connect, and Discover",
    catchline: "Engage with interactive ads and earn real-world rewards.",
    icon: <Users size={48} />,
    color: "#3b82f6",
  },
};

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const rightPanelRef = useRef(null);

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('user');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    username: '',
    phone: '',
    age: '',
    image_url: '',
    bio: '',
    image_id: '',
    privacy_status: 'public',

    // Brand Specific
    brand_name: '',
    brand_website: '',
    location: '',
    niche: '',

    // Influencer Specific
    social_media: '',
    social_media_link: '',
    followers: '',
    pricing: '',
    content_type: '',
    target_audience: '',
  });

  const selectedRole = role ? roleDetails[role] : null;

  // GSAP Animations - dynamically imported
  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      const ctx = gsap.context(() => {
        // Form animation
        gsap.fromTo(formRef.current,
          { opacity: 0, x: -40 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }
        );

        // Right panel animation
        if (rightPanelRef.current) {
          gsap.fromTo(rightPanelRef.current,
            { opacity: 0, x: 40 },
            { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.2 }
          );
        }
      }, containerRef);

      return () => ctx.revert();
    });
  }, []);

  // Animate role change
  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      if (rightPanelRef.current) {
        gsap.fromTo(rightPanelRef.current.querySelector('.role-content'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
      }
    });
  }, [role]);

  // Animate step change
  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      if (formRef.current) {
        gsap.fromTo(formRef.current.querySelector('.step-content'),
          { opacity: 0, x: step === 1 ? -20 : 20 },
          { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
        );
      }
    });
  }, [step]);

  const handleCancel = () => navigate('/role-selection');

  const handleStepOneSubmit = (e) => {
    e.preventDefault();
    if (role) {
      setStep(2);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payloadImageID = parseInt(formData.image_id) || 0;
    const payloadAge = parseInt(formData.age) || 0;
    const payloadFollowers = parseInt(formData.followers) || 0;

    const accountStatus = role === 'user' ? 'active' : 'pending';

    if (role === 'user') {
      dispatch(
        registerUser({
          user: {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            username: formData.username,
            phone: formData.phone,
            age: payloadAge,
            image_url: formData.image_url,
            bio: formData.bio,
            account_status: accountStatus,
            role: role,
            image_id: payloadImageID,
            privacy_status: "public",
          }
        })
      );
    } else if (role === 'brand') {
      dispatch(
        registerBrand({
          user: {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            username: formData.username,
            phone: formData.phone,
            age: payloadAge,
            image_url: formData.image_url,
            bio: formData.bio,
            account_status: accountStatus,
            role: "brandAdmin",
            image_id: payloadImageID,
            privacy_status: "public",
          },
          brand_name: formData.brand_name,
          brand_website: formData.brand_website,
          location: formData.location,
          social_media_link: formData.social_media_link || '',
          niche: formData.niche,
        })
      );
    } else if (role === 'influencer') {
      dispatch(
        registerInfluencer({
          user: {
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            username: formData.username,
            phone: formData.phone,
            age: payloadAge,
            image_url: formData.image_url,
            bio: formData.bio,
            account_status: accountStatus,
            role: role,
            image_id: payloadImageID,
            privacy_status: "public",
          },
          social_media: formData.social_media,
          social_media_link: formData.social_media_link,
          followers: payloadFollowers,
          location: formData.location,
          pricing: formData.pricing,
          niche: formData.niche,
          content_type: formData.content_type,
          target_audience: formData.target_audience,
        })
      );
    }
    navigate('/role-selection');
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col lg:flex-row"
      style={{ background: "linear-gradient(135deg, #f8faf8 0%, #f0f7f1 100%)" }}
    >
      {/* Left: Form Section */}
      <div
        ref={formRef}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 min-h-screen lg:min-h-0"
      >
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 sm:p-8">
          {/* Back Button */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors mb-6"
            onClick={step === 1 ? handleCancel : () => setStep(1)}
          >
            <ArrowLeft size={18} />
            {step === 1 ? 'Back to Login' : 'Back to Role Selection'}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4E7A51 0%, #52aa78 100%)" }}
            >
              <Zap size={22} color="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AdEngage</span>
          </div>

          {/* Header */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">
            {step === 1 ? 'Choose your account type' : 'Fill in your details'}
          </p>

          {/* Progress Bar */}
          <div className="flex items-center gap-4 mb-8">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 1
                    ? 'bg-[#4E7A51] text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                Account Type
              </span>
            </div>

            {/* Connector */}
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-[#4E7A51]' : 'bg-gray-200'} transition-colors`} />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step >= 2
                    ? 'bg-[#4E7A51] text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                2
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                Details
              </span>
            </div>
          </div>

          {/* Step Content */}
          <div className="step-content">
            {step === 1 && (
              <RoleSelectionStep
                role={role}
                setRole={setRole}
                handleStepOneSubmit={handleStepOneSubmit}
                handleCancel={handleCancel}
              />
            )}

            {step === 2 && (
              <RegistrationDetailsStep
                role={role}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
              />
            )}
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-8 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/role-selection" className="text-[#4E7A51] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Right: Dynamic Display Section (hidden on mobile) */}
      <div
        ref={rightPanelRef}
        className="hidden lg:flex w-1/2 items-center justify-center p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4E7A51 0%, #3d6140 100%)" }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, white 0%, transparent 50%),
                              radial-gradient(circle at 70% 70%, white 0%, transparent 40%)`
          }}
        />

        {/* Content */}
        <div className="role-content flex flex-col items-center text-center space-y-6 max-w-md z-10">
          {selectedRole ? (
            <>
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <div style={{ color: 'white' }}>
                  {selectedRole.icon}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {selectedRole.title}
              </h1>
              <p className="text-lg text-white/80">
                {selectedRole.catchline}
              </p>

              {/* Features list */}
              <div className="pt-6 space-y-3 text-left w-full">
                <div className="flex items-center gap-3 text-white/90">
                  <Check size={18} className="text-white/70" />
                  <span className="text-sm">Quick and easy registration</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Check size={18} className="text-white/70" />
                  <span className="text-sm">Access to campaigns and analytics</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Check size={18} className="text-white/70" />
                  <span className="text-sm">Connect with brands and creators</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center">
                <Zap size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Join AdEngage</h1>
              <p className="text-lg text-white/80">Select an account type to get started.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;