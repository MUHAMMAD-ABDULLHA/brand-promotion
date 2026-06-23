package models

import (
	"log"
	"time"
	"vite-project/backend/config"
)

type Transaction struct {
	ID                int       `json:"id" gorm:"primaryKey;autoIncrement"`
	UserID            int       `json:"user_id"`
	PaymentToken      string    `json:"payment_token"`       // Secure, single-use token from Masterpass
	MaskedCardDetails string    `json:"masked_card_details"` // Non-sensitive details for user display (e.g., 'Mastercard ending in 1234')
	Amount            float64   `json:"amount"`
	Status            string    `json:"status"`
	CreatedAt         time.Time `json:"created_at"`
}

// CreateTransaction inserts a new transaction record
// NOTE: This function is now using the secure fields (payment_token, masked_card_details)
func CreateTransaction(t *Transaction) error {
	query := `INSERT INTO transactions (user_id, payment_token, masked_card_details, amount, status, created_at)
			  VALUES ($1, $2, $3, $4, $5, $6)`

	// Assuming config.DB.Exec uses positional arguments ($1, $2, etc.) for PostgreSQL/MySQL
	_, err := config.DB.Exec(query, t.UserID, t.PaymentToken, t.MaskedCardDetails, t.Amount, t.Status, time.Now())
	return err
}

func GetTransactionsByUser(userID int) ([]Transaction, error) {
	log.Printf("🔍 [DB] Fetching transactions for user_id: %d", userID)

	query := `SELECT id, user_id, payment_token, masked_card_details, amount, status, created_at 
			  FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		log.Printf("❌ [DB ERROR] Query execution failed for user_id %d: %v", userID, err)
		return nil, err
	}
	defer func() {
		if cerr := rows.Close(); cerr != nil {
			log.Printf("⚠️ [DB WARN] Error closing rows for user_id %d: %v", userID, cerr)
		}
	}()

	var transactions []Transaction
	count := 0

	for rows.Next() {
		var t Transaction
		if err := rows.Scan(&t.ID, &t.UserID, &t.PaymentToken, &t.MaskedCardDetails, &t.Amount, &t.Status, &t.CreatedAt); err != nil {
			log.Printf("❌ [DB ERROR] Scan failed for user_id %d: %v", userID, err)
			return nil, err
		}
		transactions = append(transactions, t)
		count++
	}

	if err := rows.Err(); err != nil {
		log.Printf("⚠️ [DB WARN] Iteration error for user_id %d: %v", userID, err)
	}

	log.Printf("✅ [DB] Retrieved %d transactions for user_id: %d", count, userID)
	return transactions, nil
}
