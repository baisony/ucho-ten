import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const filterDisplayPosts = (
    posts: FeedViewPost[],
    userDID: string | undefined
): FeedViewPost[] => {
    const seenUris = new Set<string>()

    const filteredData = posts.filter((item) => {
        const uri = item.post.uri
        let displayPost: boolean | null = null

        if (item.reply) {
            if (item.reason) {
                // repost
                displayPost = true
            } else if (
                // @ts-ignore
                (item.post.author.did === item.reply.parent.author.did &&
                    // @ts-ignore
                    item.reply.parent.author.did ===
                        // @ts-ignore
                        item.reply.root.author.did) ||
                item.post.author.did === userDID
            ) {
                displayPost = true
            } else {
                displayPost = false
            }
        }

        if (!seenUris.has(uri)) {
            seenUris.add(uri)

            if (displayPost === null) {
                displayPost = true
            }
        } else {
            displayPost = false
        }

        return displayPost
    })

    return filteredData
}
