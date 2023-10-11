"use client"

// import { TabBar } from "@/app/components/TabBar"
import { ViewPostCard } from "@/app/components/ViewPostCard"
import React, { useEffect, useRef, useState } from "react"
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
import LazyViewPostCard from "./components/ViewPostCard/LazyViewPostCard"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"

import "swiper/css"
import "swiper/css/pagination"
import FeedPage from "./components/FeedPage/FeedPage"
import LazyFeedPage from "./components/FeedPage/LazyFeedPage"
import { useFeedGeneratorsAtom } from "./_atoms/feedGenerators"

export default function Root(props: any) {
    const [agent, setAgent] = useAgent()
    const [appearanceColor] = useAppearanceColor()
    const [muteWords] = useWordMutes()

    const [loading, setLoading] = useState(false)
    //const [loading2, setLoading2] = useState(false)
    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [darkMode, setDarkMode] = useState(false)
    const [now, setNow] = useState<Date>(new Date())
    const [shouldScrollToTop, setShouldScrollToTop] = useState<boolean>(false)

    const currentFeed = useRef<string>("")
    // const newCursor = useRef<string>("")
    const cursor = useRef<string>("")

    const [pinnedFeeds] = useFeedGeneratorsAtom()

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
        setTimeline((currentTimeline) => {
            if (currentTimeline !== null) {
                const timeline = [...newTimeline, ...currentTimeline]

                return timeline
            } else {
                return [...newTimeline]
            }
        })

        // cursor.current = newCursor.current

        setNewTimeline([])
        setShouldScrollToTop(true)
    }

    const formattingTimeline = (timeline: FeedViewPost[]) => {
        const seenUris = new Set<string>()
        const filteredData = timeline.filter((item) => {
            const uri = item.post.uri

            // if (item.post.embed) {
            //     console.log(item.post.embed)
            // }

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

        if (currentFeed.current !== selectedFeed) {
            currentFeed.current = selectedFeed
            cursor.current = ""
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

                if (currentFeed.current !== selectedFeed) {
                    return
                }

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

    const checkNewTimeline = async () => {
        if (!agent) {
            return
        }

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

            if (currentFeed.current !== selectedFeed) {
                return
            }

            if (response.data) {
                const { feed } = response.data
                const filteredData = formattingTimeline(feed)

                if (
                    response.data.cursor &&
                    response.data.cursor !== cursor.current
                    //&& response.data.cursor !== newCursor.current
                ) {
                    // newCursor.current = response.data.cursor

                    const diffTimeline = filteredData.filter((newItem) => {
                        if (!timeline) {
                            return true
                        }

                        return !timeline.some(
                            (oldItem) => oldItem.post.uri === newItem.post.uri
                        )
                    })

                    setNewTimeline(diffTimeline)
                }
            }
        } catch (e) {}
    }

    useEffect(() => {
        cursor.current = ""
        setLoading(true)
        setTimeline(null)
        setShouldScrollToTop(true)

        setNewTimeline([])

        if (!agent) {
            return
        }

        fetchTimeline()
    }, [agent, selectedFeed])

    useEffect(() => {
        console.log("here")
        const interval = setInterval(() => {
            checkNewTimeline()
        }, 15000)

        return () => {
            clearInterval(interval)
        }
    }, [agent, selectedFeed])

    return (
        <>
            <Swiper
                pagination={true}
                hidden={true}
                modules={[Pagination]}
                className="mySwiper"
                style={{height: "100%"}}
            >
                <SwiperSlide key="following">
                    <div
                        id={`swiperIndex-div-following`}
                        style={{ overflowY: "auto", height: "100%" }}
                    >
                        <FeedPage
                            {...{
                                feedKey: "following",
                                loading,
                                hasMore,
                                loadMore,
                                color,
                                timeline,
                                now,
                            }}
                        />
                    </div>
                </SwiperSlide>
                {pinnedFeeds &&
                    pinnedFeeds.map((feed, swiperIndex) => {
                        return (
                            <SwiperSlide key={`swiperslide-${swiperIndex}`}>
                                <div
                                    id={`swiperIndex-div-${swiperIndex}`}
                                    key={swiperIndex}
                                    style={{
                                        overflowY: "auto",
                                        height: "100%",
                                    }}
                                >
                                    <FeedPage
                                        {...{
                                            feedKey: feed.uri,
                                            loading,
                                            hasMore,
                                            loadMore,
                                            color,
                                            timeline,
                                            now,
                                        }}
                                    />
                                </div>
                            </SwiperSlide>
                        )
                    })}
            </Swiper>
        </>
    )
}
