import React from "react"

export default function StudentDashboard() {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-green-800">Student Dashboard</h2>

      <div className="bg-white shadow rounded-lg mt-6 p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">
          Welcome to Map Reading System
        </h3>
        <p className="text-gray-600">
          Your account is approved. You can now start tests and view modules.
        </p>
      </div>
    </div>
  );
}