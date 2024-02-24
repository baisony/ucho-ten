import { useCallback } from "react"
import { BskyAgent } from "@atproto/api"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const useLazyCheckNewTimeline = (
    agent: BskyAgent | null, // 適切な型に置き換えてください
    latestCID: React.MutableRefObject<string>,
    feedKey: string,
    FEED_FETCH_LIMIT: number,
    userProfileDetailed: any, // 適切な型に置き換えてください
    hideRepost: boolean,
    timeline: FeedViewPost[] | null, // 適切な型に置き換えてください
    setTimeline: (timeline: FeedViewPost[] | null) => void, // 適切な型に置き換えてください
    setNewTimeline: (newTimeline: any) => void, // 適切な型に置き換えてください
    setHasUpdate: (hasUpdate: boolean) => void, // 適切な型に置き換えてください
    queryClient: any // 適切な型に置き換えてください
) => {
    const lazyCheckNewTimeline = useCallback(async () => {
        if (!agent) return

        try {
            let response: AppBskyFeedGetTimeline.Response

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
                //@ts-ignore
                const muteWordFilter = filterPosts(filteredData)

                const mergedTimeline = mergePosts(muteWordFilter, timeline)

                if (!mergedTimeline[0]?.post) return
                //@ts-ignore
                setTimeline(mergedTimeline)
                setNewTimeline([])
                setHasUpdate(false)

                if (mergedTimeline.length > 0) {
                    latestCID.current = (mergedTimeline[0].post as PostView).cid
                }

                await queryClient.refetchQueries({
                    queryKey: ["getFeed", feedKey],
                })
            }
        } catch (e) {
            console.error(e)
        }
    }, [
        agent,
        feedKey,
        FEED_FETCH_LIMIT,
        userProfileDetailed,
        hideRepost,
        timeline,
        setTimeline,
        setNewTimeline,
        setHasUpdate,
        queryClient,
    ])

    return lazyCheckNewTimeline
}
