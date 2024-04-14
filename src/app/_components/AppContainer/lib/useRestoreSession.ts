import { useLayoutEffect } from "react"
import { BskyAgent, BskyPreferences } from "@atproto/api"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ProfileViewDetailed } from "@atproto/api/dist/client/types/app/bsky/actor/defs"
import { GeneratorView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"

export const useRestoreSession = (
    agent: BskyAgent | null,
    setAgent: (agent: BskyAgent) => void,
    router: AppRouterInstance,
    pathName: string,
    searchParams: URLSearchParams,
    userProfileDetailed: ProfileViewDetailed | null, // あなたの型を適切に追加
    setUserProfileDetailed: (data: typeof userProfileDetailed) => void, // あなたの型を適切に追加
    userPreferences: BskyPreferences | null, // あなたの型を適切に追加
    setUserPreferences: (preferences: typeof userPreferences) => void, // あなたの型を適切に追加
    setFeedGenerators: (feedGenerators: GeneratorView[] | null) => void, // あなたの型を適切に追加
    updateMenuWithFeedGenerators: (feedGenerators: GeneratorView[]) => void
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
                const promises: Promise<unknown>[] = []

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
