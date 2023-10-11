import { atom, useAtom } from "jotai"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

interface PostsByFeed {
    [k: string]: FeedViewPost[] | null
}

const feedsAtom = atom<PostsByFeed>({})

export const useFeedsAtom = () => useAtom(feedsAtom)

// export const getFeed = (feedKey: string): Atom<FeedViewPost[] | null> => {
//     return atom((get) => {
//         const feeds = get(feedsAtom)
//         return feeds[feedKey]
//     })
// }
