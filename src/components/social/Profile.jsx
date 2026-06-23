// import { useSelector, useDispatch } from "react-redux";
// import { Grid3x3, Bookmark, Settings, Heart, MessageCircle } from "lucide-react";
// import { useEffect } from "react";
// import { fetchUserPosts } from "../../slice/postsSlice";
// import { fetchFollowers, followUser, unfollowUser, fetchFollowingCount } from "../../slice/followersSlice";

// function Profile() {
//     const user = useSelector(state => state.user.user);
//     const posts = useSelector(state => state.posts.posts);
//     const loading = useSelector(state => state.posts.loading);
//     const followers = useSelector(state => state.followers.list);
//     const followersLoading = useSelector(state => state.followers.loading);
//     const { followingCount } = useSelector((state) => state.followers.followingCount);
//     const currentUserId = useSelector(state => state.user.currentUser?.id);
//     const dispatch = useDispatch();
    
//     useEffect(() => {
//       if (user?.id) {
//         dispatch(fetchUserPosts(user.id));
//         dispatch(fetchFollowers(user.id));
//         dispatch(fetchFollowingCount(user.id));
//       }
//     }, [user, dispatch]);

//     if (!user) return <div>Loading profile...</div>;
    
//     // Calculate counts
//     const postCount = posts?.length || 0;
//     const followersCount = followers.filter(f => f.following_id === user.id).length;
//     // const followingCount = followers.filter(f => f.follower_id === user.id).length;

//     // Check if current user is following this profile
    
//     const isFollowing = currentUserId && followers.some(
//       f => f.follower_id === currentUserId && f.following_id === user.id
//     );


//     const handleFollowToggle = () => {
//       if (!currentUserId) return;
      
//       if (isFollowing) {
//         dispatch(unfollowUser({ followerId: currentUserId, followingId: user.id }));
//       } else {
//         dispatch(followUser({ followerId: currentUserId, followingId: user.id }));
//       }
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             {/* Profile Header */}
//             <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
//                 {/* Profile Picture */}
//                 <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200">
//                     <img 
//                         src={user.image || "/default-profile.jpg"} 
//                         alt="Profile" 
//                         className="w-full h-full object-cover"
//                     />
//                 </div>
                
//                 {/* Profile Info */}
//                 <div className="flex-1">
//                     <div className="flex items-center gap-4 mb-4">
//                         <h1 className="text-xl font-light">{user.username}</h1>
                    
//                         <button className="p-1">
//                             <Settings size={20} />
//                         </button>
//                     </div>
                    
//                     <div className="flex gap-8 mb-4">
//                         <div className="text-center">
//                             <span className="font-semibold">{postCount}</span>
//                             <p className="text-sm">Posts</p>
//                         </div>
//                         <div className="text-center">
//                             <span className="font-semibold">{followersCount}</span>
//                             <p className="text-sm">Followers</p>
//                         </div>
//                         <div className="text-center">
//                             <span className="font-semibold">{followingCount}</span>
//                             <p className="text-sm">Following</p>
//                         </div>
//                     </div>
                    
//                     <div>
//                         <h2 className="font-semibold">{user.full_name}</h2>
//                         <p className="text-sm">{user.bio || "No bio yet"}</p>
//                     </div>
//                 </div>
//             </div>
            
//             {/* Rest of your component remains the same */}
//             {/* Tabs */}
//             <div className="border-t border-gray-200 flex justify-center">
//                 <button className="flex items-center gap-1 px-4 py-3 border-t border-black text-sm font-medium">
//                     <Grid3x3 size={16} />
//                     POSTS
//                 </button>
//                 <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-gray-500">
//                     <Bookmark size={16} />
//                     SAVED
//                 </button>
//             </div>
            
//             {/* Posts Grid */}
//             {loading ? (
//                 <div className="flex justify-center py-8">Loading posts...</div>
//             ) : postCount === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-12">
//                     <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
//                         <Grid3x3 size={24} />
//                     </div>
//                     <h2 className="text-2xl font-light">No Posts Yet</h2>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-3 gap-1">
//                     {posts.map((post) => (
//                         <div key={post.id} className="aspect-square bg-gray-100 relative group">
//                             <img 
//                                 src={post.image_url || `https://picsum.photos/500/500?random=${post.id}`} 
//                                 alt={`Post ${post.id}`}
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                                 <div className="flex gap-4 text-black font-semibold">
//                                     <span className="flex items-center gap-1">
//                                         <Heart size={18} /> {post.likes || 0}
//                                     </span>
//                                     <span className="flex items-center gap-1">
//                                         <MessageCircle size={18} /> {post.commentsCount || 0}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Profile;

// import { useSelector, useDispatch } from "react-redux";
// import { Grid3x3, Bookmark, Settings, Heart, MessageCircle } from "lucide-react";
// import { useEffect } from "react";
// import { fetchUserPosts } from "../../slice/postsSlice";
// import { fetchFollowers, followUser, unfollowUser, fetchFollowingCount } from "../../slice/followersSlice";

// function Profile() {
//     const user = useSelector(state => state.user.user);
//     const posts = useSelector(state => state.posts.posts);
//     const loading = useSelector(state => state.posts.loading);
//     const followers = useSelector(state => state.followers.list);
//     const followersLoading = useSelector(state => state.followers.loading);
//     const followingCount  = useSelector((state) => state.followers.followingCount);
//     console.log("following count ", followingCount)
//     const currentUserId = useSelector(state => state.user.currentUser?.id);
//     const dispatch = useDispatch();
    
//     useEffect(() => {
//       if (user?.id) {
//         dispatch(fetchUserPosts(user.id));
//         dispatch(fetchFollowers(user.id));
//         dispatch(fetchFollowingCount(user.id));
//       }
//     }, [user, dispatch]);

//     if (!user) return <div>Loading profile...</div>;
    
//     // Calculate counts
//     const postCount = posts?.length || 0;
//     const followersCount = followers.filter(f => f.following_id === user.id).length;
//     // const followingCount = followers.filter(f => f.follower_id === user.id).length;

//     // Check if current user is following this profile
    
//     const isFollowing = currentUserId && followers.some(
//       f => f.follower_id === currentUserId && f.following_id === user.id
//     );


//     const handleFollowToggle = () => {
//       if (!currentUserId) return;
      
//       if (isFollowing) {
//         dispatch(unfollowUser({ followerId: currentUserId, followingId: user.id }));
//       } else {
//         dispatch(followUser({ followerId: currentUserId, followingId: user.id }));
//       }
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             {/* Profile Header */}
//             <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
//                 {/* Profile Picture */}
//                 <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200">
//                     <img 
//                         src={user.image || "/default-profile.jpg"} 
//                         alt="Profile" 
//                         className="w-full h-full object-cover"
//                     />
//                 </div>
                
//                 {/* Profile Info */}
//                 <div className="flex-1 text-black">
//                     <div className="flex items-center gap-4 mb-4">
//                         <h1 className="text-xl font-light">{user.username}</h1>
                    
//                         <button className="p-1">
//                             <Settings size={20} />
//                         </button>
//                     </div>
                    
//                     <div className="flex gap-8 mb-4">
//                         <div className="text-center">
//                             <span className="font-semibold">{postCount}</span>
//                             <p className="text-sm">Posts</p>
//                         </div>
//                         <div className="text-center">
//                             <span className="font-semibold">{followersCount}</span>
//                             <p className="text-sm">Followers</p>
//                         </div>
//                         <div className="text-center">
//                             <span className="font-semibold">{followingCount}</span>
//                             <p className="text-sm">Following</p>
//                         </div>
//                     </div>
                    
//                     <div>
//                         <h2 className="font-semibold">{user.full_name}</h2>
//                         <p className="text-sm">{user.bio || "No bio yet"}</p>
//                     </div>
//                 </div>
//             </div>
            
//             {/* Rest of your component remains the same */}
//             {/* Tabs */}
//             <div className="border-t border-gray-200 flex justify-center">
//                 <button className="flex items-center text-primary gap-1 px-4 py-3 border-t border-primary text-sm font-medium">
//                     <Grid3x3 size={16} />
//                     POSTS
//                 </button>
//                 <button className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-primary">
//                     <Bookmark size={16} />
//                     SAVED
//                 </button>
//             </div>
            
//             {/* Posts Grid */}
//             {loading ? (
//                 <div className="flex justify-center py-8">Loading posts...</div>
//             ) : postCount === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-12">
//                     <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
//                         <Grid3x3 size={24} />
//                     </div>
//                     <h2 className="text-2xl font-light">No Posts Yet</h2>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-3 gap-1">
//                     {posts.map((post) => (
//                         <div key={post.id} className="aspect-square bg-gray-100 relative group">
//                             <img 
//                                 src={post.image_url || `https://picsum.photos/500/500?random=${post.id}`} 
//                                 alt={`Post ${post.id}`}
//                                 className="w-full h-full object-cover"
//                             />
//                             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                                 <div className="flex gap-4 text-black font-semibold">
//                                     <span className="flex items-center gap-1">
//                                         <Heart size={18} /> {post.likes || 0}
//                                     </span>
//                                     <span className="flex items-center gap-1">
//                                         <MessageCircle size={18} /> {post.commentsCount || 0}
//                                     </span>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Profile;


// src/components/profile/Profile.jsx
import { useSelector, useDispatch } from "react-redux";
import { Grid3x3, Bookmark, Settings, Heart, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUserPosts, getSavedPosts } from "../../slice/postsSlice";
import { fetchFollowers, fetchFollowingCount } from "../../slice/followersSlice";

function Profile() {
  const user = useSelector((state) => state.user.user);
  const currentUserId = useSelector((state) => state.user.currentUser?.id);
  console.log("profile current user id", currentUserId);
    console.log("profile user id", user.id);
  const posts = useSelector((state) => state.posts.posts);
  const saved = useSelector((state) => state.posts.savedPost); // array of saved objects
  const loadingPosts = useSelector((state) => state.posts.loading);

  const followers = useSelector((state) => state.followers.list);
  const followingCount = useSelector((state) => state.followers.followingCount);

  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "saved"

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserPosts(user.id));
      dispatch(fetchFollowers(user.id));
      dispatch(fetchFollowingCount(user.id));
      dispatch(getSavedPosts(user.id));
    }
  }, [user, dispatch]);

  if (!user) return <div>Loading profile...</div>;

  // Counts
  const postCount = posts?.length || 0;
  const savedCount = saved?.length || 0;
  const followersCount = followers.filter((f) => f.following_id === user.id).length;

  // Check if current user follows this profile
  // const isFollowing =
  //   currentUserId &&
  //   followers.some((f) => f.follower_id === currentUserId && f.following_id === user.id);

  // const handleFollowToggle = () => {
  //   if (!currentUserId) return;

  //   if (isFollowing) {
  //     dispatch(unfollowUser({ followerId: currentUserId, followingId: user.id }));
  //   } else {
  //     dispatch(followUser({ followerId: currentUserId, followingId: user.id }));
  //   }
  // };

  return (
    // <div className="max-w-4xl mx-auto p-4">
    //   {/* Profile Header */}
    //   <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
    //     {/* Profile Picture */}
    //     <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200">
    //       <img
    //         src={user.image || "/default-profile.jpg"}
    //         alt="Profile"
    //         className="w-full h-full object-cover"
    //       />
    //     </div>

    //     {/* Profile Info */}
    //     <div className="flex-1 text-black">
    //       <div className="flex items-center gap-4 mb-4">
    //         <h1 className="text-xl font-light">{user.username}</h1>

    //         {/* {currentUserId !== user.id && (
    //           <button
    //             onClick={handleFollowToggle}
    //             className="px-3 py-1 bg-primary text-black rounded-md"
    //           >
    //             {isFollowing ? "Unfollow" : "Follow"}
    //           </button>
    //         )} */}

    //         {currentUserId === user.id && (
    //           <button className="p-1">
    //             <Settings size={20} />
    //           </button>
    //         )}
    //       </div>

    //       <div className="flex gap-8 mb-4">
    //         <div className="text-center">
    //           <span className="font-semibold">{postCount}</span>
    //           <p className="text-sm">Posts</p>
    //         </div>
    //         <div className="text-center">
    //           <span className="font-semibold">{followersCount}</span>
    //           <p className="text-sm">Followers</p>
    //         </div>
    //         <div className="text-center">
    //           <span className="font-semibold">{followingCount}</span>
    //           <p className="text-sm">Following</p>
    //         </div>
    //       </div>

    //       <div>
    //         <h2 className="font-semibold">{user.full_name}</h2>
    //         <p className="text-sm">{user.bio || "No bio yet"}</p>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Tabs */}
    //   <div className="border-t border-gray-200 flex justify-center">
    //     <button
    //       onClick={() => setActiveTab("posts")}
    //       className={`flex items-center gap-1 px-4 py-3 text-sm font-medium ${
    //         activeTab === "posts" ? "text-primary border-t border-primary" : "text-muted-foreground"
    //       }`}
    //     >
    //       <Grid3x3 size={16} />
    //       POSTS
    //     </button>
    //     <button
    //       onClick={() => setActiveTab("saved")}
    //       className={`flex items-center gap-1 px-4 py-3 text-sm font-medium ${
    //         activeTab === "saved" ? "text-primary border-t border-primary" : "text-muted-foreground"
    //       }`}
    //     >
    //       <Bookmark size={16} />
    //       SAVED
    //     </button>
    //   </div>

    //   {/* Tab Content */}
    //   <div className="mt-6">
    //     {/* Posts Tab */}
    //     {activeTab === "posts" && (
    //       <>
    //         {loadingPosts ? (
    //           <div className="flex justify-center py-8">Loading posts...</div>
    //         ) : postCount === 0 ? (
    //           <div className="flex flex-col items-center justify-center py-12">
    //             <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center mb-4">
    //               <Grid3x3 size={24} />
    //             </div>
    //             <h2 className="text-2xl font-light">No Posts Yet</h2>
    //           </div>
    //         ) : (
    //           <div className="grid grid-cols-3 gap-1">
    //             {posts.map((post) => (
    //               <div key={post.id} className="aspect-square bg-gray-100 relative group">
    //                 <img
    //                   src={
    //                     post.image_url || `https://picsum.photos/500/500?random=${post.id}`
    //                   }
    //                   alt={`Post ${post.id}`}
    //                   className="w-full h-full object-cover"
    //                 />
    //                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
    //                   <div className="flex gap-4 text-black font-semibold">
    //                     <span className="flex items-center gap-1">
    //                       <Heart size={18} /> {post.likes || 0}
    //                     </span>
    //                     <span className="flex items-center gap-1">
    //                       <MessageCircle size={18} /> {post.commentsCount || 0}
    //                     </span>
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </>
    //     )}

    //     {/* Saved Tab */}
    //     {activeTab === "saved" && (
    //       <>
    //         {savedCount === 0 ? (
    //           <div className="flex flex-col items-center justify-center py-12">
    //             <Bookmark size={24} />
    //             <h2 className="text-2xl font-light mt-2">No Saved Posts</h2>
    //           </div>
    //         ) : (
    //           <div className="grid grid-cols-3 gap-1">
    //             {saved.map((s) => (
    //               <div key={s.id} className="aspect-square bg-gray-100 relative group">
    //                 <img
    //                   src={
    //                     s.post?.image_url ||
    //                     `https://picsum.photos/500/500?random=${s.post?.id}`
    //                   }
    //                   alt={`Saved Post ${s.post?.id}`}
    //                   className="w-full h-full object-cover"
    //                 />
    //                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
    //                   <div className="flex gap-4 text-black font-semibold">
    //                     <span className="flex items-center gap-1">
    //                       <Heart size={18} /> {s.post?.likes || 0}
    //                     </span>
    //                     <span className="flex items-center gap-1">
    //                       <MessageCircle size={18} /> {s.post?.commentsCount || 0}
    //                     </span>
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </>
    //     )}
    //   </div>
    // </div>
    <div className="max-w-4xl mx-auto p-4">
  {/* Profile Header */}
  <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
    {/* Profile Picture */}
    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-200">
      <img
        src={user.image || "/default-profile.jpg"}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </div>

    {/* Profile Info */}
    <div className="flex-1 text-foreground">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-xl font-light">{user.username}</h1>

        {/* {currentUserId !== user.id && (
          <button
            onClick={handleFollowToggle}
            className="px-3 py-1 bg-primary text-black rounded-md"
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )} */}

        {currentUserId === user.id && (
          <button className="p-1">
            <Settings size={20} />
          </button>
        )}
      </div>

      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <span className="font-semibold">{postCount}</span>
          <p className="text-sm">Posts</p>
        </div>
        <div className="text-center">
          <span className="font-semibold">{followersCount}</span>
          <p className="text-sm">Followers</p>
        </div>
        <div className="text-center">
          <span className="font-semibold">{followingCount}</span>
          <p className="text-sm">Following</p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold">{user.full_name}</h2>
        <p className="text-sm">{user.bio || "No bio yet"}</p>
      </div>
    </div>
  </div>

  {/* Tabs */}
  <div className="border-t border-gray-200 flex justify-center">
    <button
      onClick={() => setActiveTab("posts")}
      className={`flex items-center gap-1 px-4 py-3 text-sm font-medium ${
        activeTab === "posts"
          ? "text-primary border-t border-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Grid3x3 size={16} />
      POSTS
    </button>
    <button
      onClick={() => setActiveTab("saved")}
      className={`flex items-center gap-1 px-4 py-3 text-sm font-medium ${
        activeTab === "saved"
          ? "text-primary border-t border-primary"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Bookmark size={16} />
      SAVED
    </button>
  </div>

  {/* Tab Content */}
  <div className="mt-6 text-foreground">
    {/* Posts Tab */}
    {activeTab === "posts" && (
      <>
        {loadingPosts ? (
          <div className="flex justify-center py-8">Loading posts...</div>
        ) : postCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-2 border-border rounded-full flex items-center justify-center mb-4">
              <Grid3x3 size={24} />
            </div>
            <h2 className="text-2xl font-light">No Posts Yet</h2>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div key={post.id} className="aspect-square bg-gray-100 relative group">
                <img
                  src={
                    post.image_url || `https://picsum.photos/500/500?random=${post.id}`
                  }
                  alt={`Post ${post.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-4 text-white font-semibold">
                    <span className="flex items-center gap-1">
                      <Heart size={18} /> {post.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={18} /> {post.commentsCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}

    {/* Saved Tab */}
    {activeTab === "saved" && (
      <>
        {savedCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bookmark size={24} />
            <h2 className="text-2xl font-light mt-2">No Saved Posts</h2>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {saved.map((s) => (
              <div key={s.id} className="aspect-square bg-gray-100 relative group">
                <img
                  src={
                    s.post?.image_url ||
                    `https://picsum.photos/500/500?random=${s.post?.id}`
                  }
                  alt={`Saved Post ${s.post?.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-4 text-white font-semibold">
                    <span className="flex items-center gap-1">
                      <Heart size={18} /> {s.post?.likes || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={18} /> {s.post?.commentsCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}
  </div>
</div>

  );
}

export default Profile;
