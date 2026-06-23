import React from 'react';
import { XCircle, X } from 'lucide-react';

const PaymentCancel = () => {

  const handleClose = () => {
    // This works because the window was opened via a script (window.open)
    window.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center transform transition-all hover:scale-105 duration-300">
        
        {/* Cancel Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-3 animate-pulse">
            <XCircle className="w-16 h-16 text-red-600" strokeWidth={2} />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        
        {/* Subtext */}
        <p className="text-gray-500 mb-8 text-lg">
          You have not been charged. The transaction was cancelled before completion.
        </p>

        {/* Instructions */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 text-sm text-red-800">
          <p className="font-medium">
            No changes were made to your account.
          </p>
          <p>You can safely close this window and try again if you wish.</p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-xl"
        >
          <X className="w-5 h-5" />
          Close this Tab
        </button>
      </div>
      
      <footer className="mt-8 text-gray-400 text-sm">
        If this was a mistake, please try your purchase again.
      </footer>
    </div>
  );
};

export default PaymentCancel;