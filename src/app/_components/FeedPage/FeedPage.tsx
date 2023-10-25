import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { ViewPostCardCell } from "../ViewPostCard/ViewPostCardCell"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons"
import { useInfoByFeedAtom } from "@/app/_atoms/dataByFeed"
//import { settingContentFilteringPage } from "../SettingContentFilteringPage/styles"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { ListFooterSpinner } from "../ListFooterSpinner"
import { filterDisplayPosts } from "@/app/_lib/feed/filteredDisplayPosts"
// import { useFeedsAtom } from "@/app/_atoms/feeds"

export interface FeedPageProps {
    isActive: boolean
    feedKey: string
    color: "light" | "dark"
    disableSlideVerticalScroll: boolean
    now?: Date
}

const FeedPage = ({
    feedKey,
    color,
    now,
    isActive, // disableSlideVerticalScroll,
}: FeedPageProps) => {
    const [agent] = useAgent()
    const [infoByFeed, setInfoByFeed] = useInfoByFeedAtom()
    const [nextQueryParams] = useNextQueryParamsAtom()
    // const [loading, setLoading] = useState(false)
    // const [loading2, setLoading2] = useState(false)

    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)

    const cursor = useRef<string>("")
    const pollingCursor = useRef<string>("")
    const isPolling = useRef<boolean>(false)
    const scrollRef = useRef<HTMLElement | null>(null)
    const shouldScrollToTop = useRef<boolean>(false)

    // const currentScrollPosition = useRef<number>(0)

    useEffect(() => {
        if (
            feedKey !== "" &&
            infoByFeed[feedKey] &&
            infoByFeed[feedKey].posts
        ) {
            setTimeline(infoByFeed[feedKey].posts)
        }
    }, [])

    useEffect(() => {
        console.log(shouldScrollToTop.current, scrollRef.current)

        if (shouldScrollToTop.current && scrollRef.current) {
            scrollRef.current.scrollTop = 0

            shouldScrollToTop.current = false
        }
    }, [timeline])

    const fetchTimeline = async (loadingFlag: boolean = true) => {
        console.log("start fetchtimeline", feedKey)

        if (!agent) {
            return
        }

        if (feedKey === "") {
            return
        }

        console.log("fetchtimeline", feedKey)

        try {
            // setLoading(loadingFlag)

            let response: AppBskyFeedGetTimeline.Response
            // let timelineLength = 0

            if (feedKey === "following") {
                response = await agent.getTimeline({
                    limit: 30,
                    cursor: cursor.current || "",
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    cursor: cursor.current || "",
                    limit: 30,
                })
            }

            if (response.data) {
                const { feed } = response.data
                let filteredData =
                    feedKey === "following"
                        ? filterDisplayPosts(feed, agent.session?.did)
                        : feed

                setTimeline((currentTimeline) => {
                    if (currentTimeline !== null) {
                        const newTimeline = [
                            ...currentTimeline,
                            ...filteredData,
                        ]
                        // timelineLength = newTimeline.length

                        return newTimeline
                    } else {
                        // timelineLength = filteredData.length
                        return [...filteredData]
                    }
                })
            } else {
                setTimeline([])
                setHasMore(false)
                return
            }

            // setLoading(false)

            cursor.current = response.data.cursor || ""

            // if (
            //     response.data &&
            //     cursor.current &&
            //     cursor.current.length > 0 &&
            //     timelineLength < 15
            // ) {
            //     await fetchTimeline(false)
            //     setHasMore(false)
            //     return
            // }

            if (cursor.current !== "") {
                setHasMore(true)
            } else {
                setHasMore(false)
            }
        } catch (e) {
            // setLoading(false)
            console.error(e)
        }
    }

    const loadMore = async (index: number) => {
        if (hasMore) {
            await fetchTimeline(false)
        }
    }

    const checkNewTimeline = async () => {
        if (!agent) return

        isPolling.current = true

        try {
            let response: AppBskyFeedGetTimeline.Response

            if (feedKey === "following") {
                response = await agent.getTimeline({
                    limit: 30,
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    limit: 30,
                })
            }

            const { data } = response

            if (data) {
                const { feed } = data
                const filteredData =
                    feedKey === "following"
                        ? filterDisplayPosts(feed, agent.session?.did)
                        : feed

                if (data.cursor && data.cursor !== pollingCursor.current) {
                    pollingCursor.current = data.cursor

                    const diffTimeline = filteredData.filter((newItem) => {
                        if (!timeline) {
                            return true
                        } else {
                            return !timeline.some(
                                (oldItem) =>
                                    oldItem.post.uri === newItem.post.uri
                            )
                        }
                    })

                    setNewTimeline(diffTimeline)

                    if (isActive) {
                        isPolling.current = true

                        setTimeout(() => {
                            console.log("setTimeout")
                            checkNewTimeline()
                        }, 5 * 1000)
                        return
                    }
                }
            }

            isPolling.current = false
        } catch (e) {
            isPolling.current = false
            console.error(e)
        }
    }

    useEffect(() => {
        if (!agent) {
            return
        }

        if (!isActive) {
            return
        }

        if (!infoByFeed[feedKey] || !infoByFeed[feedKey].posts) {
            fetchTimeline()
            setNewTimeline([])
        } else {
            setTimeline(infoByFeed[feedKey].posts)
            setNewTimeline(infoByFeed[feedKey].newPosts)
            cursor.current = infoByFeed[feedKey].cursor

            if (cursor.current !== "") {
                setHasMore(true)
            }
        }

        isPolling.current = true

        setTimeout(() => {
            console.log("setTimeout")
            checkNewTimeline()
        }, 15 * 1000)
    }, [agent, feedKey, isActive])

    useEffect(() => {
        if (feedKey === "") {
            return
        }

        setInfoByFeed((prevInfoByFeed) => {
            const newPostsByFeed = prevInfoByFeed

            if (prevInfoByFeed[feedKey]) {
                prevInfoByFeed[feedKey].posts = timeline
            } else {
                prevInfoByFeed[feedKey] = {
                    posts: timeline,
                    newPosts: [],
                    cursor: cursor.current,
                }
            }

            return newPostsByFeed
        })
    }, [timeline, feedKey])

    useEffect(() => {
        if (feedKey === "") {
            return
        }

        setInfoByFeed((prevInfoByFeed) => {
            const newPostsByFeed = prevInfoByFeed

            if (prevInfoByFeed[feedKey]) {
                prevInfoByFeed[feedKey].newPosts = newTimeline
            } else {
                prevInfoByFeed[feedKey] = {
                    posts: [],
                    newPosts: newTimeline,
                    cursor: cursor.current,
                }
            }

            return newPostsByFeed
        })
    }, [newTimeline, feedKey])

    useEffect(() => {
        if (feedKey === "") {
            return
        }

        setInfoByFeed((prevInfoByFeed) => {
            const newPostsByFeed = prevInfoByFeed

            if (prevInfoByFeed[feedKey]) {
                prevInfoByFeed[feedKey].cursor = cursor.current
            } else {
                prevInfoByFeed[feedKey] = {
                    posts: [],
                    newPosts: [],
                    cursor: cursor.current,
                }
            }

            return newPostsByFeed
        })
    }, [cursor.current, feedKey])

    const handleRefresh = () => {
        console.log("newTimeline", newTimeline)

        shouldScrollToTop.current = true

        const newPosts = newTimeline

        setTimeline((prevTimeline) => {
            if (!prevTimeline) {
                return [...newPosts]
            } else {
                return [...newPosts, ...prevTimeline]
            }
        })

        setNewTimeline([])

        if (isPolling.current !== true) {
            setTimeout(() => {
                console.log("setTimeout")
                checkNewTimeline()
            }, 5 * 1000)
        }
    }

    const timelineWithDummy = useMemo((): FeedViewPost[] => {
        // Need to add data for top padding
        const dummyData: FeedViewPost = {} as FeedViewPost

        if (!timeline) {
            return [dummyData]
        } else {
            return [dummyData, ...timeline]
        }
    }, [timeline])

    // const disableScrollIfNeeded = (e: React.UIEvent<Element>) => {
    //     const newScrollPosition = e.currentTarget.scrollTop

    //     if (disableSlideVerticalScroll) {
    //         e.currentTarget.scrollTo({
    //             top: currentScrollPosition.current,
    //             left: 0,
    //         })
    //     }

    //     currentScrollPosition.current = newScrollPosition
    // }

    return (
        <>
            {newTimeline.length > 0 && (
                <div
                    className={
                        "absolute flex justify-center z-[10] left-16 right-16 top-[120px]"
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
            {!timeline && (
                <Virtuoso
                    overscan={100}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCardCell
                            {...{
                                color,
                                isMobile,
                                isSkeleton: true,
                                isDummyHeader: index === 0,
                                nextQueryParams,
                            }}
                        />
                    )}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}
            {timeline && (
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            scrollRef.current = ref
                        }
                    }}
                    context={{ hasMore }}
                    overscan={200}
                    increaseViewportBy={200}
                    // useWindowScroll={true}
                    // overscan={50}
                    data={timelineWithDummy}
                    // initialItemCount={Math.min(18, timeline?.length || 0)}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCardCell
                            {...{
                                color,
                                isMobile,
                                isSkeleton: false,
                                postJson: item.post || null,
                                json: item,
                                isDummyHeader: index === 0,
                                now,
                                nextQueryParams,
                            }}
                        />
                    )}
                    components={{
                        // @ts-ignore
                        Footer: ListFooterSpinner,
                    }}
                    endReached={loadMore}
                    // onScroll={(e) => disableScrollIfNeeded(e)}
                    //className="overflow-y-auto"
                    style={{ height: "calc(100% - 50px)" }}
                />
            )}
        </>
    )
}

export default FeedPage
