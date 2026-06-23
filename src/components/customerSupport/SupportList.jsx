import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSupportByUser } from "../../slice/supportSlice";
import SupportForm from "./SupportForm";
import SupportCard from "./SupportCard";
import { Plus, X, MessageSquare, Loader2 } from "lucide-react";

const UserSupportList = () => {
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.user?.user?.id);
  const { userSupports, loading } = useSelector((state) => state.support);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (userId) {
      dispatch(getSupportByUser(userId));
    }
  }, [dispatch, userId]);

  const handleRefresh = () => {
    dispatch(getSupportByUser(userId));
    setShowForm(false);
  };

  return (
    <div className="p-4 md:p-6 bg-background min-h-screen">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            My Support Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
            Submit and track your support tickets
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm text-sm sm:text-base ${showForm
              ? "bg-muted text-muted-foreground hover:bg-muted/80"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              <span className="hidden xs:inline">Cancel</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>New Request</span>
            </>
          )}
        </button>
      </div>

      {/* Support Form Section */}
      {showForm && (
        <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
          <SupportForm userId={userId} onSuccess={handleRefresh} />
        </div>
      )}

      {/* List Display Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-muted-foreground">Loading support requests...</p>
        </div>
      ) : userSupports?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl border border-border">
          <div className="p-4 bg-muted/50 rounded-full mb-4">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No support requests yet
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Need help? Submit a new support request and we'll get back to you.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition"
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {userSupports.map((support) => (
            <SupportCard key={support.id} support={support} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSupportList;