import React, { useState } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

const CampaignEdit = ({ campaign, onSave, onCancel }) => {
  const [form, setForm] = useState({ ...campaign });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  // Input classes for consistent styling
  const inputClass = `
    w-full px-4 py-3 
    bg-background border border-border rounded-lg 
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition
  `;

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Cancel"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Edit Campaign</h2>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-card text-card-foreground rounded-xl shadow-sm border border-border overflow-hidden"
      >
        <div className="p-4 md:p-6 space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass}>Campaign Name</label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              required
              placeholder="Enter campaign name"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe your campaign..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Objective */}
          <div>
            <label className={labelClass}>Objective</label>
            <select
              name="objective"
              value={form.objective || ""}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">Select Objective</option>
              <option value="Brand Awareness">Brand Awareness</option>
              <option value="Lead Generation">Lead Generation</option>
              <option value="Conversions">Conversions</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Budget Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Overall Budget ($)</label>
              <input
                type="number"
                name="overall_budget"
                value={form.overall_budget || ""}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Daily Budget ($)</label>
              <input
                type="number"
                name="daily_budget"
                value={form.daily_budget || ""}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={inputClass}
              />
            </div>
          </div>

          {/* Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={form.start_date || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                name="end_date"
                value={form.end_date || ""}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <select
              name="status"
              value={form.status || ""}
              onChange={handleChange}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="publish">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 md:p-6 bg-muted/30 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background hover:bg-muted transition text-sm font-medium order-2 sm:order-1"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-medium order-1 sm:order-2"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignEdit;
