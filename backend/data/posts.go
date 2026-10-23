package data

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
	"vite-project/backend/models"
)

type jsonPost struct {
	ID             int     `json:"id"`
	UserID         int     `json:"user_id"`
	Caption        string  `json:"caption"`
	ImageURL       string  `json:"image_url"`
	Likes          int     `json:"likes"`
	CommentsCount  int     `json:"comments_count"`
	Impressions    int     `json:"impressions"`
	EngagementRate float64 `json:"engagement_rate"`
	IsSponsored    bool    `json:"is_sponsored"`
	CreatedAt      string  `json:"created_at"`
}

type jsonUser struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	FullName  string `json:"full_name"`
	Bio       string `json:"bio"`
	Niche     string `json:"niche"`
	Followers int    `json:"followers"`
	ImageURL  string `json:"image_url"`
}

type store struct {
	mu         sync.RWMutex
	posts      []models.Post
	users      []jsonUser
	loaded     bool
	loadedAt   time.Time
	postsPath  string
	usersPath  string
}

var defaultStore = &store{
	postsPath: filepath.Join("data", "posts.json"),
	usersPath: filepath.Join("data", "users.json"),
}

func SetPaths(postsPath, usersPath string) {
	defaultStore.mu.Lock()
	defer defaultStore.mu.Unlock()
	defaultStore.postsPath = postsPath
	defaultStore.usersPath = usersPath
	defaultStore.loaded = false
}

func load() error {
	defaultStore.mu.Lock()
	defer defaultStore.mu.Unlock()

	if defaultStore.loaded && time.Since(defaultStore.loadedAt) < 30*time.Second {
		return nil
	}

	posts, err := readPostsFile(defaultStore.postsPath)
	if err != nil {
		return err
	}

	users, err := readUsersFile(defaultStore.usersPath)
	if err != nil {
		log.Printf("WARN: could not load users file: %v", err)
		users = nil
	}

	defaultStore.posts = posts
	defaultStore.users = users
	defaultStore.loaded = true
	defaultStore.loadedAt = time.Now()
	log.Printf("DATA: loaded %d posts and %d users from JSON", len(posts), len(users))
	return nil
}

func readPostsFile(path string) ([]models.Post, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("posts data file not found at %s — run the scraper first: cd backend && python scraper/scrape_instagram.py", path)
		}
		return nil, fmt.Errorf("failed to read %s: %w", path, err)
	}

	var jp []jsonPost
	if err := json.Unmarshal(raw, &jp); err != nil {
		return nil, fmt.Errorf("failed to parse %s: %w", path, err)
	}

	posts := make([]models.Post, 0, len(jp))
	for _, j := range jp {
		createdAt, _ := time.Parse(time.RFC3339, j.CreatedAt)
		if createdAt.IsZero() {
			createdAt, _ = time.Parse("2006-01-02T15:04:05.999999", j.CreatedAt)
		}
		if createdAt.IsZero() {
			createdAt = time.Now()
		}
		posts = append(posts, models.Post{
			ID:             j.ID,
			UserID:         j.UserID,
			Caption:        j.Caption,
			ImageURL:       j.ImageURL,
			Likes:          j.Likes,
			CommentsCount:  j.CommentsCount,
			Impressions:    j.Impressions,
			EngagementRate: j.EngagementRate,
			IsSponsored:    j.IsSponsored,
			CreatedAt:      createdAt,
			UpdatedAt:      createdAt,
		})
	}

	return posts, nil
}

func readUsersFile(path string) ([]jsonUser, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var users []jsonUser
	if err := json.Unmarshal(raw, &users); err != nil {
		return nil, err
	}
	return users, nil
}

func GetRecentPosts() ([]models.Post, error) {
	if err := load(); err != nil {
		return nil, err
	}
	defaultStore.mu.RLock()
	defer defaultStore.mu.RUnlock()

	out := make([]models.Post, len(defaultStore.posts))
	copy(out, defaultStore.posts)

	sort.Slice(out, func(i, j int) bool {
		return out[i].CreatedAt.After(out[j].CreatedAt)
	})

	return out, nil
}

func GetRecentPostsPaginated(limit, offset int) ([]models.Post, error) {
	if err := load(); err != nil {
		return nil, err
	}
	defaultStore.mu.RLock()
	defer defaultStore.mu.RUnlock()

	sorted := make([]models.Post, len(defaultStore.posts))
	copy(sorted, defaultStore.posts)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i].CreatedAt.After(sorted[j].CreatedAt)
	})

	if offset > len(sorted) {
		return []models.Post{}, nil
	}

	end := offset + limit
	if end > len(sorted) {
		end = len(sorted)
	}

	return sorted[offset:end], nil
}

func GetPostsByIDs(ids []int) ([]models.Post, error) {
	if err := load(); err != nil {
		return nil, err
	}
	defaultStore.mu.RLock()
	defer defaultStore.mu.RUnlock()

	lookup := make(map[int]models.Post, len(defaultStore.posts))
	for _, p := range defaultStore.posts {
		lookup[p.ID] = p
	}

	ordered := make([]models.Post, 0, len(ids))
	for _, id := range ids {
		if p, ok := lookup[id]; ok {
			ordered = append(ordered, p)
		}
	}

	return ordered, nil
}

func Reload() error {
	defaultStore.mu.Lock()
	defer defaultStore.mu.Unlock()
	defaultStore.loaded = false
	return load()
}
