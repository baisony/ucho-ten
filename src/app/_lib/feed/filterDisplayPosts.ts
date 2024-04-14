import {
    AppBskyActorDefs,
    AppBskyFeedDefs,
    AppBskyRichtextFacet,
    AtUri,
    BskyAgent,
} from "@atproto/api"
import {
    FeedViewPost,
    PostView,
    ReplyRef,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { getDIDfromAtURI } from "../strings/getDIDfromAtURI"
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post"

const handleHideRepost = (
    item: FeedViewPost | PostView,
    hideRepost: boolean | undefined
) => {
    return item?.reason && hideRepost
}

const handleFrontMention = (post: PostView) => {
    if (
        ((post.record as PostView)?.text as string)?.startsWith("@") &&
        (post.record as Record)?.facets
    ) {
        ;(post?.record as Record)?.facets?.map(
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
    posts: (FeedViewPost | PostView)[],
    sessionUser: AppBskyActorDefs.ProfileViewDetailed | null,
    agent: BskyAgent | null,
    hideRepost?: boolean
): (FeedViewPost | PostView)[] => {
    const seenUris = new Set<string>()
    return posts.filter((item) => {
        const postData = item?.post ?? item
        const post: PostView = postData as PostView
        const uri = post?.uri
        const authorDID = post.author?.did

        let displayPost: boolean | null = null

        if (handleHideRepost(item, hideRepost) || handleFrontMention(post)) {
            return false
        }

        if (
            (item?.post as PostView)?.record &&
            (post.record as PostView)?.reply &&
            !item.reply
        ) {
            const replyParent = (post.record as Record).reply?.parent

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

        if (
            item?.reply &&
            AppBskyFeedDefs.isReplyRef(item?.reply) &&
            !(item?.reply as ReplyRef)?.isFakeArray
        ) {
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

        const record = post.record as Record

        if (record?.reply) {
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
