import { useLayoutEffect } from "react"
import { BskyAgent } from "@atproto/api"

export const useRestoreSession = (
    agent: BskyAgent | null,
    setAgent: (agent: BskyAgent) => void,
    router: any,
    pathName: string,
    searchParams: URLSearchParams,
    userProfileDetailed: any, // あなたの型を適切に追加
    setUserProfileDetailed: (data: any) => void, // あなたの型を適切に追加
    userPreferences: any, // あなたの型を適切に追加
    setUserPreferences: (preferences: any) => void, // あなたの型を適切に追加
    setFeedGenerators: (feedGenerators: any) => void, // あなたの型を適切に追加
    updateMenuWithFeedGenerators: (feedGenerators: any) => void // あなたの型を適切に追加
) => {
    useLayoutEffect(() => {
        if (agent?.hasSession === true) {
            return
        }

        const restoreSession = async () => {
            const sessionJson = localStorage.getItem("session")

            if (!sessionJson) {
                if (pathName === "/login" || pathName === "/") return
                if (router) {
                    router.push(
                        `/${
                            pathName
                                ? `?toRedirect=${pathName.replace("/", "")}${
                                      searchParams ? `&${searchParams}` : ``
                                  }`
                                : ``
                        }`
                    )
                } else {
                    location.href = "/"
                }
                return
            }

            const session = JSON.parse(sessionJson).session
            const agent = new BskyAgent({
                service: `https://${JSON.parse(sessionJson).server}`,
            })

            try {
                await agent.resumeSession(session)

                setAgent(agent)
            } catch (error) {
                console.error(error)
                if (pathName === "/login" || pathName === "/") return
                if (router) {
                    router.push(
                        `/${
                            pathName
                                ? `?toRedirect=${pathName.replace("/", "")}${
                                      searchParams ? `&${searchParams}` : ``
                                  }`
                                : ``
                        }`
                    )
                } else {
                    location.href = "/"
                }
            }

            if (agent.hasSession) {
                const promises: Promise<any>[] = []

                if (!userProfileDetailed) {
                    const userProfilePromise = agent
                        .getProfile({ actor: agent.session?.did || "" })
                        .then((res) => {
                            const { data } = res
                            setUserProfileDetailed(data)
                        })
                    promises.push(userProfilePromise)
                }

                if (!userPreferences) {
                    const userPreferencesPromise = agent
                        .getPreferences()
                        .then((res) => {
                            if (res) {
                                if (!res?.adultContentEnabled) {
                                    res.contentLabels.nsfw = "hide"
                                    res.contentLabels.nudity = "hide"
                                    res.contentLabels.suggestive = "hide"
                                }

                                setUserPreferences(res)

                                return agent.app.bsky.feed.getFeedGenerators({
                                    feeds: res.feeds.pinned as string[],
                                })
                            } else {
                                console.log("Responseがundefinedです。")
                                return null
                            }
                        })
                        .then((data) => {
                            if (data) {
                                const { data: feedData } = data
                                console.log(feedData)
                                setFeedGenerators(feedData.feeds)
                                updateMenuWithFeedGenerators(feedData.feeds)
                            }
                        })

                    promises.push(userPreferencesPromise)
                }

                // 並列で実行する
                Promise.race(promises).then(() => {})
            }
        }

        void restoreSession()
    }, [
        agent,
        pathName,
        router,
        searchParams,
        setAgent,
        setUserProfileDetailed,
        setUserPreferences,
        setFeedGenerators,
        updateMenuWithFeedGenerators,
    ])
}
