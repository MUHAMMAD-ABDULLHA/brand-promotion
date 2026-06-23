import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Person,
  Email,
  Lock,
  Business,
  Link,
  People,
  Tag,
  Image as ImageIcon,
  LocationOn,
} from '@mui/icons-material';
import { uploadImage } from '../../slice/userSlice';
import Select from 'react-select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const socialMediaOptions = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Twitter', label: 'Twitter' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Other', label: 'Other' },
];

const pakistanCities = [
  { value: 'Islamabad', label: 'Islamabad' },
  { value: 'Karachi', label: 'Karachi' },
  { value: 'Lahore', label: 'Lahore' },
  { value: 'Rawalpindi', label: 'Rawalpindi' },
  { value: 'Faisalabad', label: 'Faisalabad' },
  { value: 'Multan', label: 'Multan' },
  { value: 'Peshawar', label: 'Peshawar' },
  { value: 'Quetta', label: 'Quetta' },
  { value: 'Sialkot', label: 'Sialkot' },
  { value: 'Gujranwala', label: 'Gujranwala' },
  { value: 'Hyderabad', label: 'Hyderabad' },
];

// Custom styles for React Select to use Tailwind Variables
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    paddingLeft: '38px',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderColor: state.isFocused ? 'var(--ring)' : 'var(--input)',
    borderWidth: '1px',
    backgroundColor: 'var(--background)',
    minHeight: '42px',
    boxShadow: state.isFocused ? '0 0 0 1px var(--ring)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--ring)' : 'var(--border)',
    },
    transition: 'all 0.2s',
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
    paddingLeft: '4px',
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--foreground)',
    paddingLeft: '4px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? 'var(--primary)'
      : state.isFocused
      ? 'var(--muted)' // This replaces the default blue hover
      : 'var(--card)',
    color: state.isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'var(--card)',
    borderRadius: 'var(--radius)',
    zIndex: 999,
    border: '1px solid var(--border)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }),
  input: (base) => ({
    ...base,
    color: 'var(--foreground)',
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: 'var(--border)',
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: 'var(--muted-foreground)',
    '&:hover': {
      color: 'var(--foreground)',
    },
  }),
};

const RegistrationDetailsStep = ({ role, formData, setFormData, handleSubmit }) => {
  const dispatch = useDispatch();
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // State for react-select components to manage their own display value object
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handler for City Select
  const handleCityChange = (selectedOption) => {
    setSelectedCity(selectedOption);
    setFormData({
      ...formData,
      location: selectedOption ? selectedOption.value : '',
    });
  };

  // Handler for Social Media Select
  const handleSocialMediaChange = (selectedOption) => {
    setSelectedSocialMedia(selectedOption);
    setFormData({
      ...formData,
      social_media: selectedOption ? selectedOption.value : '',
    });
  };

  const handlePhoneInputChange = (phone) => {
    setFormData({
      ...formData,
      phone: phone,
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData({ ...formData, image_url: '' });
      setImagePreview(null);
      setUploadError(null);
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setUploadError(null);

    try {
      const resultAction = await dispatch(uploadImage(file));
      if (uploadImage.fulfilled.match(resultAction)) {
        setFormData({
          ...formData,
          image_url: resultAction.payload.url,
          image_id: resultAction.payload.image_id,
        });
      } else if (uploadImage.rejected.match(resultAction)) {
        setUploadError(resultAction.payload || 'Failed to upload image.');
        setFormData({ ...formData, image_url: '' });
        setImagePreview(null);
      }
    } catch (error) {
      setUploadError('An unexpected error occurred.',error);
      setFormData({ ...formData, image_url: '' });
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Common input class using Tailwind variables
  const inputClasses = "w-full pl-12 pr-4 py-2.5 text-sm bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring placeholder:text-muted-foreground transition-all duration-200";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
      <h3 className="text-xl font-semibold text-foreground mb-2">
        Account Information
      </h3>

      {/* Profile Image Upload */}
      <div className="mb-4">
        <label htmlFor="profile-image-upload" className="block text-sm font-medium text-foreground mb-2">
          Profile Image (optional)
        </label>
        <div className="relative flex items-center">
          <ImageIcon className="absolute left-3 text-muted-foreground" />
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className={`${inputClasses} cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-muted`}
          />
        </div>
        {imagePreview && (
          <div className="mt-3 flex items-center space-x-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-border shadow-sm"
            />
            {isUploading && <p className="text-sm text-primary animate-pulse">Uploading...</p>}
            {!isUploading && uploadError && <p className="text-sm text-destructive">Error: {uploadError}</p>}
            {!isUploading && !uploadError && formData.image_url && <p className="text-sm text-primary">Upload complete!</p>}
          </div>
        )}
      </div>

      {/* Common Fields */}
      <div className="relative flex items-center">
        <Person className="absolute left-3 text-muted-foreground" />
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="relative flex items-center">
        <Tag className="absolute left-3 text-muted-foreground" />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      <div className="relative flex items-center">
        <Email className="absolute left-3 text-muted-foreground" />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Phone Number Input */}
      <div>
        <label htmlFor="phone-number" className="block text-sm font-medium text-foreground mb-2">
          Phone Number
        </label>
        <PhoneInput
          country={'pk'}
          value={formData.phone}
          onChange={handlePhoneInputChange}
          inputProps={{
            name: 'phone',
            required: true,
            className: "form-input-phone" 
          }}
          containerStyle={{ 
            width: '100%', 
            borderRadius: 'calc(var(--radius) - 2px)' 
          }}
          inputStyle={{ 
            width: '100%', 
            borderRadius: 'calc(var(--radius) - 2px)', 
            paddingLeft: '50px', 
            height: '42px', 
            borderColor: 'var(--input)', 
            backgroundColor: 'var(--background)',
            fontSize: '0.875rem',
            color: 'var(--foreground)',
            transition: 'all 0.2s'
          }}
          buttonStyle={{ 
            borderTopLeftRadius: 'calc(var(--radius) - 2px)', 
            borderBottomLeftRadius: 'calc(var(--radius) - 2px)', 
            borderColor: 'var(--input)', 
            backgroundColor: 'var(--background)',
            height: '42px',
            borderRight: 'none',
            transition: 'all 0.2s'
          }}
          dropdownStyle={{ 
            borderRadius: 'var(--radius)', 
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            border: '1px solid var(--border)'
          }}
          searchClass="text-sm"
          enableSearch={true}
          autoFormat={true}
        />
      </div>

      <div className="relative flex items-center">
        <Person className="absolute left-3 text-muted-foreground" />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          min="13"
          max="120"
          className={inputClasses}
          required
        />
      </div>

      {/* City Selection */}
      {(role === 'brand' || role === 'influencer') && (
        <div>
          <label htmlFor="city-select" className="block text-sm font-medium text-foreground mb-2">
            Location (City)
          </label>
          <div className="relative">
            <LocationOn className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
            <Select
              id="city-select"
              options={pakistanCities}
              value={selectedCity}
              onChange={handleCityChange}
              placeholder="Select a city"
              className="basic-single"
              classNamePrefix="select"
              styles={customSelectStyles}
            />
          </div>
        </div>
      )}

      <div className="relative flex items-center">
        <Lock className="absolute left-3 text-muted-foreground" />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={inputClasses}
          required
        />
      </div>

      {/* Brand-specific fields */}
      {role === 'brand' && (
        <>
          <div className="relative flex items-center">
            <Business className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="brand_name"
              placeholder="Brand Name"
              value={formData.brand_name}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative flex items-center">
            <Link className="absolute left-3 text-muted-foreground" />
            <input
              type="url"
              name="brand_website"
              placeholder="Brand Website"
              value={formData.brand_website}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative flex items-center">
            <Tag className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="niche"
              placeholder="Brand Niche (e.g., Tech, Fashion)"
              value={formData.niche}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
        </>
      )}

      {/* Influencer-specific fields */}
      {role === 'influencer' && (
        <>
          <div>
            <label htmlFor="social-media-select" className="block text-sm font-medium text-foreground mb-2">
              Social Media Platform
            </label>
            <div className="relative">
              <People className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
              {/* REPLACED Native select with React Select */}
              <Select
                id="social-media-select"
                options={socialMediaOptions}
                value={selectedSocialMedia}
                onChange={handleSocialMediaChange}
                placeholder="Select Social Media"
                className="basic-single"
                classNamePrefix="select"
                styles={customSelectStyles}
              />
            </div>
          </div>

          <div className="relative flex items-center">
            <Link className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="social_media_link"
              placeholder="Social Media Handle/Link"
              value={formData.social_media_link}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div className="relative flex items-center">
            <People className="absolute left-3 text-muted-foreground" />
            <input
              type="number"
              name="followers"
              placeholder="Follower Count"
              value={formData.followers}
              onChange={handleChange}
              min="0"
              className={inputClasses}
              required
            />
          </div>

           <div className="relative flex items-center">
            <Tag className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="niche"
              placeholder="Niche (e.g., Travel, Food)"
              value={formData.niche}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
           <div className="relative flex items-center">
            <Tag className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="pricing"
              placeholder="Pricing (e.g., $50/post)"
              value={formData.pricing}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
           <div className="relative flex items-center">
            <Tag className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="content_type"
              placeholder="Content Type (e.g., Video, Blog)"
              value={formData.content_type}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
           <div className="relative flex items-center">
            <People className="absolute left-3 text-muted-foreground" />
            <input
              type="text"
              name="target_audience"
              placeholder="Target Audience (e.g., Gen Z)"
              value={formData.target_audience}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-3.5 px-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-6"
        disabled={isUploading}
      >
        {isUploading ? 'Uploading Image...' : 'Register'}
      </button>
    </form>
  );
};

export default RegistrationDetailsStep;