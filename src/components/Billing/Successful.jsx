import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserPlan, getUserTransactions } from '../../slice/billingSlice';
import { CheckCircle, X } from 'lucide-react';

const PaymentSuccess = () => {
  const dispatch = useDispatch();
  
  // Select actual user ID from Redux
  const user = useSelector((state) => state.user?.user);
  const currentUserID = user?.id;

  useEffect(() => {
    // Trigger the actual API calls to update the state
    if (currentUserID) {
      dispatch(getUserPlan(currentUserID));
      dispatch(getUserTransactions(currentUserID));
    }
  }, [dispatch, currentUserID]);

  const handleClose = () => {
    // This works because the window was opened via a script (window.open)
    window.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center transform transition-all hover:scale-105 duration-300">
        
        {/* Success Icon Animation */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={2} />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        
        {/* Subtext */}
        <p className="text-gray-500 mb-8 text-lg">
          Thank you for your purchase. Your transaction was completed successfully.
        </p>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8 text-sm text-blue-800">
          <p className="font-medium">
            Your account has been upgraded in the original tab.
          </p>
          <p>You can safely close this window now.</p>
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
        Secure payment processed by Stripe
      </footer>
    </div>
  );
};

export default PaymentSuccess;