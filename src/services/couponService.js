// Coupon Service - Isolated API calls for coupon system

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

/**
 * Redeem points for a coupon
 * @param {number} userId - User ID
 * @param {number} brandId - Brand ID
 * @param {number} points - Points to redeem
 * @param {string} rewardTitle - Title of the reward
 */
export const redeemPoints = async (userId, brandId, points, rewardTitle) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/api/coupons/redeem`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            user_id: userId,
            brand_id: brandId,
            points: points,
            reward_title: rewardTitle,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to redeem points");
    }

    return data;
};

/**
 * Validate coupon by QR code scan (Brand side)
 * @param {string} qrToken - QR code token
 * @param {number} brandId - Brand ID performing the scan
 */
export const validateCoupon = async (qrToken, brandId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/api/coupons/scan`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            qr_token: qrToken,
            brand_id: brandId,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to validate coupon");
    }

    return data;
};

/**
 * Get all coupons for a user
 * @param {number} userId - User ID
 */
export const getMyCoupons = async (userId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/api/coupons/my-coupons/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch coupons");
    }

    return data;
};

/**
 * Get all coupons issued by a brand
 * @param {number} brandId - Brand ID
 */
export const getBrandCoupons = async (brandId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/api/coupons/brand-coupons/${brandId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch brand coupons");
    }

    return data;
};

/**
 * Get user's current point balance
 * @param {number} userId - User ID
 */
export const getUserPoints = async (userId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/api/coupons/points/${userId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to fetch points");
    }

    return data;
};

export default {
    redeemPoints,
    validateCoupon,
    getMyCoupons,
    getBrandCoupons,
    getUserPoints,
};
