import { AppBskyActorDefs, AppBskyFeedPost } from "@atproto/api"
import {
    FeedViewPost,
    PostView,
    ReplyRef,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { getDIDfromAtURI } from "../strings/getDIDfromAtURI"

export const filterDisplayPosts = (
    posts: FeedViewPost[],
    userDID: string | undefined
): FeedViewPost[] => {
    const seenUris = new Set<string>()

    const filteredData = posts.filter((item) => {
        const uri = item.post.uri
        const authorDID = item.post.author.did

        let displayPost: boolean | null = null

        if (item.reply) {
            const rootDID = (item.reply.root as PostView).author.did
            const parentDID = (item.reply.parent as PostView).author.did

            if (item.reason) {
                // repost
                // repost
                displayPost = true
            } else if (authorDID === rootDID && authorDID === parentDID) {
                // self reply
                displayPost = true
            } else if (parentDID === userDID) {
                // reply to my post
                displayPost = true
            } else if (authorDID === userDID) {
                // my reply
                displayPost = true
            } else {
                displayPost = false
            }
        }

        const record = item.post.record as AppBskyFeedPost.Record

        if (record.reply) {
            const rootDID = getDIDfromAtURI(record.reply.root.uri)
            const parentDID = getDIDfromAtURI(record.reply.parent.uri)

            if (authorDID === rootDID && authorDID === parentDID) {
                // self reply
                displayPost = true
            } else if (parentDID === userDID) {
                // reply to my post
                displayPost = true
            } else if (authorDID === userDID) {
                // my reply
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
