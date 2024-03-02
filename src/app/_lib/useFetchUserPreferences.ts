import { BskyAgent } from "@atproto/api"
import { useUpdateMenuWithFeedGenerators } from "@/app/_lib/useUpdateMenuWithFeedGenerators"

const useFetchUserPreferences = (
    agent: BskyAgent | undefined, // YourAgentType を適切な型に置き換えてください
    headerMenusByHeader: any, // ヘッダーメニューの型を適切に指定してください
    setHeaderMenusByHeader: (menus: any[]) => void // ヘッダーメニューのセッター関数の型を適切に指定してください
) => {
    const fetchUserPreferences = async () => {
        if (!agent) return
        try {
            const res = await agent.getPreferences()
            if (!res) {
                console.log("Responseがundefinedです。")
                return
            }

            const userPreferences = { ...res }
            if (!userPreferences.adultContentEnabled) {
                userPreferences.contentLabels.nsfw = "hide"
                userPreferences.contentLabels.nudity = "hide"
                userPreferences.contentLabels.suggestive = "hide"
            }

            setUserPreferences(userPreferences)

            const feedData = await agent.app.bsky.feed.getFeedGenerators({
                feeds: userPreferences.feeds.pinned as string[],
            })

            if (feedData) {
                const { data: feedGenerators } = feedData
                setFeedGenerators(feedGenerators.feeds)
                useUpdateMenuWithFeedGenerators(
                    feedGenerators.feeds,
                    headerMenusByHeader,
                    setHeaderMenusByHeader
                )
            }
        } catch (error) {
            console.error("Error fetching user preferences:", error)
        }
    }

    fetchUserPreferences()
}

export default useFetchUserPreferences
