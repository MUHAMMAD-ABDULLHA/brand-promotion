package models

import (
	"time"
	"vite-project/backend/config"
)

type Plan struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	UserID    int       `json:"user_id"`
	PlanType  string    `json:"plan_type"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Create default plan when brand registers
func CreateDefaultPlan(userID int) error {
	query := `INSERT INTO plans (user_id, plan_type, status, created_at, updated_at)
			  VALUES ($1, 'standard', 'active', NOW(), NOW())`
	_, err := config.DB.Exec(query, userID)
	return err
}

// Upgrade plan (triggered via Stripe webhook or manual admin action)
func UpgradePlan(userID int, newPlan string) error {
	query := `UPDATE plans SET plan_type=$1, status='active', updated_at=$2 WHERE user_id=$3`
	_, err := config.DB.Exec(query, newPlan, time.Now(), userID)
	return err
}

// Cancel plan -> revert to default
func CancelPlan(userID int) error {
	query := `UPDATE plans SET plan_type='standard', status='active', updated_at=$1 WHERE user_id=$2`
	_, err := config.DB.Exec(query, time.Now(), userID)
	return err
}

// Fetch current plan for user
func GetPlanByUserID(userID int) (*Plan, error) {
	var plan Plan
	query := `SELECT id, user_id, plan_type, status, created_at, updated_at FROM plans WHERE user_id=$1`
	err := config.DB.QueryRow(query, userID).Scan(
		&plan.ID, &plan.UserID, &plan.PlanType, &plan.Status, &plan.CreatedAt, &plan.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &plan, nil
}
