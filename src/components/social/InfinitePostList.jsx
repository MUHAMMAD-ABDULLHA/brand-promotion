// // src/components/social/InfinitePostList.jsx
// import { useInfinitePosts } from "../../api/postApi";
// import { useDispatch } from "react-redux";
// import { addPosts } from "../../slice/postsSlice";
// import PostCard from "./PostCard";
// import { useEffect } from "react";
// import { useSelector } from "react-redux";
// const InfinitePostList = () => {
//   const { user } = useSelector((state) => state.user);
//   const user_id = user?.id;
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePosts(user_id);
//   const dispatch = useDispatch();
  
//   // Flatten pages safely
//   const allPosts = data?.pages.flatMap((page) => {
//     if (!page) return [];
//     // If backend returns array
//     if (Array.isArray(page)) return page;
//     // If backend returns { data: [...] }
//     return page.data || [];
//   }) || [];
//   console.log("All fetched posts:", allPosts);
//   console.log(data);
//   // Sync posts to Redux
//   useEffect(() => {
//     if (allPosts.length) {
//       dispatch(addPosts(allPosts));
//     }
//   }, [data, dispatch]);

//   // Infinite scroll handler
//   const handleScroll = (e) => {
//     const { scrollTop, clientHeight, scrollHeight } = e.target.scrollingElement;
//     if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage) {
//       fetchNextPage();
//     }
//   };

//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   });

//   return (
//     // <div className="post-feed">
//     //   {allPosts.map((post) => (
//     //     <PostCard key={post.id} post={post} />
//     //   ))}
//     //   {isFetchingNextPage && <p>Loading more...</p>}
//     // </div>
//     <div className="post-feed w-full max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
//       {allPosts.map((post) => (
//         <PostCard key={post.id} post={post} />
//       ))}

//       {isFetchingNextPage && (
//         <div className="flex justify-center py-6">
//           <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
//         </div>
//       )}
//     </div>

//   );
// };

// export default InfinitePostList;


// import { useInfinitePosts } from "../../api/postApi";
// import { useDispatch, useSelector } from "react-redux";
// import { addPosts } from "../../slice/postsSlice";
// import PostCard from "./PostCard";
// import { useEffect, useMemo } from "react";

// const InfinitePostList = () => {
//   const { user } = useSelector((state) => state.user);
//   const user_id = user?.id;

//   const {
//     data,
//     fetchNextPage,
//     hasNextPage,
//     isFetchingNextPage,
//   } = useInfinitePosts(user_id);

//   const dispatch = useDispatch();

//   // ---------- FIX 1: Memoize extracted posts ----------
//   const allPosts = useMemo(() => {
//     if (!data?.pages) return [];

//     return data.pages.flatMap((page) => {
//       // Backend structure: [ { posts: [...] } ]
//       if (Array.isArray(page)) {
//         return page[0]?.posts || [];
//       }

//       // Fallback (in case)
//       return page.posts || [];
//     });
//   }, [data]);

//   // ---------- FIX 2: Only update Redux when posts change ----------
//   useEffect(() => {
//     if (allPosts.length > 0) {
//       dispatch(addPosts(allPosts));
//     }
//   }, [allPosts, dispatch]);

//   // ---------- Infinite scroll ----------
//   const handleScroll = (e) => {
//     const { scrollTop, clientHeight, scrollHeight } =
//       e.target.scrollingElement;

//     if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage) {
//       fetchNextPage();
//     }
//   };

//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   });

//   return (
//     <div className="post-feed w-full max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
//       {allPosts.map((post) => (
//         <PostCard key={post.id} post={post} />
//       ))}

//       {isFetchingNextPage && (
//         <div className="flex justify-center py-6">
//           <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InfinitePostList;


import { useInfinitePosts } from "../../api/postApi";
import { useDispatch, useSelector } from "react-redux";
import { addPosts } from "../../slice/postsSlice";
import PostCard from "./PostCard";
import { useEffect, useMemo } from "react";

const InfinitePostList = () => {
  const { user } = useSelector((state) => state.user);
  const user_id = user?.id;

  console.log("🔹 [InfinitePostList] Current user ID:", user_id);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(user_id);

  const dispatch = useDispatch();

  // ---------- FIX 1: Memoize extracted posts ----------
  const allPosts = useMemo(() => {
    if (!data?.pages) {
      console.log("⚠️ [InfinitePostList] No pages found in data yet");
      return [];
    }

    const flattened = data.pages.flatMap((page, idx) => {
      console.log(`🔹 [InfinitePostList] Processing page ${idx}:`, page);

      // Backend structure: [ { posts: [...] } ]
      if (Array.isArray(page)) {
        const posts = page|| [];
        console.log(`  ➡️ Found ${posts.length} posts in page array`);
        return posts;
      }

      // Fallback (in case)
      const posts = page.posts || [];
      console.log(`  ➡️ Found ${posts.length} posts in page object`);
      return posts;
    });

    console.log(`🔹 [InfinitePostList] Total flattened posts: ${flattened.length}`);
    return flattened;
  }, [data]);

  // ---------- FIX 2: Only update Redux when posts change ----------
  useEffect(() => {
    console.log(`🔹 [InfinitePostList] Updating Redux with ${allPosts.length} posts`);
    if (allPosts.length > 0) {
      dispatch(addPosts(allPosts));
    }
  }, [allPosts, dispatch]);

  // ---------- Infinite scroll ----------
  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target.scrollingElement;
    // Log scrolling

    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage) {
      fetchNextPage();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasNextPage, fetchNextPage]);

  console.log("🔹 [InfinitePostList] Rendering posts:", allPosts.map((p) => p.id));

  return (
    <div className="post-feed w-full max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default InfinitePostList;
