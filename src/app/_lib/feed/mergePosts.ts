import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const mergePosts = (
    newPosts: FeedViewPost[] | null,
    posts: FeedViewPost[] | null
): FeedViewPost[] => {
    if (newPosts === null) {
        return posts || []
    }

    if (posts === null) {
        return newPosts || []
    }

    const urisSet = new Set<string>()
    const allPosts = [...newPosts, ...posts]

    let mergedPosts: FeedViewPost[] = []

    for (const post of allPosts) {
        if (urisSet.has(post.post.uri)) {
            continue
        }

        mergedPosts = [...mergedPosts, post]

        urisSet.add(post.post.uri)
    }

    return mergedPosts
}
