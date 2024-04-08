import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { AppBskyFeedDefs } from "@atproto/api"

export const mergePosts = (
    newPosts: FeedViewPost[] | PostView[] | null,
    posts: FeedViewPost[] | PostView[] | null
): FeedViewPost[] | PostView[] => {
    if (newPosts === null) {
        return posts || []
    }

    if (posts === null) {
        return newPosts || []
    }

    const urisSet = new Set<string>()
    const allPosts = [...newPosts, ...posts]

    let mergedPosts: FeedViewPost[] | PostView[] = []

    for (const post of allPosts) {
        if (AppBskyFeedDefs.isFeedViewPost(post)) {
            if (urisSet.has(post.post.uri)) {
                continue
            }
            mergedPosts = [...mergedPosts, post] as FeedViewPost[]

            urisSet.add(post.post.uri)
        } else if (AppBskyFeedDefs.isPostView(post)) {
            if (urisSet.has(post.uri)) {
                continue
            }
            mergedPosts = [...mergedPosts, post] as PostView[]

            urisSet.add(post.uri)
        }
    }

    return mergedPosts
}
