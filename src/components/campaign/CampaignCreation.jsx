import React, { useState, useEffect } from 'react';
import { 
  ArrowBack,
  Campaign, 
  Description, 
  Flag,
  CalendarToday,
  Warning
} from '@mui/icons-material';
import { toast, Bounce } from 'react-toastify';

function CampaignCreation({ onCancel, onCreate }) {
  // 1. Simplified State - Only asking for essentials
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objective: '',
    start_date: '',
    end_date: '',
  });

  const objectives = ['Brand Awareness', 'Lead Generation', 'Conversions', 'Other'];
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLimitError, setIsLimitError] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    
    if (!token || !userId) {
      setError('Authentication required. Please log in.');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Authentication required.", { theme: "dark" });
      return;
    }

    setLoading(true);
    setError('');
    setIsLimitError(false);

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    // 2. Construct Payload with Default Values for hidden attributes
    const campaignPayload = {
      brand_user_id: parseInt(userId),
      
      // User Input Data
      name: formData.name,
      description: formData.description,
      objective: formData.objective,
      start_date: formData.start_date,
      end_date: formData.end_date,

      // --- Default values for Database Attributes ---
      overall_budget: 0.00,      // numeric(12,2)
      daily_budget: 0.00,        // numeric(12,2)
      spent_budget: 0.00,        // numeric(15,2)
      
      demographics: 'General Audience', // text default
      
      has_historical: false,     // boolean
      historical_data: '',       // text
      
      key_messages: '',          // text
      cta: 'Learn More',         // varchar(50) - Safe default
      offers: '',                // varchar(255)
      
      enable_ar: false,          // boolean
      enable_voice: false,       // boolean
      multi_step_form: false,    // boolean
      personalized_page: false,  // boolean
      
      status: 'publish',           // varchar(20)
      kpis: []                   // Array for potential JSONB or relation
    };

    try {
      const response = await fetch('http://localhost:8080/brand/campaigns/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(campaignPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle Plan Limits
        if (errorData.code === 'LIMIT_REACHED') {
          setIsLimitError(true);
          setError(errorData.error);
          throw new Error(errorData.error);
        }

        throw new Error(errorData.message || 'Failed to save campaign');
      }

      const data = await response.json();
      onCreate(data);

      // Trigger Notification
      await fetch('http://localhost:8080/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: parseInt(userId),
          type: 'CAMPAIGN_UPDATE',
          title: 'New Campaign Created',
          message: `Your campaign "${formData.name}" has been created successfully.`,
        }),
      });

      toast.success('Campaign created successfully!', {
        position: "top-right",
        theme: "dark",
        transition: Bounce,
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      if (!isLimitError) {
          toast.error(error.message || "Error saving campaign", {
            position: "bottom-left",
            theme: "dark",
            transition: Bounce,
          });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Tailwind Classes for Reusability ---
  const inputClass = "w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground";
  const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none";

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-card">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
          >
            <ArrowBack fontSize="small" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3 text-primary">
             <div className="p-2 bg-secondary rounded-lg">
                <Campaign />
             </div>
             <h1 className="text-xl font-bold text-foreground">New Campaign</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Banner */}
          {isLimitError ? (
            <div className="mb-6 p-4 bg-red-50/50 border border-red-200 rounded-lg flex items-start gap-3">
               <Warning className="text-red-600 mt-0.5" />
               <div>
                 <h3 className="font-semibold text-red-900">Upgrade Required</h3>
                 <p className="text-sm text-red-700 mt-1">{error}</p>
               </div>
            </div>
          ) : error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section: Basic Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/50">
                 <Description className="text-muted-foreground" fontSize="small" />
                 <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                   Campaign Details
                 </h2>
              </div>

              {/* Name */}
              <div>
                <label className={labelClass}>Campaign Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="e.g., Summer Launch 2025"
                  required 
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  placeholder="Briefly describe what this campaign is about..."
                  required 
                  rows={3}
                  disabled={loading}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Objective */}
              <div>
                <label className={labelClass}>Objective</label>
                <div className="relative">
                  <Flag className={iconClass} fontSize="small" />
                  <select 
                    name="objective" 
                    value={formData.objective} 
                    onChange={handleChange} 
                    required
                    disabled={loading}
                    className={`${inputClass} pl-10 appearance-none cursor-pointer`}
                  >
                    <option value="" className="text-muted-foreground">Select Primary Goal</option>
                    {objectives.map((obj) => (
                      <option key={obj} value={obj}>{obj}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <div className="relative">
                    <CalendarToday className={iconClass} fontSize="small" />
                    <input 
                      type="date" 
                      name="start_date" 
                      value={formData.start_date} 
                      onChange={handleChange} 
                      required 
                      disabled={loading}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>End Date</label>
                  <div className="relative">
                    <CalendarToday className={iconClass} fontSize="small" />
                    <input 
                      type="date" 
                      name="end_date" 
                      value={formData.end_date} 
                      onChange={handleChange} 
                      required 
                      disabled={loading}
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-6 border-t border-border">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Initializing...
                  </span>
                ) : (
                  'Create Campaign'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default CampaignCreation;