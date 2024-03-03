import { useCallback } from "react"
import { BskyAgent } from "@atproto/api"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { useFilterPosts } from "@/app/_lib/useFilterPosts"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { MuteWord } from "@/app/_atoms/wordMute"

interface ResponseObject {
    status: number
    error: string
    success: boolean
    headers: any
}

export const useCheckNewTimeline = (
    agent: BskyAgent | null, // 適切な型に置き換えてください
    feedKey: string,
    FEED_FETCH_LIMIT: number,
    userProfileDetailed: any, // 適切な型に置き換えてください
    hideRepost: boolean,
    shouldCheckUpdate: React.MutableRefObject<boolean>,
    latestCID: React.MutableRefObject<string>, // 適切な型に置き換えてください
    setNewTimeline: (newTimeline: any[]) => void, // 適切な型に置き換えてください
    setHasUpdate: (hasUpdate: boolean) => void, // 適切な型に置き換えてください
    setHasError: (error: any) => void, // 適切な型に置き換えてください
    muteWords: MuteWord[]
) => {
    return useCallback(async () => {
        if (!agent) return
        shouldCheckUpdate.current = false

        try {
            let response: any

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
        } catch (e) {
            try {
                //@ts-ignore
                if (JSON.parse(e).status === 1) return
                setHasError(e as ResponseObject)
            } catch (e) {
                console.error(e)
            }
        }
    }, [agent])
}
