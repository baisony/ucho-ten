import { atom, useAtom } from "jotai"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

interface FeedInfo {
    posts: FeedViewPost[] | null
    newPosts: FeedViewPost[]
}

interface InfoByFeed {
    [k: string]: FeedInfo
}

const infoByFeedAtom = atom<InfoByFeed>({})

export const useInfoByFeedAtom = () => useAtom(infoByFeedAtom)
