package models

import (
	"time"
)

type NotificationSettings struct {
	UserID             int       `json:"user_id" db:"user_id"`
	EmailNotifications bool      `json:"email_notifications" db:"email_notifications" gorm:"not null;default:false"`
	PushNotifications  bool      `json:"push_notifications" db:"push_notifications" gorm:"not null;default:false"`
	SmsNotifications   bool      `json:"sms_notifications" db:"sms_notifications" gorm:"not null;default:false"`
	CreatedAt          time.Time `json:"created_at" db:"created_at" gorm:"not null"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at" gorm:"not null"`
}

type UserDisplaySettings struct {
    ID        int       `json:"id"`
    UserID    int       `json:"user_id"`
    DarkMode  bool      `json:"dark_mode"`
    Timezone  string    `json:"timezone"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}
