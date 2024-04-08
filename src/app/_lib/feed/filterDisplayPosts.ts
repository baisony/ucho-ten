import { AtUri, BskyAgent } from "@atproto/api"
import {
    FeedViewPost,
    PostView,
    ReplyRef,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { AppBskyFeedDefs } from "@atproto/api"
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { getDIDfromAtURI } from "../strings/getDIDfromAtURI"
import { AppBskyRichtextFacet } from "@atproto/api/dist/client"

const handleHideRepost = (
    item: FeedViewPost | PostView,
    hideRepost: boolean | undefined
) => {
    return item?.reason && hideRepost
}

const handleFrontMention = (post: PostView) => {
    if (
        ((post.record as PostView)?.text as string)?.startsWith("@") &&
        (post.record as PostView)?.facets
    ) {
        ;(post.record as Record)?.facets?.map(
            (facet: AppBskyRichtextFacet.Main) => {
                if (facet.index.byteStart == 0) {
                    return true
                }
            }
        )
    }
    return false
}

export const filterDisplayPosts = (
    posts: (PostView | FeedViewPost)[],
    sessionUser: ProfileViewDetailed | null,
    agent: BskyAgent | null,
    hideRepost?: boolean
): (FeedViewPost | PostView)[] => {
    const seenUris = new Set<string>()
    return posts.filter((item) => {
        let postData: PostView
        if (AppBskyFeedDefs.isFeedViewPost(item)) {
            postData = item.post
        } else {
            postData = item
        }
        const uri = postData.uri
        const authorDID = postData.author?.did

        let displayPost: boolean | null = null

        if (
            handleHideRepost(item, hideRepost) ||
            handleFrontMention(postData)
        ) {
            return false
        }

        if (postData.author?.did === sessionUser?.did) return true

        if (
            (item?.post as PostView)?.record &&
            (postData.record as PostView)?.reply &&
            !item.reply
        ) {
            const replyParent = (postData.record as Record).reply?.parent

            if (replyParent && !item.reply) {
                const did = new AtUri(replyParent.uri).hostname
                if (did === sessionUser?.did) {
                    item.reply = {
                        root: {},
                        parent: {
                            author: sessionUser,
                        },
                        isFakeArray: true,
                    }
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
                    }
                }
            }
        }

        if (item?.reply && !(item?.reply as ReplyRef)?.isFakeArray) {
            const rootDID = ((item.reply as ReplyRef).root as PostView).author
                .did
            const parentDID = ((item.reply as ReplyRef).parent as PostView)
                .author.did

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

        const record = postData.record as Record

        if (record.reply) {
            const rootDID = getDIDfromAtURI(record.reply.root.uri)
            const parentDID = getDIDfromAtURI(record.reply.parent.uri)

            if (authorDID === rootDID && authorDID === parentDID) {
                // self reply
                displayPost = true
            } else displayPost = parentDID === sessionUser?.did
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
