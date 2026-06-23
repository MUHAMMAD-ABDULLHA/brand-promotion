import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import QRCode from "react-qr-code";
import { getMyCoupons } from "../../services/couponService";
import { Ticket, RefreshCw, CheckCircle, Clock, X, Gift } from "lucide-react";

const CouponWallet = () => {
    const user = useSelector((state) => state.user.user);
    const userId = user?.id;

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const fetchCoupons = async () => {
        if (!userId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await getMyCoupons(userId);
            setCoupons(response.coupons || []);
        } catch (err) {
            setError(err.message || "Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, [userId]);

    const activeCoupons = coupons.filter((c) => c.status === "ACTIVE");
    const redeemedCoupons = coupons.filter((c) => c.status === "REDEEMED");

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                <span className="text-sm">Loading your coupons...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 p-8">
                <p className="font-medium">{error}</p>
                <button
                    onClick={fetchCoupons}
                    className="flex items-center gap-2 px-4 py-2 bg-destructive text-white rounded-lg hover:opacity-90"
                >
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Ticket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">My Coupons</h2>
                        <p className="text-sm text-muted-foreground">
                            {activeCoupons.length} active, {redeemedCoupons.length} used
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchCoupons}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-all text-sm"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* No coupons */}
            {coupons.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground bg-card rounded-xl border border-dashed border-border">
                    <div className="bg-secondary p-4 rounded-full">
                        <Gift className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-foreground">No Coupons Yet</h3>
                        <p className="text-sm max-w-xs mx-auto opacity-70">
                            Redeem your points for rewards to get coupons here!
                        </p>
                    </div>
                </div>
            )}

            {/* Active Coupons */}
            {activeCoupons.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                        <Clock size={18} className="text-green-500" />
                        Active Coupons
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeCoupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                onClick={() => setSelectedCoupon(coupon)}
                                className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                            {coupon.reward_title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Created: {new Date(coupon.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                        Active
                                    </span>
                                </div>
                                <p className="text-sm text-primary mt-3 font-medium">
                                    Tap to show QR code →
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Redeemed Coupons */}
            {redeemedCoupons.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                        <CheckCircle size={18} className="text-muted-foreground" />
                        Used Coupons
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {redeemedCoupons.map((coupon) => (
                            <div
                                key={coupon.id}
                                className="bg-secondary/50 border border-border rounded-xl p-4 opacity-70"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-foreground line-through">
                                            {coupon.reward_title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Redeemed: {coupon.redeemed_at ? new Date(coupon.redeemed_at).toLocaleDateString() : "N/A"}
                                        </p>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-medium bg-secondary text-muted-foreground rounded-full">
                                        Used
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {selectedCoupon && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedCoupon(null)}
                >
                    <div
                        className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-foreground">Your Coupon</h3>
                            <button
                                onClick={() => setSelectedCoupon(null)}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                            >
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl flex items-center justify-center">
                            <QRCode
                                value={selectedCoupon.qr_code_token}
                                size={200}
                                level="H"
                            />
                        </div>

                        <div className="mt-4 text-center">
                            <h4 className="font-semibold text-foreground text-lg">
                                {selectedCoupon.reward_title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                Show this QR code to the brand to redeem your reward
                            </p>

                            {/* Coupon Code - copyable */}
                            <div className="mt-4 p-3 bg-secondary rounded-lg border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Coupon Code (share with brand if QR doesn't scan)</p>
                                <div className="flex items-center justify-center gap-2">
                                    <code className="text-sm font-mono font-bold text-primary break-all">
                                        {selectedCoupon.qr_code_token}
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(selectedCoupon.qr_code_token);
                                            alert("Code copied!");
                                        }}
                                        className="p-1.5 bg-primary/10 hover:bg-primary/20 rounded text-primary text-xs font-medium transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponWallet;
