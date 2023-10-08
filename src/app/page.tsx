"use client"

// import { TabBar } from "@/app/components/TabBar"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { isMobile } from "react-device-detect"
import { useAgent } from "@/app/_atoms/agent"
import InfiniteScroll from "react-infinite-scroller"
import { Spinner } from "@nextui-org/react"
// import type { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import type { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useSearchParams } from "next/navigation"
import { useAppearanceColor } from "@/app/_atoms/appearanceColor"
import { useWordMutes } from "@/app/_atoms/wordMute"
import { AppBskyFeedGetTimeline } from "@atproto/api"

export default function Root(props: any) {
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [muteWords] = useWordMutes()
    const [loading, setLoading] = useState(false)
    //const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [availavleNewTimeline, setAvailableNewTimeline] = useState(false)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const [shouldScrollToTop, setShouldScrollToTop] = useState<boolean>(false)

    const newCursor = useRef<string>("")
    const cursor = useRef<string>("")

    const color = darkMode ? "dark" : "light"

    const searchParams = useSearchParams()
    const selectedFeed = searchParams.get("feed") || "following"

    const modeMe = (e: any) => {
        setDarkMode(!!e.matches)
    }

    useEffect(() => {
        if (shouldScrollToTop) {
            const infiniteScroll = document.getElementById("infinite-scroll")

            if (infiniteScroll?.parentElement) {
                infiniteScroll.parentElement.scrollTop = 0
            }

            setShouldScrollToTop(false)
        }
    }, [timeline])

    useEffect(() => {
        if (appearanceColor === "system") {
            const matchMedia = window.matchMedia("(prefers-color-scheme: dark)")

            setDarkMode(matchMedia.matches)
            matchMedia.addEventListener("change", modeMe)

            return () => matchMedia.removeEventListener("change", modeMe)
        } else if (appearanceColor === "dark") {
            setDarkMode(true)
        } else if (appearanceColor === "light") {
            setDarkMode(false)
        }
    }, [appearanceColor])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date())
        }, 60 * 1000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const handleRefresh = () => {
        const diffTimeline = newTimeline.filter((newItem) => {
            if (!timeline) {
                return true
            }

            return !timeline.some(
                (oldItem) => oldItem.post.uri === newItem.post.uri
            )
        })

        if (timeline) {
            setTimeline([...diffTimeline, ...timeline])
        } else {
            setTimeline([...diffTimeline])
        }

        // cursor.current = newCursor.current

        setAvailableNewTimeline(false)
        setShouldScrollToTop(true)
    }

    const formattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri

            if (item.post.embed) {
                console.log(item.post.embed)
            }

            if (item.reply) {
                if (item.reason) return true
                if (
                    //@ts-ignore
                    item.post.author.did === item.reply.parent.author.did &&
                    //@ts-ignore
                    item.reply.parent.author.did === item.reply.root.author.did
                )
                    return true
                return false
            }
            //これはおそらくparentやrootがミュートユーザーの時、recordにreplyが入って、authorが自分ではない場合は非表示
            if (
                //@ts-ignore
                item.post.record?.reply &&
                item.post.author.did !== agent?.session?.did
            )
                return false
            // まだ uri がセットに登録されていない場合、trueを返し、セットに登録する
            if (!seenUris.has(uri)) {
                seenUris.add(uri)
                return true
            }
            return false
        })

        return filteredData as FeedViewPost[]
    }

    const fetchTimeline = async (loadingFlag: boolean = true) => {
        if (!agent) {
            return
        }

        try {
            setLoading(loadingFlag)

            let response: AppBskyFeedGetTimeline.Response
            let timelineLength = 0

            if (selectedFeed === "following") {
                response = await agent.getTimeline({
                    limit: 30,
                    cursor: cursor.current || "",
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: selectedFeed,
                    cursor: cursor.current || "",
                    limit: 30,
                })
            }

            if (response.data) {
                const { feed } = response.data
                const filteredData = formattingTimeline(feed)

                setTimeline((currentTimeline) => {
                    if (currentTimeline !== null) {
                        const newTimeline = [
                            ...currentTimeline,
                            ...filteredData,
                        ]
                        timelineLength = newTimeline.length

                        return newTimeline
                    } else {
                        timelineLength = filteredData.length
                        return [...filteredData]
                    }
                })
            } else {
                setTimeline([])
                // もしresがundefinedだった場合の処理
                console.log("Responseがundefinedです。")
            }

            setLoading(false)

            cursor.current = response.data.cursor || ""

            if (
                response.data &&
                cursor.current &&
                cursor.current.length > 0 &&
                timelineLength < 15
            ) {
                await fetchTimeline(false)
            }

            if (cursor.current.length > 0) {
                setHasMore(true)
            } else {
                setHasMore(false)
            }
        } catch (e) {
            setLoading(false)
        }
    }

    const loadMore = async (page: number) => {
        await fetchTimeline(false)
    }

    // const loadMore = useCallback(
    //     async (page: any) => {
    //         if (!agent) return
    //         if (!cursor.current) return

    //         console.log("loadMore")

    //         try {
    //             setLoading2(true)
    //             let data
    //             if (selectedFeed === "following") {
    //                 ;({ data } = await agent.getTimeline({
    //                     cursor: !hasCursor ? cursor.current : hasCursor,
    //                     limit: 30,
    //                 }))
    //             } else {
    //                 ;({ data } = await agent.app.bsky.feed.getFeed({
    //                     feed: selectedFeed,
    //                     cursor: !hasCursor ? cursor.current : hasCursor,
    //                     limit: 30,
    //                 }))
    //             }

    //             const { feed } = data

    //             if (data.cursor) {
    //                 setHasCursor(data.cursor)
    //             }

    //             const filteredData = FormattingTimeline(feed)
    //             const diffTimeline = filteredData.filter((newItem) => {
    //                 if (!timeline) {
    //                     return true
    //                 }

    //                 return !timeline.some(
    //                     (oldItem) => oldItem.post === newItem.post
    //                 )
    //             })

    //             console.log(timeline)
    //             console.log(diffTimeline)

    //             //取得データをリストに追加
    //             if (timeline) {
    //                 setTimeline([...timeline, ...diffTimeline])
    //             } else {
    //                 setTimeline([...diffTimeline])
    //             }
    //             setLoading2(false)
    //         } catch (e) {
    //             setLoading2(false)
    //             console.log(e)
    //         }
    //     },
    //     [agent, timeline, hasCursor, selectedFeed]
    // )

    const checkNewTimeline = async () => {
        if (!agent) return

        try {
            let response: AppBskyFeedGetTimeline.Response

            if (selectedFeed === "following") {
                response = await agent.getTimeline({ limit: 30 })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: selectedFeed,
                    limit: 30,
                })
            }

            if (response.data) {
                const { feed } = response.data
                const filteredData = formattingTimeline(feed)

                if (
                    response.data.cursor &&
                    response.data.cursor !== cursor.current &&
                    response.data.cursor !== newCursor.current
                ) {
                    newCursor.current = response.data.cursor

                    const diffTimeline = filteredData.filter((newItem) => {
                        if (!timeline) {
                            return true
                        }

                        return !timeline.some(
                            (oldItem) => oldItem.post.uri === newItem.post.uri
                        )
                    })

                    setNewTimeline(diffTimeline)

                    if (diffTimeline.length > 0) {
                        setAvailableNewTimeline(true)
                    }
                }
            }
        } catch (e) {}
    }

    useEffect(() => {
        if (!agent) return

        fetchTimeline()
    }, [agent, selectedFeed])

    useEffect(() => {
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 15000)

        return () => {
            clearInterval(interval)
        }
    }, [agent, cursor.current, selectedFeed])

    return (
        <>
            {availavleNewTimeline && (
                <div
                    className={
                        " absolute flex justify-center z-[10] left-16 right-16 top-[120px]"
                    }
                >
                    <div
                        className={
                            "text-black  bg-blue-50 rounded-full cursor-pointer pl-[10px] pr-[10px] pt-[5px] pb-[5px]"
                        }
                        onClick={handleRefresh}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} /> New Posts
                    </div>
                </div>
            )}
            <>
                <InfiniteScroll
                    id="infinite-scroll"
                    initialLoad={false}
                    loadMore={loadMore}
                    hasMore={hasMore}
                    loader={
                        <div
                            key="spinner-home"
                            className="flex justify-center mt-2 mb-2"
                        >
                            <Spinner />
                        </div>
                    }
                    threshold={700}
                    useWindow={false}
                >
                    {(loading || !timeline) &&
                        Array.from({ length: 15 }, (_, index) => (
                            <ViewPostCard
                                key={`skeleton-${index}`}
                                color={color}
                                numbersOfImage={0}
                                postJson={null}
                                isMobile={isMobile}
                                isSkeleton={true}
                            />
                        ))}
                    {!loading &&
                        timeline &&
                        timeline.map((post, index) => {
                            // Check if post.record.text contains muteWords
                            const isMuted =
                                (post.post.record as PostView)?.text &&
                                muteWords.some((muteWord) => {
                                    //console.log(muteWord)
                                    return (
                                        muteWord.isActive &&
                                        muteWord.targets.includes("timeline") &&
                                        (
                                            (post.post.record as PostView)
                                                ?.text as string
                                        )?.includes(muteWord.word)
                                    )
                                })
                            if (!isMuted) {
                                // Render the post if it's not muted
                                return (
                                    <ViewPostCard
                                        key={`${
                                            post?.reason
                                                ? `reason-${
                                                      (post.reason as any).by
                                                          .did
                                                  }`
                                                : `post`
                                        }-${post.post.uri}`}
                                        color={color}
                                        numbersOfImage={0}
                                        postJson={post.post}
                                        json={post}
                                        isMobile={isMobile}
                                    />
                                )
                            }
                        })}
                </InfiniteScroll>
            </>
        </>
    )
}
