// useGetFeedInfo.ts

import { BskyAgent } from "@atproto/api"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const useGetFeedInfo = async (
    url: string,
    agent: BskyAgent | null,
    setIsOGPGetProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    setGetFeedData: React.Dispatch<
        React.SetStateAction<GeneratorView | undefined>
    >
) => {
    if (!agent) return
    const regex = /\/([^/]+)\/feed\/([^/]+)/
    const matches = url.match(regex)
    if (matches) {
        const did = matches[1]
        const feedName = matches[2]
        try {
            setIsOGPGetProcessing(true)
            const { data } = await agent.app.bsky.feed.getFeedGenerator({
                feed: `at://${did}/app.bsky.feed.generator/${feedName}`,
            })
            setGetFeedData(data.view)
        } catch (e) {
        } finally {
            setIsOGPGetProcessing(false)
        }
    }
}
