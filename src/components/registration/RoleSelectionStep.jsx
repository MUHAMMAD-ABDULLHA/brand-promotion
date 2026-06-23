import React from 'react';
import { Users, Megaphone, Briefcase } from 'lucide-react';

const availableRoles = [
  {
    value: 'brand',
    label: 'Brand / Business',
    description: 'Launch campaigns and manage ads',
    icon: <Briefcase size={24} />,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
  {
    value: 'influencer',
    label: 'Influencer',
    description: 'Partner with brands and create content',
    icon: <Megaphone size={24} />,
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  {
    value: 'user',
    label: 'User',
    description: 'Engage with ads and earn rewards',
    icon: <Users size={24} />,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
];

const RoleSelectionStep = ({ role, setRole, handleStepOneSubmit }) => {
  return (
    <form onSubmit={handleStepOneSubmit} className="flex flex-col">
      <div className="space-y-3 mb-6">
        {availableRoles.map((r) => (
          <label
            key={r.value}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${role === r.value
                ? 'border-[#4E7A51] bg-[#4E7A51]/5'
                : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
          >
            <input
              type="radio"
              name="role"
              value={r.value}
              onChange={(e) => setRole(e.target.value)}
              checked={role === r.value}
              className="hidden"
            />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors"
              style={{
                backgroundColor: role === r.value ? r.bgColor : '#f3f4f6',
                color: role === r.value ? r.color : '#9ca3af'
              }}
            >
              {r.icon}
            </div>
            <div className="flex-1">
              <span className="block text-base font-semibold text-gray-900">
                {r.label}
              </span>
              <span className="block text-sm text-gray-500">
                {r.description}
              </span>
            </div>
            <div
              className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center ${role === r.value
                  ? 'border-[#4E7A51] bg-[#4E7A51]'
                  : 'border-gray-300'
                }`}
            >
              {role === r.value && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </label>
        ))}
      </div>
      <button
        type="submit"
        className="w-full py-4 px-4 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: role ? 'linear-gradient(135deg, #4E7A51 0%, #52aa78 100%)' : '#d1d5db',
          boxShadow: role ? '0 4px 15px rgba(78, 122, 81, 0.3)' : 'none'
        }}
        disabled={!role}
      >
        Continue
      </button>
    </form>
  );
};

export default RoleSelectionStep;