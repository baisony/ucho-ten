import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { MuteWord } from "@/app/_atoms/wordMute"

export const useFilterPosts = (
    posts: (PostView | FeedViewPost)[],
    muteWords: MuteWord[]
) => {
    return posts.filter((post) => {
        return !muteWords.some((muteWord) => {
            if (muteWord.isActive) {
                let textToCheck: string | undefined
                if ("embed" in post) {
                    textToCheck =
                        //@ts-ignore
                        post.embed?.record?.value?.text || post.record?.text
                } else {
                    textToCheck =
                        //@ts-ignore
                        post.post?.embed?.record?.value?.text ||
                        //@ts-ignore
                        post.post?.record?.text
                }
                return textToCheck?.includes(muteWord.word)
            }
            return false
        })
    })
}
