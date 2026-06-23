import React, { useState } from "react";

const Users = ({ users = [], onChangeRole, onUpdate, onDelete, onView }) => {
  const [activeTab, setActiveTab] = useState("active");

  // Split users by account status
  const activeUsers = users.filter((u) => u.account_status === "active");
  const pendingUsers = users.filter((u) => u.account_status === "pending");
  const suspendedUsers = users.filter((u) => u.account_status === "suspended");

  // Helper for rendering user card
  const renderUserCard = (user) => (
    <div
      key={user.id}
      className="p-5 rounded-2xl shadow-sm border border-border bg-card text-card-foreground 
                 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      {/* User Info */}
      <div>
        <h3 className="text-lg font-semibold mb-1">
          {user.full_name || user.username}
        </h3>
        <p className="text-sm text-muted-foreground">📧 {user.email}</p>
        <p className="text-sm text-muted-foreground">👤 Role: {user.role}</p>
        <span
          className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full 
            ${
              user.account_status === "active"
                ? "bg-green-200/80 text-green-900 dark:bg-green-900/50 dark:text-green-300"
                : user.account_status === "pending"
                ? "bg-yellow-200/80 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-300"
                : "bg-red-200/80 text-red-900 dark:bg-red-900/50 dark:text-red-300"
            }`}
        >
          {user.account_status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button
          className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground 
                     hover:opacity-90 transition-colors"
          onClick={() => onChangeRole(user)}
        >
          🔄 Change Role
        </button>
        <button
          className="px-3 py-1.5 text-xs rounded-lg bg-blue-500 text-white hover:opacity-90 transition-colors"
          onClick={() => onUpdate(user)}
        >
          ✏️ Update
        </button>
        <button
          className="px-3 py-1.5 text-xs rounded-lg bg-muted text-muted-foreground hover:opacity-90 transition-colors"
          onClick={() => onView(user)}
        >
          👁️ View
        </button>
        <button
          className="px-3 py-1.5 text-xs rounded-lg bg-destructive text-white hover:opacity-90 transition-colors"
          onClick={() => onDelete(user)}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">👥 All Users</h2>

      {/* Tabs for status */}
      <div className="flex gap-6 border-b border-border mb-8">
        {["active", "pending", "suspended"].map((tab) => (
          <button
            key={tab}
            className={`pb-2 font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "active" && "✅ Active"}
            {tab === "pending" && "⏳ Pending"}
            {tab === "suspended" && "🚫 Suspended"}
          </button>
        ))}
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "active" &&
          (activeUsers.length > 0 ? (
            activeUsers.map(renderUserCard)
          ) : (
            <p className="col-span-3 text-muted-foreground text-center py-6">
              No active users found.
            </p>
          ))}

        {activeTab === "pending" &&
          (pendingUsers.length > 0 ? (
            pendingUsers.map(renderUserCard)
          ) : (
            <p className="col-span-3 text-muted-foreground text-center py-6">
              No pending users found.
            </p>
          ))}

        {activeTab === "suspended" &&
          (suspendedUsers.length > 0 ? (
            suspendedUsers.map(renderUserCard)
          ) : (
            <p className="col-span-3 text-muted-foreground text-center py-6">
              No suspended users found.
            </p>
          ))}
      </div>
    </section>
  );
};

export default Users;
