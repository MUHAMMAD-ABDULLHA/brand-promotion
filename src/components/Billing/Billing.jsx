import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getUserPlan,
  getUserTransactions,
  createCheckoutSession,
  cancelPlan,
} from "../../slice/billingSlice";
import {
  Check,
  CreditCard,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  ShieldAlert,
  Loader2,
} from "lucide-react";

const Billing = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.user);
  const currentUserID = user?.id;

  // 1. ACCESS ROOT BILLING SLICE
  const billingState = useSelector((state) => state.billing);

  // 2. DERIVE DATA BASED ON YOUR STRUCTURE (billing.currentPlan.plan)
  // The image shows 'currentPlan' contains 'plan', 'loading', 'success'
  const currentSubscription = billingState.currentPlan?.plan || null;
  const planLoading = billingState.currentPlan?.loading || false;

  // The image shows 'transactions' contains a 'transactions' array
  const transactionList = billingState.transactions || [];
  const txLoading = billingState.transactions?.loading || false;

  const [processing, setProcessing] = useState(false);

  // 🛠️ LOGS FOR DEBUGGING
  console.log("--- BILLING DEBUG ---");
  console.log("Redux Billing State:", billingState);
  console.log("Current User ID:", currentUserID);
  console.log("Extracted Active Plan:", currentSubscription);
  console.log("Extracted Transactions List:", transactionList);
  console.log("---------------------");

  // Plan Definitions
  const MONTHLY_PRICE = 2000; // $20.00
  const ANNUAL_PRICE = 20000; // $200.00

  const plans = [
    {
      id: "monthly",
      plan_type: "Monthly Plan", // Matches DB 'plan_type'
      basePrice: MONTHLY_PRICE,
      features: [
        "10 campaigns",
        "10 ads per campaign",
        "3 AR ads",
        "Standard Support",
      ],
    },
    {
      id: "annual",
      plan_type: "Annual Plan", // Matches DB 'plan_type'
      basePrice: ANNUAL_PRICE,
      features: [
        "10 campaigns",
        "10 ads per campaign",
        "4 AR ads",
        "Priority Support",
        "Save $40/year",
      ],
      isPopular: true,
    },
  ];

  // 🔄 Initial Data Fetch
  useEffect(() => {
    if (currentUserID) {
      dispatch(getUserPlan(currentUserID));
      dispatch(getUserTransactions(currentUserID));
    }
  }, [dispatch, currentUserID]);

  // 💳 Handle Subscription / Upgrade Logic
  const handleCheckout = async (targetPlan) => {
    if (!currentUserID) return;

    // Logic: Check against currentSubscription.plan_type
    const isCurrentPlan = currentSubscription?.plan_type === targetPlan.plan_type;
    const isAnnualActive = currentSubscription?.plan_type === "Annual Plan";
    const targetIsMonthly = targetPlan.plan_type === "Monthly Plan";

    if (isCurrentPlan) {
      alert("You are already subscribed to this plan.");
      return;
    }

    if (isAnnualActive && targetIsMonthly) {
      alert(
        "You cannot downgrade to the Monthly plan while the Annual plan is active. Please cancel your current subscription first."
      );
      return;
    }

    // Calculate Proration / Upgrade Price
    let finalPrice = targetPlan.basePrice;
    let isUpgrade = false;

    // If upgrading from Monthly to Annual
    if (
      currentSubscription?.plan_type === "Monthly Plan" &&
      targetPlan.plan_type === "Annual Plan"
    ) {
      finalPrice = ANNUAL_PRICE - MONTHLY_PRICE; // $180.00 difference
      isUpgrade = true;
    }

    setProcessing(true);

    try {
      const resultAction = await dispatch(
        createCheckoutSession({
          user_id: currentUserID,
          plan_name: targetPlan.plan_type,
          price: finalPrice,
          is_upgrade: isUpgrade,
        })
      );

      if (createCheckoutSession.fulfilled.match(resultAction)) {
        const url = resultAction.payload.url;
        const newTab = window.open('', '_blank');
        if (url) {
          newTab.location.href = url;
        } else {
          alert("Session created but no URL returned.");
        }
      } else {
        alert(resultAction.payload || "Failed to initiate checkout.");
      }
    } catch (error) {
      console.error("Checkout dispatch error:", error);
      alert("An unexpected error occurred.");
    } finally {
      setProcessing(false);
    }
  };

  // 🚫 Handle Cancellation
  const handleCancelPlan = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel? You will lose access at the end of the billing period."
      )
    )
      return;

    setProcessing(true);
    try {
      const resultAction = await dispatch(cancelPlan(currentUserID));
      if (cancelPlan.fulfilled.match(resultAction)) {
        alert("Plan cancelled successfully.");
        dispatch(getUserPlan(currentUserID));
      } else {
        alert(resultAction.payload || "Failed to cancel plan.");
      }
    } catch (error) {
      console.error("Cancel error", error);
    } finally {
      setProcessing(false);
    }
  };

  // Loader State
  if ((planLoading || txLoading) && !currentSubscription) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading Billing Details...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-foreground bg-background min-h-screen">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your plan and view your transaction history.
        </p>
      </div>

      {/* 📦 Plans Section */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {plans.map((plan) => {
          // Logic to check active state using currentSubscription
          const isCurrentPlan = currentSubscription?.plan_type === plan.plan_type;
          const isActiveAnnual = currentSubscription?.plan_type === "Annual Plan";
          const isDowngrade = isActiveAnnual && plan.plan_type === "Monthly Plan";

          const isUpgradeAvailable =
            currentSubscription?.plan_type === "Monthly Plan" &&
            plan.plan_type === "Annual Plan";
          const displayPrice = isUpgradeAvailable
            ? plan.basePrice - MONTHLY_PRICE
            : plan.basePrice;

          return (
            <div
              key={plan.id}
              className={`
                relative rounded-xl p-8 border transition-all duration-300 flex flex-col bg-card shadow-sm
                ${
                  isCurrentPlan
                    ? `border-primary ring-1 ring-primary`
                    : `border-border hover:border-primary/50`
                }
                ${isDowngrade ? "opacity-70 grayscale-[0.5]" : ""}
              `}
            >
              {plan.isPopular && !isCurrentPlan && (
                <span className="absolute -top-3 right-8 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  BEST VALUE
                </span>
              )}

              {isCurrentPlan && (
                <span className="absolute -top-3 left-8 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Check size={12} /> CURRENT PLAN
                </span>
              )}

              <h3 className="text-xl font-bold text-card-foreground mb-2">
                {plan.plan_type}
              </h3>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">
                  ${(displayPrice / 100).toFixed(0)}
                </span>
                <span className="text-muted-foreground font-medium text-sm ml-1">
                  {isUpgradeAvailable
                    ? "/ upgrade difference"
                    : plan.id === "monthly"
                    ? "/ month"
                    : "/ year"}
                </span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-muted-foreground text-sm"
                  >
                    <div className="bg-primary/10 rounded-full p-1 text-primary">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={isCurrentPlan || processing || isDowngrade}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center gap-2 text-sm
                  ${
                    isCurrentPlan
                      ? "bg-muted text-muted-foreground cursor-default border border-border"
                      : isDowngrade
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
                  }
                `}
              >
                {processing && !isCurrentPlan && !isDowngrade ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : isCurrentPlan ? (
                  <>
                    Active <Check size={18} />
                  </>
                ) : isUpgradeAvailable ? (
                  <>
                    Upgrade Plan <ArrowUpCircle size={18} />
                  </>
                ) : isDowngrade ? (
                  <>Not Available (Downgrade)</>
                ) : (
                  `Subscribe ${
                    plan.id === "monthly" ? "Monthly" : "Annually"
                  }`
                )}
              </button>

              {isDowngrade && (
                <p className="text-xs text-center mt-3 text-destructive flex items-center justify-center gap-1">
                  <ShieldAlert size={12} /> Cancel annual plan to switch
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ⚙️ Manage Current Subscription */}
      {currentSubscription && (
        <div className="mb-16 bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-card-foreground flex items-center gap-2">
              <CreditCard size={20} className="text-primary" />
              Current Subscription Status
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You are currently subscribed to the{" "}
              <span className="font-semibold text-foreground">
                {currentSubscription.plan_type}
              </span>
              .
            </p>
          </div>
          <button
            onClick={handleCancelPlan}
            disabled={processing}
            className="text-destructive hover:bg-destructive/10 border border-destructive/20 font-medium px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            {processing ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            Cancel Subscription
          </button>
        </div>
      )}

      {/* 📜 Transaction History */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
          <Clock className="text-muted-foreground" /> Transaction History
        </h2>

        <div className="space-y-4">
          {transactionList && transactionList.length > 0 ? (
            transactionList.map((tx) => (
              <div
                key={tx.id || Math.random()}
                className="bg-card border border-border rounded-lg p-4 shadow-sm hover:border-primary/30 transition-colors flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div
                    className={`p-3 rounded-full ${
                      tx.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.status === "completed" ? (
                      <Check size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-card-foreground">
                      {tx.status === "completed"
                        ? "Payment Successful"
                        : "Payment Failed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Date N/A"}
                    </p>
                  </div>
                </div>

                {/* Middle: Card Info */}
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <CreditCard size={16} />
                  <span>
                    •••• {tx.masked_card_details || "Card"}
                  </span>
                </div>

                {/* Right: Amount */}
                <div className="font-bold text-lg text-foreground">
                  ${(tx.amount).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border text-muted-foreground">
              <CreditCard className="mx-auto mb-2 opacity-50" size={32} />
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;