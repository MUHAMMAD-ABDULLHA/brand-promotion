import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../slice/messagingSlice";
import { FiSearch, FiMessageSquare } from "react-icons/fi";

const MessagingList = ({ onSelectConversation, selectedId }) => {
  const dispatch = useDispatch();
  const { conversations, loading, error } = useSelector(
    (state) => state.messaging
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Filter conversations based on ID or Type (expand as needed)
  const filteredConversations = conversations.filter((conv) => 
    String(conv.id).includes(searchTerm) || 
    conv.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // 1. MATCHED HEIGHT & STYLE: h-[85vh], min-h-[600px], consistent borders/shadows
    <div className="flex flex-col w-full h-[0vh] min-h-[1000px] bg-card text-card-foreground shadow-lg border border-border overflow-hidden rounded-xl">
      
      {/* Header & Search */}
      <div className="p-4 border-b border-border bg-card shrink-0 space-y-3">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold">Messages</h2>
           <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
             {conversations.length}
           </span>
        </div>
        
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-6 text-center text-muted-foreground text-sm animate-pulse">
            Loading chats...
          </div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500 text-sm">
            Error loading chats
          </div>
        )}

        {!loading && filteredConversations.length === 0 && (
          <div className="p-8 flex flex-col items-center justify-center text-muted-foreground text-center">
            <FiMessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No conversations found.</p>
          </div>
        )}

        <ul className="divide-y divide-border">
          {filteredConversations.map((conv) => {
            // Check if this is the currently open chat
            const isActive = Number(selectedId) === Number(conv.id);

            return (
              <li
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`cursor-pointer p-4 transition-colors flex items-center gap-3 ${
                  isActive 
                    ? "bg-primary/5 border-l-4 border-primary" // Active State
                    : "hover:bg-accent/50 border-l-4 border-transparent"
                }`}
              >
                {/* Avatar Placeholder */}
                <div className="relative shrink-0">
                   <img
                    src={`https://ui-avatars.com/api/?name=Conversation+${conv.id}&background=random`}
                    alt={`Conversation ${conv.id}`}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  {/* Online Indicator (Optional) */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold truncate text-sm ${isActive ? "text-primary" : "text-foreground"}`}>
                      {conv.name || `Conversation #${conv.id}`}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground truncate">
                    <span className="capitalize bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground mr-1">
                        {conv.type}
                    </span>
                    Campaign ID: {conv.campaign_id}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MessagingList;
