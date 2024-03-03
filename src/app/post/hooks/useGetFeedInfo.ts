// useGetFeedInfo.ts

export const useGetFeedInfo = async (
    url: string,
    agent: any,
    setIsOGPGetProcessing: React.Dispatch<React.SetStateAction<boolean>>,
    setGetFeedData: React.Dispatch<React.SetStateAction<any>>
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
