import {
    AppBskyActorDefs,
    AppBskyFeedPost,
    AtUri,
    BskyAgent,
} from "@atproto/api"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { getDIDfromAtURI } from "../strings/getDIDfromAtURI"

export const filterDisplayPosts = (
    posts: FeedViewPost[],
    sessionUser: AppBskyActorDefs.ProfileViewDetailed | null,
    agent: BskyAgent | null
): FeedViewPost[] => {
    const seenUris = new Set<string>()
    return posts.filter((item) => {
        const uri = item.post.uri
        const authorDID = item.post.author?.did

        let displayPost: boolean | null = null

        if (
            //@ts-ignore
            (item.post.record as PostView)?.text?.startsWith("@") &&
            (item.post.record as PostView)?.facets
        ) {
            //@ts-ignore
            item.post.record.facets.map((facet: any) => {
                if (facet.index.byteStart == 0) {
                    displayPost = false
                    return
                }
            })
        }

        if (
            item?.post?.record &&
            (item.post.record as PostView)?.reply &&
            !item.reply
        ) {
            const replyParent = ((item.post.record as PostView).reply as any)
                ?.parent

            if (replyParent && !item.reply) {
                const did = new AtUri(replyParent.uri).hostname
                if (did === sessionUser?.did) {
                    item.reply = {
                        root: {},
                        parent: {
                            author: sessionUser,
                        },
                        isFakeArray: true,
                    } as any
                } else {
                    if (!agent) return
                    item.reply = {
                        root: {},
                        parent: {
                            author: {
                                displayName: "user",
                            },
                        },
                        isFakeArray: true,
                    } as any
                }
            }
        }

        if (item.reply && !item.reply.isFakeArray) {
            const rootDID = (item.reply.root as PostView).author.did
            const parentDID = (item.reply.parent as PostView).author.did

            if (item.reason) {
                // repost
                displayPost = true
            } else if (authorDID === rootDID && authorDID === parentDID) {
                // self reply
                displayPost = true
            } else if (parentDID === sessionUser?.did) {
                // reply to my post
                displayPost = true
            } else displayPost = authorDID === sessionUser?.did
        }

        const record = item.post.record as AppBskyFeedPost.Record

        if (record.reply) {
            const rootDID = getDIDfromAtURI(record.reply.root.uri)
            const parentDID = getDIDfromAtURI(record.reply.parent.uri)

            if (authorDID === rootDID && authorDID === parentDID) {
                // self reply
                displayPost = true
            } else if (parentDID === sessionUser?.did) {
                // reply to my post
                displayPost = true
            } else if (authorDID === sessionUser?.did) {
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
}
