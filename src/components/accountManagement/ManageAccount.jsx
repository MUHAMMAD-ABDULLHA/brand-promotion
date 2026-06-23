import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Email, ArrowBack } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, uploadImage } from '../../slice/userSlice'; // Import uploadImage thunk


/* =========================
   Forget Password Component 
   ========================= */
const ForgetPassword = ({ onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.user); // Get user from Redux
  const userId = user?.id; // Extract user_id
  const [email, setEmail] = useState(location.state?.email || user?.email || '');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const inputRefs = useRef([]);

  // Send verification code
  const handleForgetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, user_id: userId }), // Send user_id
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to send code');
      setIsCodeSent(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for code
  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value && newCode.every((c) => c !== '')) {
      handleVerifyCode(newCode.join(''));
    }
  };

  // Move focus on backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify code
  const handleVerifyCode = async (enteredCode) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: enteredCode || code.join(''), user_id: userId }), // Send user_id
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Invalid code');
      setIsCodeVerified(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validate passwords
  const validatePasswords = () => {
    let isValid = true;
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (newPassword.length < 8) {
      setNewPasswordError('Password must be at least 8 characters long');
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePasswords()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, user_id: userId }), // Send user_id
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to reset password');
      navigate('/role-selection', { state: { message: 'Password reset successfully. Please log in.' } });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="flex justify-center items-center min-h-screen bg-background p-6">
      <div className="relative bg-card text-card-foreground rounded-xl shadow-lg p-8 w-full max-w-md border border-border">
        {/* Back Button */}
        <button
          className="absolute top-4 left-4 p-2 text-primary hover:bg-primary/10 rounded-full transition"
          onClick={onBack}
        >
          <ArrowBack />
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center mb-6 text-primary">
          <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 22c-5.5 0-10-4.5-10-10S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
            <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" />
            <path d="M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
          </svg>
          <h1 className="ml-3 text-2xl font-bold">EngageAd</h1>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Reset your password
        </h2>

        {/* Error */}
        {newPasswordError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm text-center">
            {newPasswordError}
          </div>
        )}

        {/* Email Form */}
        {!isCodeSent && (
          <form onSubmit={handleForgetPassword} className="space-y-4">
            <p className="text-center text-muted-foreground text-sm mb-4">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
            <div className="relative">
              <Email className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Send verification code"}
            </button>
          </form>
        )}

        {/* Code Verification */}
        {isCodeSent && !isCodeVerified && (
          <div className="flex flex-col items-center">
            <p className="text-center text-muted-foreground text-sm mb-4">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below to continue.
            </p>
            <div className="flex gap-2 mb-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-12 h-14 text-center text-lg border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyCode}
              disabled={loading || code.some((c) => c === "")}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify code"}
            </button>
            <p className="mt-4 text-sm text-muted-foreground">
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={handleForgetPassword}
                className="text-primary font-medium hover:underline"
              >
                Resend code
              </button>
            </p>
          </div>
        )}

        {/* Reset Password */}
        {isCodeVerified && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <h2 className="text-xl font-semibold">Security Settings</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError(
                    e.target.value.length < 8
                      ? "Password must be at least 8 characters long"
                      : ""
                  );
                }}
                placeholder="Enter new password"
                required
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none ${newPasswordError ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
              />
              {newPasswordError && (
                <div className="text-destructive text-sm mt-1">{newPasswordError}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError(
                    e.target.value !== newPassword
                      ? "Passwords do not match"
                      : ""
                  );
                }}
                placeholder="Confirm new password"
                required
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none ${confirmPasswordError ? "border-destructive focus:ring-destructive" : "border-input"
                  }`}
              />
              {confirmPasswordError && (
                <div className="text-destructive text-sm mt-1">{confirmPasswordError}</div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || newPasswordError || confirmPasswordError}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Security Settings"}
            </button>
          </form>
        )}
      </div>
    </div>

  );
};

/* =========================
   Manage Account Component
   ========================= */
const ManageAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showForgetPassword, setShowForgetPassword] = useState(false);
  const [profile, setProfile] = useState({
    fullname: '',
    username: '',
    email: '',
    phone: '',
    age: '',
    // Renamed profilePicture to image_url for consistency with backend
    image_url: null,
    bio: '',
    account_status: '',
    privacy_status: 'public',
    image_id: null,
  });

  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // New state for image upload specific loading and error
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState(null);

  /* Map user object from Redux store to profile state */
  useEffect(() => {
    if (user) {
      console.log("User: ", user)
      setProfile({
        fullname: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        age: user.age || '',
        image_url: user.image || null,
        bio: user.bio || '',
        account_status: user.account_status || '',
      });
    }
  }, [user]);
  console.log("Profile: ", profile)

  const handleSignOut = () => {
    // Remove authentication token
    localStorage.removeItem('token');

    // Reset theme to light mode
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');

    // Redirect to login page
    navigate('/role-selection');
  };

  // Profile update with user_id
  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      // Dispatch updateProfile with the current profile state
      await dispatch(updateProfile({
        full_name: profile.fullname,
        username: profile.username, // Ensure username is included
        email: profile.email,
        phone: profile.phone,
        age: parseInt(profile.age) || 0, // Ensure age is number
        image_url: profile.image_url, // This will be the Cloudinary URL
        bio: profile.bio,
        account_status: profile.account_status,
        privacy_status: profile.privacy_status,
        image_id: profile.image_id,
        id: user.id // Pass user_id to API
      })).unwrap();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };


  // UPDATED: handleProfilePictureChange to use uploadImage thunk
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setProfile(prev => ({ ...prev, image_url: null })); // Clear image if no file selected
      setImageUploadError(null);
      return;
    }

    // Optional: client-side file size check before dispatching
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setImageUploadError("File size exceeds 2MB limit.");
      return;
    }

    // Set a local preview immediately
    setProfile(prev => ({ ...prev, image_url: URL.createObjectURL(file) }));
    setIsImageUploading(true);
    setImageUploadError(null);

    try {
      // Dispatch the uploadImage thunk
      const resultAction = await dispatch(uploadImage(file));

      if (uploadImage.fulfilled.match(resultAction)) {
        setProfile(prev => ({
          ...prev,
          image_url: resultAction.payload.url, // Store the Cloudinary URL
          image_id: resultAction.payload.image_id,
        }));
        console.log('Profile image uploaded to Cloudinary:', resultAction.payload.url);
      } else if (uploadImage.rejected.match(resultAction)) {
        setImageUploadError(resultAction.payload || 'Failed to upload image.');
        setProfile(prev => ({ ...prev, image_url: null })); // Clear URL on error
        console.error('Image upload failed:', resultAction.payload);
      }
    } catch (error) {
      console.error('Unexpected error during profile image upload:', error);
      setImageUploadError('An unexpected error occurred during upload.');
      setProfile(prev => ({ ...prev, image_url: null }));
    } finally {
      setIsImageUploading(false);
    }
  };

  return (
    <div className="manage-account max-w-4xl mx-auto p-6 bg-card text-card-foreground rounded-xl shadow-md">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6">
        {['profile', 'security'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium transition ${activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-primary"
              }`}
            onClick={() => {
              setActiveTab(tab);
              setShowForgetPassword(false);
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileUpdate}
          className="section space-y-5 bg-card dark:bg-gray-900 p-6 rounded-lg shadow-md"
        >
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            {profile.image_url ? (
              <img
                src={profile.image_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border border-border"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
                }}
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center bg-accent text-accent-foreground rounded-full">
                <span>No Image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleProfilePictureChange}
              disabled={isImageUploading}
              className="mt-3 block w-full text-sm text-muted-foreground"
            />
            {isImageUploading && <p className="text-primary mt-2">Uploading...</p>}
            {imageUploadError && <p className="text-destructive mt-2">{imageUploadError}</p>}
          </div>

          {/* Fields */}
          {[
            { label: "Full Name", type: "text", value: profile.fullname, key: "fullname" },
            { label: "Username", type: "text", value: profile.username, key: "username" },
            { label: "Email", type: "email", value: profile.email, key: "email" },
            { label: "Phone Number", type: "tel", value: profile.phone, key: "phone", pattern: "\\+?[0-9]{10,15}" },
            { label: "Age", type: "number", value: profile.age, key: "age" },
            { label: "Bio", type: "text", value: profile.bio, key: "bio" },
          ].map(({ label, type, value, key, pattern }) => (
            <div key={key}>
              <label className="block text-foreground mb-1">{label}</label>
              <input
                type={type}
                value={value}
                onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                pattern={pattern}
                required={key !== "bio"}
                className="w-full px-3 py-2 border rounded-md bg-muted text-foreground border-border focus:ring-2 focus:ring-primary"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading || isImageUploading}
            className="px-6 py-2 item-center rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === "security" && !showForgetPassword && (
        <div className="section space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>

          {/* Password Reset */}
          <div className="space-y-3">
            <button
              className=" px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-colors"
              onClick={() => setShowForgetPassword(true)}
            >
              Reset / Forget Password
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-border space-y-3">
            <button
              className=" px-6 m-2 py-2 bg-destructive text-destructive-foreground font-medium rounded-md hover:opacity-90 transition-colors"
              onClick={() => handleSignOut()}
            >
              Log Out
            </button>
          </div>
        </div>
      )}


      {activeTab === 'security' && showForgetPassword && (
        <ForgetPassword onBack={() => setShowForgetPassword(false)} />
      )}
    </div>

  );
};

export default ManageAccount;
