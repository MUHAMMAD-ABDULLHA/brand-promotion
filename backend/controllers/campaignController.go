package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
	"vite-project/backend/config"
	"vite-project/backend/models"

	"github.com/gin-gonic/gin"
)

func CreateCampaign(c *gin.Context) {
	var campaign models.Campaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: " + err.Error()})
		return
	}

	// ============================================================
	// 🛡️ MIDDLEWARE / PLAN ENFORCEMENT LOGIC
	// ============================================================

	// 1. Fetch the user's plan
	userPlan, err := models.GetPlanByUserID(campaign.BrandUserID)
	if err != nil {
		// If sql.ErrNoRows, it means the user hasn't bought a plan yet
		c.JSON(http.StatusForbidden, gin.H{
			"error": "No active subscription plan found. Please subscribe to create a campaign.",
		})
		return
	}

	// 2. Check if the plan is active (optional, depends on your status values)
	if userPlan.Status != "active" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Your subscription plan is not active.",
		})
		return
	}

	// 3. Get the max limit for this plan type
	limit := models.GetCampaignLimitByPlanType(userPlan.PlanType)

	// 4. Count existing campaigns
	currentCount, err := models.GetCampaignCountByUserID(campaign.BrandUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify campaign limits"})
		return
	}

	// 5. Compare
	if currentCount >= limit {
		c.JSON(http.StatusForbidden, gin.H{
			"error": fmt.Sprintf("Plan limit reached. Your %s allows a maximum of %d campaigns.", userPlan.PlanType, limit),
			"code":  "LIMIT_REACHED",
		})
		return
	}
	// ============================================================
	// END ENFORCEMENT LOGIC
	// ============================================================

	campaign.CreatedAt = time.Now()
	campaign.UpdatedAt = time.Now()

	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction begin failed"})
		return
	}
	defer tx.Rollback()

	// Insert campaign
	query := `
        INSERT INTO campaigns 
        (brand_user_id, name, description, objective, overall_budget, daily_budget, start_date, end_date, demographics,
        has_historical, historical_data, key_messages, cta, offers, enable_ar, enable_voice, multi_step_form, 
        personalized_page, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id`

	// fmt.Println("Query:", query) // Removed for cleaner logs in production

	err = tx.QueryRow(query,
		campaign.BrandUserID, campaign.Name, campaign.Description, campaign.Objective,
		campaign.OverallBudget, campaign.DailyBudget, campaign.StartDate, campaign.EndDate, campaign.Demographics,
		campaign.HasHistorical, campaign.HistoricalData, campaign.KeyMessages, campaign.Cta, campaign.Offers,
		campaign.EnableAR, campaign.EnableVoice, campaign.MultiStepForm, campaign.PersonalizedPage, campaign.Status,
		campaign.CreatedAt, campaign.UpdatedAt,
	).Scan(&campaign.ID)

	if err != nil {
		fmt.Println("Error inserting campaign:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert campaign"})
		return
	}

	// Insert KPIs into campaign_kpis table
	for i, kpi := range campaign.Kpis {
		if _, err := tx.Exec(
			"INSERT INTO campaign_kpis (campaign_id, kpi_name) VALUES ($1, $2)",
			campaign.ID, kpi); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert KPI at index " + string(rune(i))})
			fmt.Println("Error inserting KPI:", err)
			return
		}
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction commit failed"})
		return
	}

	c.JSON(http.StatusCreated, campaign)
}

// GetCampaign retrieves a single campaign by ID

func GetCampaign(c *gin.Context) {
	id := c.Param("id")
	var brandUserID = id
	query := `
        SELECT id, brand_user_id, name, description, objective, overall_budget, daily_budget,
               start_date, end_date, demographics, has_historical, historical_data, key_messages,
               cta, offers, enable_ar, enable_voice, multi_step_form, personalized_page, status,
               created_at, updated_at
        FROM campaigns
        WHERE brand_user_id = $1
    `
	rows, err := config.DB.Query(query, brandUserID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var campaigns []models.Campaign

	// Iterate campaigns
	for rows.Next() {
		var campaign models.Campaign

		// Scan campaign fields
		if err := rows.Scan(
			&campaign.ID, &campaign.BrandUserID, &campaign.Name, &campaign.Description,
			&campaign.Objective, &campaign.OverallBudget, &campaign.DailyBudget,
			&campaign.StartDate, &campaign.EndDate, &campaign.Demographics,
			&campaign.HasHistorical, &campaign.HistoricalData, &campaign.KeyMessages,
			&campaign.Cta, &campaign.Offers, &campaign.EnableAR, &campaign.EnableVoice,
			&campaign.MultiStepForm, &campaign.PersonalizedPage, &campaign.Status,
			&campaign.CreatedAt, &campaign.UpdatedAt,
		); err != nil {
			fmt.Println("Error scanning campaign:", err)
			continue
		}

		// Fetch KPIs for this campaign
		kpiRows, kpiErr := config.DB.Query(
			"SELECT kpi_name FROM campaign_kpis WHERE campaign_id = $1", campaign.ID,
		)
		if kpiErr == nil {
			for kpiRows.Next() {
				var kpi string
				if err := kpiRows.Scan(&kpi); err == nil {
					campaign.Kpis = append(campaign.Kpis, kpi)
				}
			}
			kpiRows.Close()
		}

		campaigns = append(campaigns, campaign)
	}

	// Return campaigns with KPIs
	c.JSON(http.StatusOK, campaigns)
}

// GetSingleCampaign retrieves a single campaign by ID
func GetSingleCampaign(c *gin.Context) {
	// Parse campaign ID
	idParam := c.Param("id")
	campaignID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	// Query campaign details
	query := `SELECT id, brand_user_id, name, description, objective, overall_budget, daily_budget,
			  start_date, end_date, demographics, has_historical, historical_data, key_messages,
			  cta, offers, enable_ar, enable_voice, multi_step_form, personalized_page, status,
			  created_at, updated_at
			  FROM campaigns WHERE id = $1`

	var campaign models.Campaign
	err = config.DB.QueryRow(query, campaignID).Scan(
		&campaign.ID, &campaign.BrandUserID, &campaign.Name, &campaign.Description,
		&campaign.Objective, &campaign.OverallBudget, &campaign.DailyBudget,
		&campaign.StartDate, &campaign.EndDate, &campaign.Demographics,
		&campaign.HasHistorical, &campaign.HistoricalData, &campaign.KeyMessages,
		&campaign.Cta, &campaign.Offers, &campaign.EnableAR, &campaign.EnableVoice,
		&campaign.MultiStepForm, &campaign.PersonalizedPage, &campaign.Status,
		&campaign.CreatedAt, &campaign.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Campaign not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Fetch KPIs
	kpiRows, kpiErr := config.DB.Query(
		"SELECT kpi_name FROM campaign_kpis WHERE campaign_id = $1", campaignID,
	)
	if kpiErr == nil {
		defer kpiRows.Close()
		for kpiRows.Next() {
			var kpi string
			if err := kpiRows.Scan(&kpi); err == nil {
				campaign.Kpis = append(campaign.Kpis, kpi)
			}
		}
	}

	// Return result
	c.JSON(http.StatusOK, campaign)
}

// GetAllCampaigns returns all campaigns
func GetAllCampaigns(c *gin.Context) {
	query := `
	SELECT id, brand_user_id, name, description, objective,
	       overall_budget, daily_budget, start_date, end_date,
	       demographics, has_historical, historical_data, key_messages,
	       cta, offers, enable_ar, enable_voice, multi_step_form,
	       personalized_page, status, created_at, updated_at, spend
	FROM campaigns
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch campaigns"})
		return
	}
	defer rows.Close()

	var campaigns []models.Campaign
	for rows.Next() {
		var cpn models.Campaign
		err := rows.Scan(
			&cpn.ID,
			&cpn.BrandUserID,
			&cpn.Name,
			&cpn.Description,
			&cpn.Objective,
			&cpn.OverallBudget,
			&cpn.DailyBudget,
			&cpn.StartDate,
			&cpn.EndDate,
			&cpn.Demographics,
			&cpn.HasHistorical,
			&cpn.HistoricalData,
			&cpn.KeyMessages,
			&cpn.Cta,
			&cpn.Offers,
			&cpn.EnableAR,
			&cpn.EnableVoice,
			&cpn.MultiStepForm,
			&cpn.PersonalizedPage,
			&cpn.Status,
			&cpn.CreatedAt,
			&cpn.UpdatedAt,
			&cpn.Spend, // <-- Add Spend at the end
		)
		if err != nil {
			fmt.Println("Scan error:", err)
			continue
		}
		campaigns = append(campaigns, cpn)
	}

	fmt.Printf("Fetched %d campaigns\n", len(campaigns))
	c.JSON(http.StatusOK, campaigns)
}

// UpdateCampaign updates campaign details
func UpdateCampaign(c *gin.Context) {
	idParam := c.Param("id")
	campaignID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	var campaign models.Campaign
	if err := c.ShouldBindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	campaign.UpdatedAt = time.Now()

	// Update main campaign details
	_, err = config.DB.Exec(`
		UPDATE campaigns SET 
		name=$1, description=$2, objective=$3, overall_budget=$4, daily_budget=$5, start_date=$6, end_date=$7, 
		demographics=$8, has_historical=$9, historical_data=$10, key_messages=$11, cta=$12, offers=$13, 
		enable_ar=$14, enable_voice=$15, multi_step_form=$16, personalized_page=$17, status=$18, updated_at=$19
		WHERE id=$20`,
		campaign.Name, campaign.Description, campaign.Objective, campaign.OverallBudget,
		campaign.DailyBudget, campaign.StartDate, campaign.EndDate, campaign.Demographics,
		campaign.HasHistorical, campaign.HistoricalData, campaign.KeyMessages, campaign.Cta, campaign.Offers,
		campaign.EnableAR, campaign.EnableVoice, campaign.MultiStepForm, campaign.PersonalizedPage,
		campaign.Status, campaign.UpdatedAt, campaignID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
		return
	}

	// Update KPIs (if provided)
	if campaign.Kpis != nil {
		// Remove old KPIs
		_, err = config.DB.Exec(`DELETE FROM campaign_kpis WHERE campaign_id = $1`, campaignID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear old KPIs"})
			return
		}

		// Insert new KPIs
		for _, kpi := range campaign.Kpis {
			_, err = config.DB.Exec(`INSERT INTO campaign_kpis (campaign_id, kpi_name) VALUES ($1, $2)`, campaignID, kpi)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert KPIs"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign updated successfully"})
}

// DeleteCampaign removes a campaign by ID
func DeleteCampaign(c *gin.Context) {
	idParam := c.Param("id")
	campaignID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	// Delete KPIs first
	_, err = config.DB.Exec("DELETE FROM campaign_kpis WHERE campaign_id = $1", campaignID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete KPIs"})
		return
	}

	// Delete campaign
	_, err = config.DB.Exec("DELETE FROM campaigns WHERE id = $1", campaignID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Campaign deleted successfully"})
}

/*	==================================================
	||												||
	||			Combine compaigns          			||
	||												||
	================================================== */

// create combine campaign
func CreateCombineCampaign(c *gin.Context) {
	// fmt request details
	fmt.Println("----- Incoming Request -----")
	fmt.Printf("Request URL: %s\n", c.Request.URL.String())
	fmt.Printf("Request Method: %s\n", c.Request.Method)
	fmt.Println("Headers:")
	for k, v := range c.Request.Header {
		fmt.Printf("  %s: %v\n", k, v)
	}

	// Extract campaign_id from URL param
	campaignIDParam := c.Param("campaign_id")
	fmt.Printf("Campaign ID Param: %s\n", campaignIDParam)
	campaignID, err := strconv.Atoi(campaignIDParam)
	if err != nil {
		fmt.Printf("[ERROR] Invalid campaign_id: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign_id"})
		return
	}

	// Extract user from context (custom claims with user_id)
	user, exists := c.Get("user_id")
	if !exists {
		fmt.Println("[ERROR] No user found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	adminID := user.(int)
	// Parse request body for collaborators
	var req struct {
		Collaborators []int `json:"collaborators"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("[ERROR] Failed to parse JSON: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	fmt.Printf("[INFO] Creating combine campaign: campaign_id=%d, admin_id=%d, collaborators=%v\n",
		campaignID, adminID, req.Collaborators)

	// Insert into combine_campaign table
	query := `INSERT INTO combine_campaign (campaign_id, admin_id) VALUES ($1,$2) RETURNING id, created_at`
	var combineID int
	var createdAt time.Time
	err = config.DB.QueryRow(query, campaignID, adminID).Scan(&combineID, &createdAt)
	if err != nil {
		fmt.Printf("[ERROR] Failed to insert combine_campaign: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create combine campaign: %v", err)})
		return
	}
	fmt.Printf("[INFO] Created combine campaign id=%d at %v\n", combineID, createdAt)

	// Insert collaborators
	for _, collabID := range req.Collaborators {
		_, err := config.DB.Exec(
			`INSERT INTO combine_campaign_collaborators (combine_campaign_id, collaborator_id, approved)
			 VALUES ($1,$2,'pending')`,
			combineID, collabID,
		)
		if err != nil {
			fmt.Printf("[ERROR] Failed to add collaborator %d: %v\n", collabID, err)
			continue
		}
		fmt.Printf("[INFO] Collaborator %d added to combine campaign %d\n", collabID, combineID)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                  combineID,
		"campaign_id":         campaignID,
		"admin_id":            adminID,
		"created_at":          createdAt,
		"collaborators_added": len(req.Collaborators),
	})
}

// add collaborators in already created campaign
func AddCollaborators(c *gin.Context) {
	// Parse combine campaign ID
	combineIDParam := c.Param("id")
	combineID, err := strconv.Atoi(combineIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid campaign ID"})
		return
	}

	// Parse request body
	var req struct {
		Collaborators []int `json:"collaborators"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(req.Collaborators) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No collaborators provided"})
		return
	}

	// Start transaction
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	// Prepare insert statement
	stmt, err := tx.Prepare(`
        INSERT INTO combine_campaign_collaborators 
        (combine_campaign_id, collaborator_id, approved) 
        VALUES ($1, $2, 'pending')
        ON CONFLICT (combine_campaign_id, collaborator_id) DO NOTHING
    `)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare insert"})
		return
	}
	defer stmt.Close()

	// Insert collaborators
	for _, collabID := range req.Collaborators {
		_, err = stmt.Exec(combineID, collabID)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("Failed to add collaborator %d: %v", collabID, err),
			})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Collaborators added successfully"})
}

func GetCombineCampaignsByAdmin(c *gin.Context) {
	adminID := c.Param("admin_id")
	log.Printf("[INFO] Fetching combine campaigns for admin_id=%s", adminID)

	// Query combines campaign + campaign details + collaborator details
	query := `
		SELECT 
			cc.id AS combine_id,
			cc.campaign_id,
			cc.admin_id,
			cc.created_at,
			c.name AS campaign_name,
			c.objective,
			c.overall_budget,
			c.start_date,
			c.end_date,
			c.status,
			ccc.id AS collaborator_record_id,
			ccc.collaborator_id,
			ccc.approved,
			u.full_name,
			u.username,
			u.role,
			u.phone
		FROM combine_campaign cc
		JOIN campaigns c ON cc.campaign_id = c.id
		LEFT JOIN combine_campaign_collaborators ccc
			ON cc.id = ccc.combine_campaign_id
		LEFT JOIN users u
			ON ccc.collaborator_id = u.id
		WHERE cc.admin_id = $1
		ORDER BY cc.id;
	`

	log.Println("[INFO] Executing query to fetch combine campaigns with collaborators...")
	rows, err := config.DB.Query(query, adminID)
	if err != nil {
		log.Printf("[ERROR] Query execution failed for admin_id=%s: %v", adminID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch campaigns: %v", err)})
		return
	}
	defer rows.Close()
	log.Println("[INFO] Query executed successfully, scanning rows...")

	// Collaborator structure
	type Collaborator struct {
		RecordID       int    `json:"record_id"`
		CollaboratorID int    `json:"collaborator_id"`
		Approved       string `json:"approved"`
		FullName       string `json:"full_name"`
		Username       string `json:"username"`
		Role           string `json:"role"`
		Phone          string `json:"phone"`
	}

	// Full combined response
	type CombineCampaignResponse struct {
		ID            int            `json:"id"`
		CampaignID    int            `json:"campaign_id"`
		CampaignName  string         `json:"campaign_name"`
		Objective     string         `json:"objective"`
		OverallBudget float64        `json:"overall_budget"`
		StartDate     *time.Time     `json:"start_date"`
		EndDate       *time.Time     `json:"end_date"`
		Status        string         `json:"status"`
		AdminID       int            `json:"admin_id"`
		CreatedAt     time.Time      `json:"created_at"`
		Collaborators []Collaborator `json:"collaborators"`
	}

	// Use map to group collaborators under same campaign
	campaignsMap := make(map[int]*CombineCampaignResponse)
	rowCount := 0
	collabCount := 0

	for rows.Next() {
		var (
			ccID, campaignID, adminID, collabRecordID, collabID sql.NullInt64
			createdAt                                           time.Time
			campaignName, objective, status                     sql.NullString
			approved, fullName, username, role, phone           sql.NullString
			overallBudget                                       sql.NullFloat64
			startDate, endDate                                  sql.NullTime
		)

		if err := rows.Scan(
			&ccID, &campaignID, &adminID, &createdAt,
			&campaignName, &objective, &overallBudget,
			&startDate, &endDate, &status,
			&collabRecordID, &collabID, &approved,
			&fullName, &username, &role, &phone,
		); err != nil {
			log.Printf("[ERROR] Row scan failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan combine campaign: %v", err)})
			return
		}
		rowCount++

		log.Printf("[DEBUG] Row #%d scanned => CampaignID=%d, CombineID=%d, Name=%s, Status=%s",
			rowCount, campaignID.Int64, ccID.Int64, campaignName.String, status.String)

		// Initialize combine campaign
		if _, exists := campaignsMap[int(ccID.Int64)]; !exists {
			log.Printf("[INFO] Creating new campaign entry: CombineID=%d, CampaignName=%s", ccID.Int64, campaignName.String)

			campaignsMap[int(ccID.Int64)] = &CombineCampaignResponse{
				ID:            int(ccID.Int64),
				CampaignID:    int(campaignID.Int64),
				CampaignName:  campaignName.String,
				Objective:     objective.String,
				OverallBudget: overallBudget.Float64,
				StartDate:     nil,
				EndDate:       nil,
				Status:        status.String,
				AdminID:       int(adminID.Int64),
				CreatedAt:     createdAt,
				Collaborators: []Collaborator{},
			}
			if startDate.Valid {
				campaignsMap[int(ccID.Int64)].StartDate = &startDate.Time
			}
			if endDate.Valid {
				campaignsMap[int(ccID.Int64)].EndDate = &endDate.Time
			}
		}

		// Add collaborator if exists
		if collabID.Valid {
			collabCount++
			log.Printf("[DEBUG] Adding collaborator => CombineID=%d, CollaboratorID=%d, Name=%s, Approved=%s",
				ccID.Int64, collabID.Int64, fullName.String, approved.String)

			campaignsMap[int(ccID.Int64)].Collaborators = append(
				campaignsMap[int(ccID.Int64)].Collaborators,
				Collaborator{
					RecordID:       int(collabRecordID.Int64),
					CollaboratorID: int(collabID.Int64),
					Approved:       approved.String,
					FullName:       fullName.String,
					Username:       username.String,
					Role:           role.String,
					Phone:          phone.String,
				},
			)
		}
	}

	if err := rows.Err(); err != nil {
		log.Printf("[ERROR] Row iteration error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Row iteration error: %v", err)})
		return
	}

	// Convert map to slice
	campaigns := make([]CombineCampaignResponse, 0, len(campaignsMap))
	for _, v := range campaignsMap {
		campaigns = append(campaigns, *v)
	}

	log.Printf("[INFO] Finished fetching combine campaigns for admin_id=%s. Total campaigns=%d, Total collaborators=%d",
		adminID, len(campaigns), collabCount)

	c.JSON(http.StatusOK, campaigns)
}

func GetAllCombineCampaigns(c *gin.Context) {
	query := `
		SELECT
			cc.id AS combine_id,
			cc.campaign_id,
			cc.admin_id,
			cc.created_at,
			c.name AS campaign_name,
			c.objective,
			c.overall_budget,
			c.start_date,
			c.end_date,
			c.status,
			ccc.id AS collaborator_record_id,
			ccc.collaborator_id,
			ccc.approved,
			u.full_name,
			u.username,
			u.role,
			u.phone
		FROM combine_campaign cc
		JOIN campaigns c ON cc.campaign_id = c.id
		LEFT JOIN combine_campaign_collaborators ccc
			ON cc.id = ccc.combine_campaign_id
		LEFT JOIN users u
			ON ccc.collaborator_id = u.id
		ORDER BY cc.id;
	`

	log.Println("[INFO] Executing query to fetch all combine campaigns with campaign + collaborator details")

	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("[ERROR] Failed to execute query: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch combine campaigns: %v", err)})
		return
	}
	defer rows.Close()

	// Collaborator structure
	type Collaborator struct {
		RecordID       int    `json:"record_id"`
		CollaboratorID int    `json:"collaborator_id"`
		Approved       string `json:"approved"`
		FullName       string `json:"full_name"`
		Username       string `json:"username"`
		Role           string `json:"role"`
		Phone          string `json:"phone"`
	}

	// Full combined response
	type CombineCampaignResponse struct {
		ID            int            `json:"id"`
		CampaignID    int            `json:"campaign_id"`
		CampaignName  string         `json:"campaign_name"`
		Objective     string         `json:"objective"`
		OverallBudget float64        `json:"overall_budget"`
		StartDate     *time.Time     `json:"start_date"`
		EndDate       *time.Time     `json:"end_date"`
		Status        string         `json:"status"`
		AdminID       int            `json:"admin_id"`
		CreatedAt     time.Time      `json:"created_at"`
		Collaborators []Collaborator `json:"collaborators"`
	}

	// Use map to group collaborators under the same campaign
	campaignsMap := make(map[int]*CombineCampaignResponse)

	for rows.Next() {
		var (
			ccID, campaignID, adminID, collabRecordID, collabID sql.NullInt64
			createdAt                                           time.Time
			campaignName, objective, status                     sql.NullString
			approved, fullName, username, role, phone           sql.NullString
			overallBudget                                       sql.NullFloat64
			startDate, endDate                                  sql.NullTime
		)

		if err := rows.Scan(
			&ccID, &campaignID, &adminID, &createdAt,
			&campaignName, &objective, &overallBudget,
			&startDate, &endDate, &status,
			&collabRecordID, &collabID, &approved,
			&fullName, &username, &role, &phone,
		); err != nil {
			log.Printf("[ERROR] Failed to scan row: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan combine campaign: %v", err)})
			return
		}

		// Initialize combine campaign if not already added
		if _, exists := campaignsMap[int(ccID.Int64)]; !exists {
			campaignsMap[int(ccID.Int64)] = &CombineCampaignResponse{
				ID:            int(ccID.Int64),
				CampaignID:    int(campaignID.Int64),
				CampaignName:  campaignName.String,
				Objective:     objective.String,
				OverallBudget: overallBudget.Float64,
				StartDate:     nil,
				EndDate:       nil,
				Status:        status.String,
				AdminID:       int(adminID.Int64),
				CreatedAt:     createdAt,
				Collaborators: []Collaborator{},
			}
			if startDate.Valid {
				campaignsMap[int(ccID.Int64)].StartDate = &startDate.Time
			}
			if endDate.Valid {
				campaignsMap[int(ccID.Int64)].EndDate = &endDate.Time
			}
		}

		// Add collaborator if exists
		if collabID.Valid {
			campaignsMap[int(ccID.Int64)].Collaborators = append(
				campaignsMap[int(ccID.Int64)].Collaborators,
				Collaborator{
					RecordID:       int(collabRecordID.Int64),
					CollaboratorID: int(collabID.Int64),
					Approved:       approved.String,
					FullName:       fullName.String,
					Username:       username.String,
					Role:           role.String,
					Phone:          phone.String,
				},
			)
		}
	}

	if err := rows.Err(); err != nil {
		log.Printf("[ERROR] Row iteration error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Row iteration error: %v", err)})
		return
	}

	// Convert map to slice
	campaigns := make([]CombineCampaignResponse, 0, len(campaignsMap))
	for _, v := range campaignsMap {
		campaigns = append(campaigns, *v)
	}

	log.Printf("[INFO] Finished fetching combine campaigns. Total=%d", len(campaigns))
	c.JSON(http.StatusOK, campaigns)
}

// delete used by both admin and brand admin
func DeleteCombineCampaign(c *gin.Context) {
	id := c.Param("id")

	// Delete collaborators first
	_, err := config.DB.Exec(`DELETE FROM combine_campaign_collaborators WHERE combine_campaign_id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete collaborators: %v", err)})
		return
	}

	// Delete main record
	_, err = config.DB.Exec(`DELETE FROM combine_campaign WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete combine campaign: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Combine campaign deleted successfully"})
}

func GetCombineCampaignsForCollaborator(c *gin.Context) {
	collaboratorID := c.Param("collaborator_id")
	log.Printf("[INFO] Fetching combine campaigns for collaborator ID: %s", collaboratorID)

	if collaboratorID == "" {
		log.Println("[WARN] Empty collaborator ID received")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Collaborator ID is required"})
		return
	}

	query := `
		SELECT
			cc.id AS combine_id,
			cc.campaign_id,
			cc.admin_id,
			cc.created_at,
			c.name AS campaign_name,
			c.objective,
			c.overall_budget,
			c.start_date,
			c.end_date,
			c.status,
			ccc.id AS collaborator_record_id,
			ccc.collaborator_id,
			ccc.approved,
			u.full_name,
			u.username,
			u.role,
			u.phone
		FROM combine_campaign cc
		JOIN campaigns c ON cc.campaign_id = c.id
		JOIN combine_campaign_collaborators ccc
			ON cc.id = ccc.combine_campaign_id
		LEFT JOIN users u
			ON ccc.collaborator_id = u.id
		WHERE ccc.collaborator_id = $1
		ORDER BY cc.id;
	`

	rows, err := config.DB.Query(query, collaboratorID)
	if err != nil {
		log.Printf("[ERROR] Failed to execute query for collaborator %s: %v", collaboratorID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch campaigns: %v", err)})
		return
	}
	defer rows.Close()

	// Collaborator structure
	type Collaborator struct {
		RecordID       int    `json:"record_id"`
		CollaboratorID int    `json:"collaborator_id"`
		Approved       string `json:"approved"`
		FullName       string `json:"full_name"`
		Username       string `json:"username"`
		Role           string `json:"role"`
		Phone          string `json:"phone"`
	}

	// Full combined response
	type CombineCampaignResponse struct {
		ID            int            `json:"id"`
		CampaignID    int            `json:"campaign_id"`
		CampaignName  string         `json:"campaign_name"`
		Objective     string         `json:"objective"`
		OverallBudget float64        `json:"overall_budget"`
		StartDate     *time.Time     `json:"start_date"`
		EndDate       *time.Time     `json:"end_date"`
		Status        string         `json:"status"`
		AdminID       int            `json:"admin_id"`
		CreatedAt     time.Time      `json:"created_at"`
		Collaborators []Collaborator `json:"collaborators"`
	}

	campaignsMap := make(map[int]*CombineCampaignResponse)

	for rows.Next() {
		var (
			ccID, campaignID, adminID, collabRecordID, collabID sql.NullInt64
			createdAt                                           time.Time
			campaignName, objective, status                     sql.NullString
			approved, fullName, username, role, phone           sql.NullString
			overallBudget                                       sql.NullFloat64
			startDate, endDate                                  sql.NullTime
		)

		if err := rows.Scan(
			&ccID, &campaignID, &adminID, &createdAt,
			&campaignName, &objective, &overallBudget,
			&startDate, &endDate, &status,
			&collabRecordID, &collabID, &approved,
			&fullName, &username, &role, &phone,
		); err != nil {
			log.Printf("[ERROR] Failed to scan row for collaborator %s: %v", collaboratorID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to scan combine campaign: %v", err)})
			return
		}

		if _, exists := campaignsMap[int(ccID.Int64)]; !exists {
			campaignsMap[int(ccID.Int64)] = &CombineCampaignResponse{
				ID:            int(ccID.Int64),
				CampaignID:    int(campaignID.Int64),
				CampaignName:  campaignName.String,
				Objective:     objective.String,
				OverallBudget: overallBudget.Float64,
				StartDate:     nil,
				EndDate:       nil,
				Status:        status.String,
				AdminID:       int(adminID.Int64),
				CreatedAt:     createdAt,
				Collaborators: []Collaborator{},
			}
			if startDate.Valid {
				campaignsMap[int(ccID.Int64)].StartDate = &startDate.Time
			}
			if endDate.Valid {
				campaignsMap[int(ccID.Int64)].EndDate = &endDate.Time
			}
		}

		// Add collaborator
		if collabID.Valid {
			campaignsMap[int(ccID.Int64)].Collaborators = append(
				campaignsMap[int(ccID.Int64)].Collaborators,
				Collaborator{
					RecordID:       int(collabRecordID.Int64),
					CollaboratorID: int(collabID.Int64),
					Approved:       approved.String,
					FullName:       fullName.String,
					Username:       username.String,
					Role:           role.String,
					Phone:          phone.String,
				},
			)
		}
	}

	if err := rows.Err(); err != nil {
		log.Printf("[ERROR] Row iteration error for collaborator %s: %v", collaboratorID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Row iteration error: %v", err)})
		return
	}

	// Convert map to slice
	campaigns := make([]CombineCampaignResponse, 0, len(campaignsMap))
	for _, v := range campaignsMap {
		campaigns = append(campaigns, *v)
	}

	log.Printf("[INFO] Finished fetching combine campaigns for collaborator %s. Total=%d", collaboratorID, len(campaigns))
	c.JSON(http.StatusOK, campaigns)
}

// ===================================
// Update Collaborator Approval Status - THE CRITICAL INTEGRATION POINT!
// ===================================
func UpdateCollaboratorApproval(c *gin.Context) {
	// The ID in the URL is the `id` from the `combine_campaign_collaborators` table
	collaboratorRecordIDParam := c.Param("id")
	collaboratorRecordID, err := strconv.Atoi(collaboratorRecordIDParam)
	if err != nil {
		log.Printf("[UpdateCollaboratorApproval] Invalid collaborator record ID: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid collaborator record ID"})
		return
	}

	var req struct {
		Approved string `json:"approved"` // "approved" or "rejected"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[UpdateCollaboratorApproval] Bind error: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	log.Printf("[UpdateCollaboratorApproval] Updating record %d to status '%s'", collaboratorRecordID, req.Approved)

	// Step 1: Update the approval status in the database
	// IMPORTANT: Use RETURNING to get the combine_campaign_id and collaborator_id
	// These are crucial for the chat integration.
	updateQuery := `
		UPDATE combine_campaign_collaborators
		SET approved=$1
		WHERE id=$2
		RETURNING combine_campaign_id, collaborator_id
	`
	var combineCampaignID int // To store the returned combine_campaign_id
	var collaboratorID int    // To store the returned collaborator_id
	err = config.DB.QueryRow(updateQuery, req.Approved, collaboratorRecordID).Scan(&combineCampaignID, &collaboratorID)
	if err != nil {
		log.Printf("[UpdateCollaboratorApproval] Failed to update status for record %d: %v", collaboratorRecordID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update status: %v", err)})
		return
	}
	log.Printf("[UpdateCollaboratorApproval] Record %d updated. CombineCampaignID: %d, CollaboratorID: %d, New Status: %s", collaboratorRecordID, combineCampaignID, collaboratorID, req.Approved)

	// Step 2: Conditionally trigger chat integration if the collaborator APPROVED
	if req.Approved == "approved" {
		log.Printf("[UpdateCollaboratorApproval] Collaborator %d approved for combine campaign %d. Triggering chat addition...", collaboratorID, combineCampaignID)

		// This is where you call the function from your chat controller
		chatErr := AddCollaboratorToCampaignChat(combineCampaignID, collaboratorID)
		if chatErr != nil {
			// Log the error. This is a partial success: approval happened, but chat integration failed.
			log.Printf("[UpdateCollaboratorApproval] ⚠️ FAILED to add collaborator %d to chat for campaign %d: %v", collaboratorID, combineCampaignID, chatErr)
			c.JSON(http.StatusOK, gin.H{"message": "Collaborator status updated, but failed to add to chat.", "error_chat": chatErr.Error()})
			return // Return with status OK but include an error detail
		}
		log.Printf("[UpdateCollaboratorApproval] ✅ Collaborator %d successfully added to campaign chat for combine campaign %d.", collaboratorID, combineCampaignID)
	} else {
		log.Printf("[UpdateCollaboratorApproval] Collaborator %d was %s, no chat action taken.", collaboratorID, req.Approved)
	}

	// Respond with success if everything went well (or with partial success message above)
	c.JSON(http.StatusOK, gin.H{"message": "Collaborator status updated successfully"})
}

// addCollaboratorToCampaignChat finds or creates a conversation for a campaign and adds the user.
func addCollaboratorToCampaignChat(combineCampaignID, collaboratorID int) error {
	// 1. Find the campaign ID from the combine_campaign ID
	var campaignID int
	err := config.DB.QueryRow("SELECT campaign_id FROM combine_campaign WHERE id = $1", combineCampaignID).Scan(&campaignID)
	if err != nil {
		return fmt.Errorf("failed to find campaign ID for combine campaign %d: %w", combineCampaignID, err)
	}

	// 2. Try to find an existing conversation for this campaign
	var conversationID int
	err = config.DB.QueryRow("SELECT id FROM conversations WHERE campaign_id = $1", campaignID).Scan(&conversationID)

	// 3. If no conversation exists, create a new one
	if err == sql.ErrNoRows {
		fmt.Printf("No existing conversation found for campaign %d. Creating a new one...", campaignID)

		// Create a new conversation and get its ID
		createConvQuery := `INSERT INTO conversations (type, campaign_id, title) VALUES ($1, $2, $3) RETURNING id`
		err = config.DB.QueryRow(createConvQuery, "group", campaignID, fmt.Sprintf("Campaign #%d Chat", campaignID)).Scan(&conversationID)
		if err != nil {
			return fmt.Errorf("failed to create new conversation for campaign %d: %w", campaignID, err)
		}

		fmt.Printf("New conversation %d created for campaign %d", conversationID, campaignID)

		// Add all existing approved collaborators from `combine_campaign_collaborators`
		// plus the brand admin from `combine_campaign` to the new chat.
		var initialMembers []int
		// Get brand admin ID
		var adminID int
		err = config.DB.QueryRow("SELECT admin_id FROM combine_campaign WHERE id = $1", combineCampaignID).Scan(&adminID)
		if err != nil {
			return fmt.Errorf("failed to get admin ID for combine campaign %d: %w", combineCampaignID, err)
		}
		initialMembers = append(initialMembers, adminID)

		// Get other approved members
		rows, err := config.DB.Query("SELECT collaborator_id FROM combine_campaign_collaborators WHERE combine_campaign_id = $1 AND approved = 'approved'", combineCampaignID)
		if err != nil {
			return fmt.Errorf("failed to get approved collaborators for combine campaign %d: %w", combineCampaignID, err)
		}
		defer rows.Close()

		for rows.Next() {
			var memberID int
			if err := rows.Scan(&memberID); err != nil {
				continue
			}
			initialMembers = append(initialMembers, memberID)
		}

		for _, memberID := range initialMembers {
			_, err = config.DB.Exec("INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)", conversationID, memberID)
			if err != nil {
				fmt.Printf("Failed to add initial member %d to new conversation %d: %v", memberID, conversationID, err)
			}
		}
	} else if err != nil {
		return fmt.Errorf("database error when finding conversation for campaign %d: %w", campaignID, err)
	}

	// 4. Add the newly approved collaborator to the conversation
	_, err = config.DB.Exec("INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", conversationID, collaboratorID)
	if err != nil {
		return fmt.Errorf("failed to add collaborator %d to conversation %d: %w", collaboratorID, conversationID, err)
	}

	return nil
}

// fetch collaborators
// GetCollaborators - fetch brands + influencers except the caller

func GetCollaborators(c *gin.Context) {
	userIDStr := c.Param("id")
	fmt.Println("[DEBUG] Incoming userID param:", userIDStr)

	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		fmt.Println("[ERROR] Invalid user ID:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}
	fmt.Println("[DEBUG] Converted userID (int):", userID)

	// --- BRANDS QUERY ---
	brandsQuery := `
        SELECT u.id, u.full_name, u.username, u.image_url, b.brand_name, b.brand_website
        FROM users u
        JOIN brands b ON u.id = b.user_id
        WHERE u.id != $1
    `
	fmt.Println("[DEBUG] Running brands query")

	brandRows, err := config.DB.Query(brandsQuery, userID)
	if err != nil {
		fmt.Println("[ERROR] Failed to query brands:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch brands: %v", err)})
		return
	}
	defer brandRows.Close()

	var brands []map[string]interface{}
	for brandRows.Next() {
		var id int
		var fullName, username string
		var imageURL, brandName, brandWebsite sql.NullString

		if err := brandRows.Scan(&id, &fullName, &username, &imageURL, &brandName, &brandWebsite); err != nil {
			fmt.Println("[ERROR] Scan error (brands):", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Scan error: %v", err)})
			return
		}

		brands = append(brands, map[string]interface{}{
			"id":            id,
			"full_name":     fullName,
			"username":      username,
			"image_url":     nullToString(imageURL),
			"brand_name":    nullToString(brandName),
			"brand_website": nullToString(brandWebsite),
		})
	}
	fmt.Println("[DEBUG] Total brands found:", len(brands))

	// --- INFLUENCERS QUERY ---
	influencersQuery := `
        SELECT u.id, u.full_name, u.username, u.image_url, i.social_media, i.social_media_link, i.followers
        FROM users u
        JOIN influencers i ON u.id = i.user_id
        WHERE u.id != $1
    `
	fmt.Println("[DEBUG] Running influencers query")

	influencerRows, err := config.DB.Query(influencersQuery, userID)
	if err != nil {
		fmt.Println("[ERROR] Failed to query influencers:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch influencers: %v", err)})
		return
	}
	defer influencerRows.Close()

	var influencers []map[string]interface{}
	for influencerRows.Next() {
		var id int
		var fullName, username string
		var imageURL, socialMedia, socialLink sql.NullString
		var followers int64

		if err := influencerRows.Scan(&id, &fullName, &username, &imageURL, &socialMedia, &socialLink, &followers); err != nil {
			fmt.Println("[ERROR] Scan error (influencers):", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Scan error: %v", err)})
			return
		}

		influencers = append(influencers, map[string]interface{}{
			"id":                id,
			"full_name":         fullName,
			"username":          username,
			"image_url":         nullToString(imageURL),
			"social_media":      nullToString(socialMedia),
			"social_media_link": nullToString(socialLink),
			"followers":         followers,
		})
	}
	fmt.Println("[DEBUG] Total influencers found:", len(influencers))

	c.JSON(http.StatusOK, gin.H{
		"brands":      brands,
		"influencers": influencers,
	})
}

func nullToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

// UpdateCombineCampaign updates collaborators of an existing combine campaign
func UpdateCombineCampaign(c *gin.Context) {
	combineID := c.Param("id")
	fmt.Printf("[DEBUG] UpdateCombineCampaign called for combineID: %s", combineID)

	// Parse request body
	var payload struct {
		Collaborators []int `json:"collaborators"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		fmt.Printf("[ERROR] Failed to parse JSON body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	fmt.Printf("[DEBUG] Parsed collaborators payload: %+v", payload.Collaborators)

	// Step 1: Check if campaign exists
	var exists bool
	err := config.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM combine_campaign WHERE id=$1)`, combineID).Scan(&exists)
	if err != nil {
		fmt.Printf("[ERROR] Failed to check campaign existence: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error when checking campaign"})
		return
	}
	if !exists {
		fmt.Printf("[WARN] Combine campaign %s not found", combineID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Combine campaign not found"})
		return
	}

	// Step 2: Delete old collaborators
	fmt.Printf("[DEBUG] Deleting old collaborators for combineID: %s", combineID)
	_, err = config.DB.Exec(`DELETE FROM combine_campaign_collaborators WHERE combine_campaign_id=$1`, combineID)
	if err != nil {
		fmt.Printf("[ERROR] Failed to delete old collaborators: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove old collaborators"})
		return
	}

	// Step 3: Insert new collaborators
	fmt.Printf("[DEBUG] Inserting new collaborators: %+v", payload.Collaborators)
	for _, collaboratorID := range payload.Collaborators {
		fmt.Printf("[DEBUG] Adding collaborator ID: %d", collaboratorID)
		_, err := config.DB.Exec(`
            INSERT INTO combine_campaign_collaborators (combine_campaign_id, collaborator_id, approved)
            VALUES ($1, $2, 'pending')
        `, combineID, collaboratorID)
		if err != nil {
			fmt.Printf("[ERROR] Failed to add collaborator %d: %v", collaboratorID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to add collaborator %d", collaboratorID)})
			return
		}
	}

	// Step 4: Return success
	fmt.Printf("[DEBUG] Successfully updated combine campaign %s", combineID)
	c.JSON(http.StatusOK, gin.H{
		"id":      combineID,
		"message": "Combine campaign updated successfully",
	})
}

func GetPendingCombineCampaigns(c *gin.Context) {
	collaboratorID := c.Param("id")

	query := `
    SELECT 
        cc.id AS combine_id,
        cc.campaign_id,
        cc.admin_id,
        cc.created_at,
        c.name AS campaign_name,
        c.overall_budget,
        c.start_date,
        c.end_date,
        ccc.id AS collaborator_record_id,
        ccc.collaborator_id,
        ccc.approved,
        u.full_name,
        u.username,
        u.role,
        u.phone
    FROM combine_campaign cc
    JOIN campaigns c ON cc.campaign_id = c.id
    JOIN combine_campaign_collaborators ccc ON cc.id = ccc.combine_campaign_id
    LEFT JOIN users u ON cc.admin_id = u.id
    WHERE ccc.collaborator_id = $1 AND ccc.approved = 'pending'
    ORDER BY cc.id
    `

	rows, err := config.DB.Query(query, collaboratorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	campaigns := []map[string]interface{}{}

	for rows.Next() {
		var combineID, campaignID, adminID, collaboratorRecordID, collaboratorIDInt int
		var createdAt, startDate, endDate, approved, fullName, username, role, phone sql.NullString
		var campaignName string
		var overallBudget float64

		err := rows.Scan(
			&combineID, &campaignID, &adminID, &createdAt,
			&campaignName, &overallBudget, &startDate, &endDate,
			&collaboratorRecordID, &collaboratorIDInt, &approved,
			&fullName, &username, &role, &phone,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		campaigns = append(campaigns, map[string]interface{}{
			"combine_id":             combineID,
			"campaign_id":            campaignID,
			"admin_id":               adminID,
			"created_at":             createdAt.String,
			"campaign_name":          campaignName,
			"overall_budget":         overallBudget,
			"start_date":             startDate.String,
			"end_date":               endDate.String,
			"collaborator_record_id": collaboratorRecordID,
			"collaborator_id":        collaboratorIDInt,
			"approved":               approved.String,
			"admin_full_name":        fullName.String,
			"admin_username":         username.String,
			"admin_role":             role.String,
			"admin_phone":            phone.String,
		})
	}

	c.JSON(http.StatusOK, gin.H{"campaigns": campaigns})
}
