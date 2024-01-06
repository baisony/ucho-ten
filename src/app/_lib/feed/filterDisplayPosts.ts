import {
    AppBskyActorDefs,
    AppBskyFeedPost,
    AtUri,
    BskyAgent,
} from "@atproto/api"
import {
    FeedViewPost,
    PostView,
    ReplyRef,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { getDIDfromAtURI } from "../strings/getDIDfromAtURI"

const handleHideRepost = (
    item: FeedViewPost | PostView,
    hideRepost: boolean | undefined
) => {
    return !(item?.reason && hideRepost)
}

const handleFrontMention = (post: PostView) => {
    if (
        ((post.record as PostView)?.text as string)?.startsWith("@") &&
        (post.record as PostView)?.facets
    ) {
        //@ts-ignore
        post.record.facets.map((facet: any) => {
            if (facet.index.byteStart == 0) {
                return false
            }
        })
    }
    return true
}

export const filterDisplayPosts = (
    posts: FeedViewPost[] | PostView[],
    sessionUser: AppBskyActorDefs.ProfileViewDetailed | null,
    agent: BskyAgent | null,
    hideRepost?: boolean
): FeedViewPost[] | PostView[] => {
    const seenUris = new Set<string>()
    //@ts-ignore
    return posts.filter((item) => {
        //@ts-ignore
        const postData: PostView = item.post ?? item
        const uri = postData.uri
        const authorDID = postData.author?.did

        let displayPost: boolean | null = null

        if (!handleHideRepost(item, hideRepost)) return false

        if (!handleFrontMention(postData)) return false

        if (
            (item?.post as PostView)?.record &&
            (postData.record as PostView)?.reply &&
            !item.reply
        ) {
            const replyParent = ((postData.record as PostView).reply as any)
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

        const record = postData.record as AppBskyFeedPost.Record

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
