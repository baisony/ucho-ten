import { useCallback } from "react"
import { AppBskyFeedGetFeed, BskyAgent } from "@atproto/api"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { useFilterPosts } from "@/app/_lib/useFilterPosts"
import {
    FeedViewPost,
    PostView,
} from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { MuteWord } from "@/app/_atoms/wordMute"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"

interface ResponseObject {
    status: number
    error: string
    success: boolean
    headers: unknown
}

export const useCheckNewTimeline = (
    agent: BskyAgent | null, // 適切な型に置き換えてください
    feedKey: string,
    FEED_FETCH_LIMIT: number,
    userProfileDetailed: ProfileViewDetailed | null, // 適切な型に置き換えてください
    hideRepost: boolean,
    shouldCheckUpdate: React.MutableRefObject<boolean>,
    latestCID: React.MutableRefObject<string>, // 適切な型に置き換えてください
    setNewTimeline: (newTimeline: FeedViewPost[]) => void, // 適切な型に置き換えてください
    setHasUpdate: (hasUpdate: boolean) => void, // 適切な型に置き換えてください
    setHasError: (error: ResponseObject) => void, // 適切な型に置き換えてください
    muteWords: MuteWord[]
) => {
    return useCallback(async () => {
        if (!agent) return
        shouldCheckUpdate.current = false

        try {
            let response: AppBskyFeedGetFeed.Response

            if (feedKey === "following") {
                response = await agent.getTimeline({
                    limit: FEED_FETCH_LIMIT,
                    cursor: "",
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    limit: FEED_FETCH_LIMIT,
                    cursor: "",
                })
            }

            const { data } = response

            if (data) {
                const { feed } = data
                const filteredData =
                    feedKey === "following"
                        ? filterDisplayPosts(
                              feed,
                              userProfileDetailed,
                              agent,
                              hideRepost
                          )
                        : feed
                const muteWordFilter = useFilterPosts(filteredData, muteWords)
                //@ts-ignore FeedViewPost[] には post が必ずあるので、ここでの型キャストは問題ない
                setNewTimeline(muteWordFilter)

                if (muteWordFilter.length > 0) {
                    if (
                        (muteWordFilter[0]?.post as PostView)?.cid !==
                            latestCID.current &&
                        latestCID.current !== ""
                    ) {
                        setHasUpdate(true)
                    } else {
                        setHasUpdate(false)
                    }
                }
            }
        } catch (e: unknown) {}
    }, [agent])
}
