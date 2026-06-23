// // backend/ws/hub.go
// package ws

// import (
// 	"log"
// 	"sync"

// 	"github.com/gorilla/websocket"
// )

// type Client struct {
// 	UserID int
// 	Conn   *websocket.Conn
// 	Mutex  sync.Mutex // protect writes
// }

// type Hub struct {
// 	clientsByUser map[int]*Client
// 	mu            sync.RWMutex
// }

// var DefaultHub = &Hub{
// 	clientsByUser: make(map[int]*Client),
// }

// func (h *Hub) AddClient(userID int, client *Client) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	h.clientsByUser[userID] = client
// 	log.Printf("[WS Hub] Added client user=%d", userID)
// }

// func (h *Hub) RemoveClient(userID int) {
// 	h.mu.Lock()
// 	defer h.mu.Unlock()
// 	if _, ok := h.clientsByUser[userID]; ok {
// 		delete(h.clientsByUser, userID)
// 		log.Printf("[WS Hub] Removed client user=%d", userID)
// 	}
// }

// func (h *Hub) GetClient(userID int) (*Client, bool) {
// 	h.mu.RLock()
// 	defer h.mu.RUnlock()
// 	c, ok := h.clientsByUser[userID]
// 	return c, ok
// }

// func (c *Client) SendJSON(v interface{}) error {
// 	c.Mutex.Lock()
// 	defer c.Mutex.Unlock()
// 	return c.Conn.WriteJSON(v)
// }

// backend/ws/hub.go
package ws

import (
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type Client struct {
	UserID int
	Conn   *websocket.Conn
	Mutex  sync.Mutex // protect writes
}

type Hub struct {
	clientsByUser map[int]*Client
	mu            sync.RWMutex
}

var DefaultHub = &Hub{
	clientsByUser: make(map[int]*Client),
}

func (h *Hub) AddClient(userID int, client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clientsByUser[userID] = client
	log.Printf("[WS Hub] Added client user=%d", userID)
}

func (h *Hub) RemoveClient(userID int) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if client, ok := h.clientsByUser[userID]; ok {
		delete(h.clientsByUser, userID)
		client.Conn.Close()
		log.Printf("[WS Hub] Removed client user=%d", userID)
	}
}

func (h *Hub) GetClient(userID int) (*Client, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	c, ok := h.clientsByUser[userID]
	return c, ok
}

// BroadcastToConversation sends a message to all participants in a conversation
func (h *Hub) BroadcastToConversation(conversationID int, message interface{}) {
	// In a real implementation, you would:
	// 1. Query DB for conversation members
	// 2. Send to each online member
	// For now, we'll broadcast to all connected clients
	h.mu.RLock()
	defer h.mu.RUnlock()

	for userID, client := range h.clientsByUser {
		err := client.SendJSON(message)
		if err != nil {
			log.Printf("[WS Hub] Error sending to user %d: %v", userID, err)
			go h.RemoveClient(userID) // Clean up in separate goroutine
		}
	}
}

func (c *Client) SendJSON(v interface{}) error {
	c.Mutex.Lock()
	defer c.Mutex.Unlock()
	return c.Conn.WriteJSON(v)
}
