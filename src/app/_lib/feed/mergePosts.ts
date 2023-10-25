import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const mergePosts = (
    newPosts: FeedViewPost[] | null,
    posts: FeedViewPost[] | null
): FeedViewPost[] => {
    if (newPosts === null) {
        console.log("newPosts === null")
        return posts || []
    }

    if (posts === null) {
      console.log("Posts === null")
      return newPosts || []
    }

    const urisSet = new Set<string>()
    const allPosts = [...newPosts, ...posts]

    console.log("allPosts", allPosts)
    
    let mergedPosts: FeedViewPost[] = []

    for (const post of allPosts) {
      if (urisSet.has(post.post.uri)) {
        continue
      }

      console.log(post)

      mergedPosts = [...mergedPosts, post]

      console.log("mergedPosts A", mergedPosts)

      urisSet.add(post.post.uri)
    }

    console.log("mergedPosts", mergedPosts)

    return mergedPosts
}
