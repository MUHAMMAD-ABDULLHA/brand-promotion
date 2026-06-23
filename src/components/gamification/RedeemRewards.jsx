import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { redeemPoints, getUserPoints } from "../../services/couponService";
import { Gift, Coins, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Available rewards configuration
// In a production app, this would come from an API
const AVAILABLE_REWARDS = [
    {
        id: 1,
        title: "10% Discount Coupon",
        description: "Get 10% off on your next purchase",
        pointsCost: 50,
        brandId: 1, // This should be dynamic based on your app
    },
    {
        id: 2,
        title: "Free Shipping",
        description: "Free shipping on any order",
        pointsCost: 100,
        brandId: 1,
    },
    {
        id: 3,
        title: "25% Discount Coupon",
        description: "Get 25% off on your next purchase",
        pointsCost: 200,
        brandId: 1,
    },
    {
        id: 4,
        title: "50% Mega Discount",
        description: "Half price on any item!",
        pointsCost: 500,
        brandId: 1,
    },
];

const RedeemRewards = ({ onRedemptionSuccess }) => {
    const user = useSelector((state) => state.user.user);
    const userId = user?.id;

    const [userPoints, setUserPoints] = useState(0);
    const [earnedPoints, setEarnedPoints] = useState(0);
    const [spentPoints, setSpentPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Fetch user's points from API
    useEffect(() => {
        const fetchPoints = async () => {
            if (!userId) return;

            setLoading(true);
            try {
                const data = await getUserPoints(userId);
                setEarnedPoints(data.earned_points || 0);
                setSpentPoints(data.spent_points || 0);
                setUserPoints(data.available_points || 0);
            } catch (err) {
                console.error("Failed to fetch points:", err);
                setError("Failed to load your points. Please refresh.");
            } finally {
                setLoading(false);
            }
        };

        fetchPoints();
    }, [userId]);

    const handleRedeem = async (reward) => {
        if (userPoints < reward.pointsCost) {
            setError(`You need ${reward.pointsCost - userPoints} more points for this reward.`);
            setTimeout(() => setError(null), 3000);
            return;
        }

        setRedeeming(reward.id);
        setError(null);
        setSuccess(null);

        try {
            const response = await redeemPoints(
                userId,
                reward.brandId,
                reward.pointsCost,
                reward.title
            );

            setSuccess({
                message: `Successfully redeemed "${reward.title}"!`,
                coupon: response.coupon,
                remainingPoints: response.remaining_points,
            });

            // Update local points
            setUserPoints(response.remaining_points);
            setSpentPoints(spentPoints + reward.pointsCost);

            // Notify parent component if needed
            if (onRedemptionSuccess) {
                onRedemptionSuccess(response);
            }

            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            setError(err.message || "Failed to redeem reward. Please try again.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setRedeeming(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
                <span className="ml-2 text-[var(--muted-foreground)]">Loading your points...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Points Balance Card */}
            <div className="bg-gradient-to-br from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent border border-[var(--primary)]/20 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Your Points Balance</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-bold text-[var(--primary)]">{userPoints}</span>
                            <span className="text-lg text-[var(--muted-foreground)]">available</span>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-green-600">Earned: {earnedPoints}</span>
                            <span className="text-orange-600">Spent: {spentPoints}</span>
                        </div>
                    </div>
                    <div className="p-4 bg-[var(--primary)]/10 rounded-full">
                        <Coins className="h-8 w-8 text-[var(--primary)]" />
                    </div>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] mt-3">
                    Earn more points by interacting with brand campaigns!
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-green-800">{success.message}</p>
                        <p className="text-sm text-green-600 mt-1">
                            Check your "My Coupons" tab to view your QR code!
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <p className="font-medium text-red-800">{error}</p>
                </div>
            )}

            {/* Available Rewards Grid */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-[var(--primary)]" />
                    Available Rewards
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_REWARDS.map((reward) => {
                        const canAfford = userPoints >= reward.pointsCost;
                        const isRedeeming = redeeming === reward.id;

                        return (
                            <div
                                key={reward.id}
                                className={`
                  relative bg-[var(--card)] border rounded-xl p-5 transition-all
                  ${canAfford
                                        ? "border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-md"
                                        : "border-[var(--border)]/50 opacity-60"
                                    }
                `}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-[var(--foreground)]">{reward.title}</h4>
                                        <p className="text-sm text-[var(--muted-foreground)] mt-1">{reward.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-1.5">
                                        <Coins className="h-4 w-4 text-amber-500" />
                                        <span className="font-bold text-lg">{reward.pointsCost}</span>
                                        <span className="text-sm text-[var(--muted-foreground)]">points</span>
                                    </div>

                                    <button
                                        onClick={() => handleRedeem(reward)}
                                        disabled={!canAfford || isRedeeming}
                                        className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                      ${canAfford
                                                ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 hover:shadow-sm"
                                                : "bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-not-allowed"
                                            }
                    `}
                                    >
                                        {isRedeeming ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Redeeming...
                                            </>
                                        ) : canAfford ? (
                                            "Redeem"
                                        ) : (
                                            `Need ${reward.pointsCost - userPoints} more`
                                        )}
                                    </button>
                                </div>

                                {/* Progress indicator for unaffordable rewards */}
                                {!canAfford && (
                                    <div className="mt-3">
                                        <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[var(--primary)]/50 rounded-full transition-all"
                                                style={{ width: `${Math.min((userPoints / reward.pointsCost) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                            {Math.round((userPoints / reward.pointsCost) * 100)}% progress
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* How it works */}
            <div className="bg-[var(--secondary)]/50 rounded-xl p-5 mt-6">
                <h4 className="font-semibold mb-3">How Points Are Earned</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
                        <span className="font-bold text-[var(--primary)]">+5</span> points for clicking ads
                    </div>
                    <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
                        <span className="font-bold text-[var(--primary)]">+10</span> points for sharing
                    </div>
                    <div className="bg-[var(--card)] p-3 rounded-lg border border-[var(--border)]">
                        <span className="font-bold text-[var(--primary)]">+15</span> points for likes/engagement
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RedeemRewards;
