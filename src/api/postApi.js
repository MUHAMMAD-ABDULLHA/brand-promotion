import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const fetchPosts = async ({ pageParam = 1 }, user_id) => {
  const res = await axios.get(
    `${API_BASE}/recommendation/posts/${user_id}?page=${pageParam}&limit=10`,
  );

  // If backend returns array (no pagination)
  if (Array.isArray(res.data)) {
    return {
      data: res.data.posts,
      nextPage: undefined, // No pagination → stops infinite scroll
    };
  }
  console.log("Fetched posts page:", res.data.posts);
  // If backend later returns { data, nextPage }
  return res.data.posts;
};

export const useInfinitePosts = (user_id) =>
  useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam = 1 }) => fetchPosts({ pageParam }, user_id),
    getNextPageParam: (lastPage) => lastPage?.nextPage ?? undefined,
    initialPageParam: 1,
  });
