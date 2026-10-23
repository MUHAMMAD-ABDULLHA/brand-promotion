package seeder

import (
	"database/sql"
	"fmt"
	"log"
	"math"
	"math/rand"
	"strings"
	"time"
	"vite-project/backend/config"

	"golang.org/x/crypto/bcrypt"
)

type seedUser struct {
	Email    string
	FullName string
	Username string
	Age      int
	Role     string
	Bio      string
	ImageURL string
}

type seedPost struct {
	Caption  string
	ImageURL string
	Category string
}

var categories = []string{
	"Technology", "Travel", "Food", "Fitness",
	"Fashion", "Finance", "Art", "Music",
}

var users = []seedUser{
	{
		Email: "alex@techhub.io", FullName: "Alex Chen", Username: "alexchen_tech",
		Age: 28, Role: "influencer",
		Bio:     "Tech reviewer & software engineer. Breaking down complex tech into simple stories.",
		ImageURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
	},
	{
		Email: "sarah@wanderlust.co", FullName: "Sarah Williams", Username: "sarah_wanders",
		Age: 26, Role: "influencer",
		Bio:     "Travel photographer exploring hidden gems worldwide. 30 countries and counting.",
		ImageURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
	},
	{
		Email: "marco@foodlab.com", FullName: "Marco Rossi", Username: "marco_eats",
		Age: 31, Role: "influencer",
		Bio:     "Chef & food storyteller. Italian at heart, global on the plate.",
		ImageURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
	},
	{
		Email: "jenny@fitlife.com", FullName: "Jenny Park", Username: "jennyfit",
		Age: 24, Role: "influencer",
		Bio:     "Certified trainer helping you build strength from the inside out.",
		ImageURL: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
	},
	{
		Email: "olivia@stylelab.com", FullName: "Olivia Brooks", Username: "olivia_styles",
		Age: 27, Role: "influencer",
		Bio:     "Sustainable fashion advocate. Minimal wardrobe, maximum impact.",
		ImageURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
	},
	{
		Email: "david@finwise.com", FullName: "David Kim", Username: "david_finance",
		Age: 34, Role: "influencer",
		Bio:     "Financial analyst sharing practical wealth-building strategies for everyday people.",
		ImageURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
	},
	{
		Email: "maya@creativestudio.com", FullName: "Maya Patel", Username: "maya_art",
		Age: 25, Role: "influencer",
		Bio:     "Digital artist blending tradition with technology. Illustrating the future.",
		ImageURL: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400",
	},
	{
		Email: "james@melody.com", FullName: "James Wilson", Username: "james_music",
		Age: 29, Role: "influencer",
		Bio:     "Guitarist and producer sharing daily riffs and music production tips.",
		ImageURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
	},
}

var posts = []seedPost{
	{Caption: "Just got my hands on the new M4 MacBook Air — the performance per watt is absolutely insane. Full review dropping this weekend.", ImageURL: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", Category: "Technology"},
	{Caption: "Built a Raspberry Pi home server that runs my entire smart home. Total cost? Under $150. Here is the complete guide.", ImageURL: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800", Category: "Technology"},
	{Caption: "The state of AI coding assistants in 2026 — we tested GitHub Copilot, Cursor, and Codeium on real production bugs. The results might surprise you.", ImageURL: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800", Category: "Technology"},
	{Caption: "Open source alternative to Notion that runs on your own server. Self-hosting your productivity stack has never been easier.", ImageURL: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", Category: "Technology"},
	{Caption: "Why I switched from TypeScript to Go for my backend services after 5 years. The tooling gap is closing fast.", ImageURL: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800", Category: "Technology"},
	{Caption: "Sunrise over the temples of Bagan, Myanmar — 2,000 ancient stupas stretching across the misty plains. A sight that changes you.", ImageURL: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800", Category: "Travel"},
	{Caption: "Found a hidden beach in Sardinia with water so clear you can see the fish from 30 feet above. No crowds, just pure Mediterranean magic.", ImageURL: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800", Category: "Travel"},
	{Caption: "Three weeks backpacking through the Scottish Highlands. The most underrated hiking destination in Europe. Here are my top 5 trails.", ImageURL: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", Category: "Travel"},
	{Caption: "Tokyo at night is a different world. These neon-lit alleyways in Shibuya hide the best ramen shops in the city.", ImageURL: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800", Category: "Travel"},
	{Caption: "Homemade sourdough that took three years to perfect. The secret is a 15-year-old starter my grandmother passed down.", ImageURL: "https://images.unsplash.com/photo-1585478259715-8d0e7c0c5f1a?w=800", Category: "Food"},
	{Caption: "Street food tour in Bangkok: 8 dishes, $12 total, zero regrets. The mango sticky rice alone is worth the flight.", ImageURL: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", Category: "Food"},
	{Caption: "Perfecting the art of French omelette — 30 seconds on heat, 30 seconds off, repeat. Silky, creamy, and worth every second.", ImageURL: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800", Category: "Food"},
	{Caption: "Fermentation station: homemade kimchi, kombucha, and kefir all bubbling away. Gut health has never tasted this good.", ImageURL: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800", Category: "Food"},
	{Caption: "Consistency over intensity. 500 days of daily movement and the transformation is not just physical — it is mental resilience.", ImageURL: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", Category: "Fitness"},
	{Caption: "Calisthenics park workout: pull-ups, dips, and pistols squats. No gym membership needed for a full-body transformation.", ImageURL: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", Category: "Fitness"},
	{Caption: "Morning yoga routine that fixed my chronic back pain in 6 weeks. Here is the exact sequence I follow daily.", ImageURL: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800", Category: "Fitness"},
	{Caption: "Nutrition myth busting: why eating 6 small meals a day is not better than 3 balanced ones. The science explained simply.", ImageURL: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800", Category: "Fitness"},
	{Caption: "Trail running at sunrise changed my relationship with exercise. Nature is the ultimate personal trainer.", ImageURL: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800", Category: "Fitness"},
	{Caption: "Capsule wardrobe update: 33 items for every season. Sustainable fashion does not mean sacrificing style.", ImageURL: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800", Category: "Fashion"},
	{Caption: "Thrift flip of the week: turned a $5 oversized blazer into a custom corset top. Thrifting is the future of fashion.", ImageURL: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800", Category: "Fashion"},
	{Caption: "The tailoring revolution: why spending $30 on alterations makes a $50 suit look like $500. Fit is everything.", ImageURL: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800", Category: "Fashion"},
	{Caption: "Slow fashion brands that are actually worth the investment. These 5 labels combine ethics with exceptional design.", ImageURL: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800", Category: "Fashion"},
	{Caption: "The 50-30-20 budget rule is outdated. Here is the modern alternative that actually works for freelancers and gig workers.", ImageURL: "https://images.unsplash.com/photo-1565514020179-026b5a1da3f0?w=800", Category: "Finance"},
	{Caption: "Compound interest explained with a story: two friends, one starts investing at 25, the other at 35. The gap is 600k at retirement.", ImageURL: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800", Category: "Finance"},
	{Caption: "Real estate investing for beginners: how to analyze a rental property in 10 minutes flat. No spreadsheet required.", ImageURL: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800", Category: "Finance"},
	{Caption: "Why I moved 30 percent of my portfolio into emerging market ETFs. Diversification beyond the S&P 500 is not optional anymore.", ImageURL: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800", Category: "Finance"},
	{Caption: "Negotiating your salary: a 5-step framework that got me a 40 percent raise. The key is timing and data.", ImageURL: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800", Category: "Finance"},
	{Caption: "Digital painting process video — 12 hours compressed into 60 seconds. This piece explores the intersection of nature and technology.", ImageURL: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800", Category: "Art"},
	{Caption: "Ink and watercolor study of morning light through stained glass. There is something meditative about letting the water guide the pigment.", ImageURL: "https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=800", Category: "Art"},
	{Caption: "Generative art piece created with p5.js — every frame is unique. Code is my new paintbrush.", ImageURL: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800", Category: "Art"},
	{Caption: "Street art walking tour in Berlin: the city that turns every wall into a canvas. Politics, beauty, and rebellion in spray paint.", ImageURL: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800", Category: "Art"},
	{Caption: "New track drop! Lo-fi hip hop beat with live-recorded jazz saxophone. Link in bio to stream on all platforms.", ImageURL: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800", Category: "Music"},
	{Caption: "Building a modular synthesizer from scratch — the oscillator is done and it sounds absolutely massive. Full build diary coming soon.", ImageURL: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800", Category: "Music"},
	{Caption: "Vinyl collection milestone: hit 500 records today. Here are my top 10 finds from this year including a rare first pressing of Kind of Blue.", ImageURL: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800", Category: "Music"},
	{Caption: "Home studio upgrade: treated my room with acoustic panels and the difference is night and day. Before and after frequency response graphs.", ImageURL: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800", Category: "Music"},
	{Caption: "Guitar cover of a classic Fleetwood Mac riff — learning the nuances of Buckingham fingerpicking style has been a game changer.", ImageURL: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800", Category: "Music"},
}

const seededPassword = "SeedUser123!"

func hashPassword(password string) string {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}
	return string(bytes)
}

func generateEngagement(likesBase int) (likes int, comments int, impressions int, rate float64) {
	likes = likesBase + rand.Intn(likesBase/3) - likesBase/6
	if likes < 5 {
		likes = 5 + rand.Intn(20)
	}
	comments = likes/8 + rand.Intn(5)
	impressions = likes * (10 + rand.Intn(20))
	rate = float64(likes+comments) / float64(impressions)
	if rate > 0.25 {
		rate = 0.15 + rand.Float64()*0.05
	}
	rate = math.Round(rate*10000) / 10000
	return
}

func randomPastDate(daysAgo int) time.Time {
	now := time.Now()
	days := rand.Intn(daysAgo)
	hours := rand.Intn(24)
	return now.AddDate(0, 0, -days).Add(-time.Duration(hours) * time.Hour)
}

func categoryIndex(category string) int {
	for i, c := range categories {
		if c == category {
			return i
		}
	}
	return 0
}

func Run() {
	log.Println("=== Seeding recommendation system data ===")

	if config.DB == nil {
		log.Fatal("config.DB is nil — call config.ConnectDB() before Run()")
	}

	createdUsers := make([]int, 0, len(users))
	passwordHash := hashPassword(seededPassword)

	for i, u := range users {
		var existingID int
		err := config.DB.QueryRow(
			"SELECT id FROM users WHERE email = $1", u.Email,
		).Scan(&existingID)

		if err == nil {
			log.Printf("User %s (%s) already exists with ID %d, skipping", u.Username, u.Email, existingID)
			createdUsers = append(createdUsers, existingID)
			continue
		}

		if err != sql.ErrNoRows {
			log.Printf("Error checking user %s: %v", u.Email, err)
			continue
		}

		var newID int
		err = config.DB.QueryRow(`
			INSERT INTO users (email, password, full_name, username, phone, age, role, image_url, bio, account_status, privacy_status, image_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', 'public', NULL)
			RETURNING id`,
			u.Email, passwordHash, u.FullName, u.Username,
			fmt.Sprintf("555-%04d", i+1), u.Age, u.Role, u.ImageURL, u.Bio,
		).Scan(&newID)

		if err != nil {
			log.Printf("Failed to create user %s: %v", u.Username, err)
			continue
		}

		log.Printf("Created user %s (ID: %d)", u.Username, newID)
		createdUsers = append(createdUsers, newID)
		insertInfluencerRow(newID, u, i)
	}

	if len(createdUsers) == 0 {
		log.Println("No users available — aborting post seeding")
		return
	}

	postCount := 0
	for _, p := range posts {
		userIdx := categoryIndex(p.Category)
		if userIdx >= len(createdUsers) {
			userIdx = userIdx % len(createdUsers)
		}
		userID := createdUsers[userIdx]

		likes, comments, impressions, rate := generateEngagement(80)
		createdAt := randomPastDate(60)

		var existingPostID int
		err := config.DB.QueryRow(
			"SELECT id FROM posts WHERE caption = $1 AND user_id = $2",
			p.Caption, userID,
		).Scan(&existingPostID)

		if err == nil {
			continue
		}

		_, err = config.DB.Exec(`
			INSERT INTO posts (user_id, caption, image_url, likes, comments_count, impressions, engagement_rate, is_sponsored, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			userID, p.Caption, p.ImageURL, likes, comments, impressions, rate,
			false, createdAt, createdAt,
		)

		if err != nil {
			log.Printf("Failed to insert post for user %d: %v", userID, err)
			continue
		}

		postCount++
	}

	log.Printf("Seeding complete: %d users active, %d posts inserted", len(createdUsers), postCount)
}

func insertInfluencerRow(userID int, u seedUser, idx int) {
	niches := []string{"Technology", "Travel", "Food", "Fitness", "Fashion", "Finance", "Art", "Music"}
	contentTypes := []string{"Reviews", "Photography", "Recipes", "Workouts", "Style Guides", "Analysis", "Illustrations", "Tutorials"}
	socialMedias := []string{"Instagram", "YouTube", "Instagram", "Instagram", "Instagram", "Twitter", "Instagram", "YouTube"}
	locations := []string{"San Francisco", "London", "Rome", "Seoul", "New York", "Singapore", "Mumbai", "Nashville"}
	audiences := []string{"Tech enthusiasts", "Travel lovers", "Foodies", "Fitness beginners", "Fashion conscious", "Young professionals", "Art collectors", "Musicians"}

	followers := 5000 + rand.Intn(95000)

	_, err := config.DB.Exec(`
		INSERT INTO influencers (user_id, social_media, social_media_link, followers, location, pricing, niche, content_type, target_audience)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id) DO NOTHING`,
		userID,
		socialMedias[idx],
		fmt.Sprintf("https://%s.com/@%s", socialMedias[idx], u.Username),
		followers,
		locations[idx],
		fmt.Sprintf("$%d/post", 200+rand.Intn(1800)),
		niches[idx],
		contentTypes[idx],
		audiences[idx],
	)

	if err != nil {
		log.Printf("Note: could not insert influencer row for user %d: %v", userID, err)
	}
}

func RunSQLOnly() string {
	var sb strings.Builder
	sb.WriteString("-- Seed data for recommendation system\n")
	sb.WriteString(fmt.Sprintf("-- Generated %s\n\n", time.Now().Format(time.RFC3339)))

	for i, u := range users {
		hash := hashPassword(seededPassword)
		sb.WriteString(fmt.Sprintf(`
INSERT INTO users (email, password, full_name, username, phone, age, role, image_url, bio, account_status, privacy_status, image_id)
VALUES ('%s', '%s', '%s', '%s', '555-%04d', %d, '%s', '%s', '%s', 'active', 'public', NULL)
ON CONFLICT (email) DO NOTHING;
`, u.Email, hash, u.FullName, u.Username, i+1, u.Age, u.Role, u.ImageURL, u.Bio))
	}

	sb.WriteString("\n-- Posts\n")
	for _, p := range posts {
		likes, comments, impressions, rate := generateEngagement(80)
		createdAt := randomPastDate(60)
		sb.WriteString(fmt.Sprintf(`
INSERT INTO posts (user_id, caption, image_url, likes, comments_count, impressions, engagement_rate, is_sponsored, created_at, updated_at)
VALUES ((SELECT id FROM users WHERE email = '%s'), '%s', '%s', %d, %d, %d, %.4f, false, '%s', '%s')
ON CONFLICT DO NOTHING;
`, users[categoryIndex(p.Category)].Email, escapeSQLString(p.Caption), p.ImageURL, likes, comments, impressions, rate, createdAt.Format(time.RFC3339), createdAt.Format(time.RFC3339)))
	}

	return sb.String()
}

func escapeSQLString(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}
