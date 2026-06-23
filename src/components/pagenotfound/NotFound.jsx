import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="mt-4 text-xl">Oops! Page not found.</p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
