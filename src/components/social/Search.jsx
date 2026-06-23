// import { Search as SearchIcon, X } from 'lucide-react';
// import { useEffect, useState, useMemo, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { searchUsers, clearSearchResults } from '../../slice/searchSlice';
// import debounce from 'lodash.debounce';

// const MIN_SEARCH_LENGTH = 2;
// const DEBOUNCE_DELAY = 350;

// const UserSearch = ({ onClose }) => {
//   const [query, setQuery] = useState('');
//   const [localLoading, setLocalLoading] = useState(false);
//   const dispatch = useDispatch();
//   const { results, loading, error } = useSelector((state) => state.search);
//   const abortControllerRef = useRef(null);

//   // Memoized debounced search function
//   const debouncedSearch = useMemo(() => debounce(
//     async (searchQuery) => {
//       console.log('Debounced function called with:', searchQuery); // DEBUG
//       if (searchQuery.length >= MIN_SEARCH_LENGTH) {
//         console.log('Dispatching search action'); // DEBUG
//         try {
//           await dispatch(searchUsers(searchQuery));
//           console.log('Search dispatched successfully'); // DEBUG
//         } catch (err) {
//           console.error('Dispatch error:', err); // DEBUG
//         }
//       }
//     },
//     DEBOUNCE_DELAY
//   ), [dispatch]);
//   useEffect(() => {
//     console.log('Query changed:', query); // DEBUG
//     debouncedSearch(query);
//     return () => debouncedSearch.cancel();
//   }, [query, debouncedSearch]);

//   const isEmailSearch = query.includes('@');
//   const searchResults = Array.isArray(results) ? results : [];
//   const isLoading = localLoading || loading;

//   return (
//     <div className="fixed inset-0 z-50 bg-white p-4 overflow-y-auto">
//       <div className="flex items-center mb-6">
//         <button onClick={onClose} className="mr-4">
//           <X size={24} />
//         </button>
//         <div className="relative flex-1">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <SearchIcon size={20} className="text-gray-400" />
//           </div>
//           <input
//             type="text"
//             className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder={isEmailSearch ? "Search by email..." : "Search by username or name..."}
//             value={query}
//             onChange={(e) => setQuery(e.target.value.trim())}
//             autoFocus
//           />
//         </div>
//       </div>

//       {query.length > 0 && query.length < MIN_SEARCH_LENGTH && (
//         <div className="text-gray-500 mb-4">
//           Type at least {MIN_SEARCH_LENGTH} characters to search
//         </div>
//       )}

//       {error && (
//         <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
//           {error.message || 'Search failed'}
//         </div>
//       )}

//       {isLoading ? (
//         <div className="flex justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//         </div>
//       ) : searchResults.length > 0 ? (
//         <div className="space-y-4">
//           {searchResults.map((user) => (
//             <div
//               key={user.id}
//               className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
//             >
//               <img
//                 src={user.image_url || "/default-profile.jpg"}
//                 alt={user.username}
//                 className="w-12 h-12 rounded-full object-cover mr-3"
//               />
//               <div className="flex-1 min-w-0">
//                 <p className="font-medium truncate">{user.username}</p>
//                 <p className="text-sm text-gray-500 truncate">
//                   {user.full_name || user.email}
//                 </p>
//               </div>
//               <button className="px-4 py-1 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
//                 {user.isFollowing ? 'Following' : 'Follow'}
//               </button>
//             </div>
//           ))}
//         </div>
//       ) : query.length >= MIN_SEARCH_LENGTH && !isLoading && (
//         <div className="text-center py-8 text-gray-500">
//           No results found for "{query}"
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserSearch;

import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, clearSearchResults } from '../../slice/searchSlice';
import { followUser, unfollowUser } from '../../slice/followersSlice';
import debounce from 'lodash.debounce';

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_DELAY = 350;

const UserSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  
  // Get current user ID from your auth state
  const currentUserId = useSelector((state) => state.user.user?.id);
  
  // Get search results
  const { results, loading: searchLoading, error } = useSelector((state) => state.search);
  
  // Get followers list to check follow status
  const { list: followers } = useSelector((state) => state.followers);
  
  // Memoized debounced search function
  const debouncedSearch = useMemo(() => debounce(
    (searchQuery) => {
      if (searchQuery.length >= MIN_SEARCH_LENGTH) {
        dispatch(searchUsers(searchQuery));
      } else {
        dispatch(clearSearchResults());
      }
    },
    DEBOUNCE_DELAY
  ), [dispatch]);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  // Check if current user is following each result
  const searchResults = Array.isArray(results) ? results.map(user => ({
    ...user,
    isFollowing: followers.some(
      f => f.follower_id === currentUserId && f.following_id === user.id
    )
  })) : [];

  const handleFollowToggle = (userId, isCurrentlyFollowing) => {
    if (!currentUserId) return;
    
    if (isCurrentlyFollowing) {
      dispatch(unfollowUser({
        followerId: currentUserId,
        followingId: userId
      }));
    } else {
      dispatch(followUser({
        followerId: currentUserId,
        followingId: userId
      }));
    }
  };

  const isEmailSearch = query.includes('@');

  return (
    // <div className=" inset-0 z-50 bg-white p-4 overflow-y-auto">
    //   <div className="flex items-center mb-6">
    //     <div className="relative flex-1">
    //       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //         <SearchIcon size={20} className="text-gray-400" />
    //       </div>
    //       <input
    //         type="text"
    //         className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    //         placeholder={isEmailSearch ? "Search by email..." : "Search by username or name..."}
    //         value={query}
    //         onChange={(e) => setQuery(e.target.value.trim())}
    //         autoFocus
    //       />
    //     </div>
    //   </div>

    //   {query.length > 0 && query.length < MIN_SEARCH_LENGTH && (
    //     <div className="text-gray-500 mb-4">
    //       Type at least {MIN_SEARCH_LENGTH} characters to search
    //     </div>
    //   )}

    //   {error && (
    //     <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
    //       {error.message || 'Search failed'}
    //     </div>
    //   )}

    //   {searchLoading ? (
    //     <div className="flex justify-center py-8">
    //       <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    //     </div>
    //   ) : searchResults.length > 0 ? (
    //     <div className="space-y-4">
    //       {searchResults.map((user) => (
    //         <div
    //           key={user.id}
    //           className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
    //         >
    //           <img
    //             src={user.image_url || "/default-profile.jpg"}
    //             alt={user.username}
    //             className="w-12 h-12 rounded-full object-cover mr-3"
    //           />
    //           <div className="flex-1 min-w-0">
    //             <p className="font-medium truncate">{user.username}</p>
    //             <p className="text-sm text-gray-500 truncate">
    //               {user.full_name || user.email}
    //             </p>
    //           </div>
    //           <button 
    //             onClick={() => handleFollowToggle(user.id, user.isFollowing)}
    //             className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
    //               user.isFollowing 
    //                 ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
    //                 : 'bg-blue-500 text-white hover:bg-blue-600'
    //             }`}
    //           >
    //             {user.isFollowing ? 'Following' : 'Follow'}
    //           </button>
    //         </div>
    //       ))}
    //     </div>
    //   ) : query.length >= MIN_SEARCH_LENGTH && !searchLoading && (
    //     <div className="text-center py-8 text-gray-500">
    //       No results found for "{query}"
    //     </div>
    //   )}
    // </div>
    <div className="inset-0 z-50 bg-background p-6 overflow-y-auto rounded-2xl shadow-lg">
  {/* Search Input */}
  <div className="flex items-center mb-6">
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon size={20} className="text-muted-foreground" />
      </div>
      <input
        type="text"
        className="w-full py-2.5 pl-10 pr-4 rounded-lg border border-input bg-accent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        placeholder={
          isEmailSearch
            ? "Search by email..."
            : "Search by username or name..."
        }
        value={query}
        onChange={(e) => setQuery(e.target.value.trim())}
        autoFocus
      />
    </div>
  </div>

  {/* Validation Message */}
  {query.length > 0 && query.length < MIN_SEARCH_LENGTH && (
    <div className="text-sm text-muted-foreground mb-4">
      Type at least {MIN_SEARCH_LENGTH} characters to search
    </div>
  )}

  {/* Error Message */}
  {error && (
    <div className="text-destructive mb-4 p-3 bg-destructive/10 rounded-lg text-sm">
      {error.message || "Search failed"}
    </div>
  )}

  {/* Loading Spinner */}
  {searchLoading ? (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>
  ) : searchResults.length > 0 ? (
    <div className="space-y-3">
      {searchResults.map((user) => (
        <div
          key={user.id}
          className="flex items-center p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
        >
          <img
            src={user.image_url || "/default-profile.jpg"}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {user.username}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {user.full_name || user.email}
            </p>
          </div>
          <button
            onClick={() => handleFollowToggle(user.id, user.isFollowing)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm ${
              user.isFollowing
                ? "bg-secondary text-secondary-foreground hover:bg-muted"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {user.isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      ))}
    </div>
  ) : query.length >= MIN_SEARCH_LENGTH && !searchLoading && (
    <div className="text-center py-8 text-muted-foreground">
      No results found for “{query}”
    </div>
  )}
</div>

  );
};

export default UserSearch;