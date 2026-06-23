// src/components/gamification/EditGamificationForm.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateGamification } from "../../redux/gamificationSlice"; // Assuming the path is correct

// Assuming you pass the gamification item, brandId, and a close function
const EditGamificationForm = ({ gamificationItem, brandId, onClose }) => {
  const dispatch = useDispatch();
  
  // Initialize form state with current item data, using optional chaining
  const [formData, setFormData] = useState({
    description: gamificationItem?.description || "",
    points: gamificationItem?.points || 0,
    media_url: gamificationItem?.media_url || "",
    expire_date: gamificationItem?.expire_date?.split('T')[0] || "", // Format date for input type="date"
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Dispatch the update thunk
    dispatch(updateGamification({ 
      id: gamificationItem.id, 
      brandId: brandId, // This must be passed from the parent component
      updatedData: formData 
    }))
    .unwrap()
    .then(() => {
      // Success: Close the form/modal
      onClose();
    })
    .catch((error) => {
      // Error handling is managed by the Redux thunk (with toast), but can be handled here too
      console.error("Form submission failed:", error);
    });
  };

  return (
    <div 
      className="p-6 rounded-xl border" 
      style={{ 
        backgroundColor: 'var(--card)', 
        color: 'var(--card-foreground)', 
        borderColor: 'var(--border)' 
      }}
    >
      <h2 className="text-xl font-bold mb-4">Edit Gamification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>Description</label>
          <input
            id="description"
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full mt-1 p-2 border rounded-lg"
            style={{ 
              borderColor: 'var(--input)', 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        {/* Points Field */}
        <div>
          <label htmlFor="points" className="block text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>Points Awarded</label>
          <input
            id="points"
            type="number"
            name="points"
            value={formData.points}
            onChange={handleChange}
            required
            min="1"
            className="w-full mt-1 p-2 border rounded-lg"
            style={{ 
              borderColor: 'var(--input)', 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        {/* Expiration Date Field */}
        <div>
          <label htmlFor="expire_date" className="block text-sm font-medium" style={{ color: 'var(--card-foreground)' }}>Expiration Date</label>
          <input
            id="expire_date"
            type="date"
            name="expire_date"
            value={formData.expire_date}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg"
            style={{ 
              borderColor: 'var(--input)', 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition"
            style={{ 
              backgroundColor: 'var(--secondary)', 
              color: 'var(--secondary-foreground)' 
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg transition hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--primary)', 
              color: 'var(--primary-foreground)' 
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditGamificationForm;