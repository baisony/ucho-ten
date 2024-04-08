import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const mergePosts = (
    newPosts: (FeedViewPost | PostView)[] | null,
    posts: (FeedViewPost | PostView)[] | null
): (FeedViewPost | PostView)[] => {
    if (newPosts === null) {
        return posts || []
    }

    if (posts === null) {
        return newPosts || []
    }

    const urisSet = new Set<string>()
    const allPosts = [...newPosts, ...posts]

    let mergedPosts: (FeedViewPost | PostView)[] = []

    for (const post of allPosts) {
        if (post?.post) {
            if (urisSet.has((post.post as PostView).uri)) {
                continue
            }
            mergedPosts = [...mergedPosts, post]

            urisSet.add((post.post as PostView).uri)
        } else {
            if (urisSet.has((post as PostView).uri)) {
                continue
            }
            mergedPosts = [...mergedPosts, post]

            urisSet.add((post as PostView).uri)
        }
    }

    return mergedPosts
}
