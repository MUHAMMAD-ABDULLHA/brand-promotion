package data

import (
	"os"
	"testing"
)

func TestLoadPosts(t *testing.T) {
	// Use absolute path for test
	cwd, _ := os.Getwd()
	t.Logf("Working dir: %s", cwd)

	posts, err := GetRecentPosts()
	if err != nil {
		t.Fatalf("GetRecentPosts failed: %v", err)
	}
	if len(posts) == 0 {
		t.Fatal("GetRecentPosts returned 0 posts")
	}
	t.Logf("Loaded %d posts", len(posts))
	t.Logf("First: ID=%d UserID=%d Caption=%s", posts[0].ID, posts[0].UserID, posts[0].Caption[:50])
}

func TestGetRecentPostsPaginated(t *testing.T) {
	posts, err := GetRecentPostsPaginated(10, 0)
	if err != nil {
		t.Fatalf("GetRecentPostsPaginated failed: %v", err)
	}
	if len(posts) != 10 {
		t.Fatalf("expected 10 posts, got %d", len(posts))
	}
	t.Logf("Got %d posts (limit=10, offset=0)", len(posts))
}

func TestGetPostsByIDs(t *testing.T) {
	posts, err := GetPostsByIDs([]int{1, 3, 5})
	if err != nil {
		t.Fatalf("GetPostsByIDs failed: %v", err)
	}
	if len(posts) != 3 {
		t.Fatalf("expected 3 posts, got %d", len(posts))
	}
	t.Logf("Got %d posts by IDs", len(posts))
}
