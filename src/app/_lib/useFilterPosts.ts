import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { MuteWord } from "@/app/_atoms/wordMute"
import { ViewRecord } from "@atproto/api/dist/client/types/app/bsky/embed/record"
import { Record } from "@atproto/api/dist/client/types/app/bsky/feed/post"
import { AppBskyFeedDefs } from "@atproto/api"

export const useFilterPosts = (
    posts: (PostView | FeedViewPost)[],
    muteWords: MuteWord[]
): (PostView | FeedViewPost)[] => {
    return posts.filter((post) => {
        return !muteWords.some((muteWord) => {
            if (muteWord.isActive) {
                let textToCheck: string | undefined
                if (AppBskyFeedDefs.isPostView(post)) {
                    textToCheck =
                        ((post.embed?.record as ViewRecord)?.value as Record)
                            ?.text || (post.record as Record)?.text
                } else if (AppBskyFeedDefs.isFeedViewPost(post)) {
                    textToCheck =
                        (
                            (post.post?.embed?.record as ViewRecord)
                                ?.value as Record
                        )?.text || (post.post?.record as Record)?.text
                }
                return textToCheck?.includes(muteWord.word)
            }
            return false
        })
    })
}
