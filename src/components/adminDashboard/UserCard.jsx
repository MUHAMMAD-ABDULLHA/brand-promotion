import React from "react";
import "./UserCard.css"
const UserCard = ({ user }) => (
  <div className="user-card">
    <h4>{user.full_name || "Unnamed User"}</h4>
    <p>Email: {user.email}</p>
    <p>Role: {user.role}</p>
    <p>Username: {user.username}</p>
    <p>Phone: {user.phone}</p>
  </div>
);

export default UserCard;
