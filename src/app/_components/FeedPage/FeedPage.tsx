import { Virtuoso } from "react-virtuoso"
import { isMobile } from "react-device-detect"
import { FeedViewPost } from "@atproto/api/dist/client/types/app/bsky/feed/defs"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAgent } from "@/app/_atoms/agent"
import { AppBskyFeedGetTimeline } from "@atproto/api"
import { ViewPostCardCell } from "../ViewPostCard/ViewPostCardCell"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowsRotate, faL } from "@fortawesome/free-solid-svg-icons"
import { useInfoByFeedAtom } from "@/app/_atoms/dataByFeed"
//import { settingContentFilteringPage } from "../SettingContentFilteringPage/styles"
import { useNextQueryParamsAtom } from "@/app/_atoms/nextQueryParams"
import { ListFooterSpinner } from "../ListFooterSpinner"
import { filterDisplayPosts } from "@/app/_lib/feed/filterDisplayPosts"
import { useTranslation } from "react-i18next"
import { mergePosts } from "@/app/_lib/feed/mergePosts"
import { ListFooterNoContent } from "@/app/_components/ListFooterNoContent"
// import { usePathname } from "next/navigation"
// import { useListScrollRefAtom } from "@/app/_atoms/listScrollRef"

const FEED_FETCH_LIMIT: number = 30
const CHECK_FEED_UPDATE_INTERVAL: number = 5 * 1000
export interface FeedPageProps {
    isActive: boolean
    feedKey: string
    disableSlideVerticalScroll: boolean
    now?: Date
}

const FeedPage = ({
    feedKey,
    now,
    isActive, // disableSlideVerticalScroll,
}: FeedPageProps) => {
    // const pathname = usePathname()
    const { t } = useTranslation()

    const [agent] = useAgent()
    // const [infoByFeed, setInfoByFeed] = useInfoByFeedAtom()
    const [nextQueryParams] = useNextQueryParamsAtom()
    // const [, setListScrollRefAtom] = useListScrollRefAtom()

    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasUpdate, setHasUpdate] = useState<boolean>(false)
    const [shouldCheckUpdate, setShouldCheckUpdate] = useState<boolean>(false)
    const [isEndOfFeed, setIsEndOfFeed] = useState<boolean>(false)
    const cursor = useRef<string>("")
    const scrollRef = useRef<HTMLElement | null>(null)
    const shouldScrollToTop = useRef<boolean>(false)
    const latestCID = useRef<string>("")

    // const currentScrollPosition = useRef<number>(0)

    // useEffect(() => {
    //     if (
    //         feedKey !== "" &&
    //         infoByFeed[feedKey] &&
    //         infoByFeed[feedKey].posts
    //     ) {
    //         setTimeline(infoByFeed[feedKey].posts)
    //     }
    // }, [])

    useEffect(() => {
        console.log(`timeline ${feedKey}`, timeline)
        console.log(shouldScrollToTop.current, scrollRef.current)

        if (shouldScrollToTop.current && scrollRef.current) {
            scrollRef.current.scrollTop = 0

            shouldScrollToTop.current = false
        }
    }, [timeline])

    const fetchTimeline = async (loadingFlag: boolean = true) => {
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
                    limit: FEED_FETCH_LIMIT,
                    cursor: cursor.current || "",
                })
            } else {
                response = await agent.app.bsky.feed.getFeed({
                    feed: feedKey,
                    cursor: cursor.current || "",
                    limit: FEED_FETCH_LIMIT,
                })
            }

            if (
                response.data.feed.length === 0 &&
                (cursor.current === response.data.cursor ||
                    !response.data.cursor)
            ) {
                setIsEndOfFeed(true)
            }

            if (response.data) {
                const { feed } = response.data

                console.log("feed", feed)

                const filteredData =
                    feedKey === "following"
                        ? filterDisplayPosts(feed, agent.session?.did)
                        : feed

                console.log("filteredData", filteredData)

                setTimeline((currentTimeline) => {
                    if (currentTimeline !== null) {
                        const newTimeline = [
                            ...currentTimeline,
                            ...filteredData,
                        ]

                        return newTimeline
                    } else {
                        return [...filteredData]
                    }
                })

                if (filteredData.length > 0) {
                    latestCID.current = filteredData[0].post.cid
                } else {
                    latestCID.current = ""
                }
            } else {
                setTimeline([])
                setHasMore(false)
                return
            }

            cursor.current = response.data.cursor || ""

            if (cursor.current !== "") {
                setHasMore(true)
            } else {
                setHasMore(false)
            }
        } catch (e) {
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

        setShouldCheckUpdate(false)

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
                        ? filterDisplayPosts(feed, agent.session?.did)
                        : feed

                console.log(`check new ${feedKey}`, filteredData)
                console.log(`timeline ${feedKey}`, timeline)

                setNewTimeline(filteredData)

                if (filteredData.length > 0) {
                    console.log(
                        "new and old cid",
                        feedKey,
                        filteredData[0].post.cid,
                        latestCID.current
                    )

                    if (
                        filteredData[0].post.cid !== latestCID.current &&
                        latestCID.current !== ""
                    ) {
                        setHasUpdate(true)
                    } else {
                        setHasUpdate(false)
                    }
                }

                if (isActive) {
                    setShouldCheckUpdate(true)
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (agent === null) {
            return
        }

        if (feedKey === "") {
            return
        }

        if (isActive === false) {
            return
        }

        setNewTimeline([])
        setHasMore(false)
        cursor.current = ""

        fetchTimeline()
    }, [agent, feedKey, isActive])

    // useEffect(() => {
    //     if (!agent) {
    //         return
    //     }

    //     console.log("here")

    //     if (!isActive) {
    //         return
    //     }

    //     const initialAction = async () => {
    //         if (!infoByFeed[feedKey] || infoByFeed[feedKey].posts == null) {
    //             setNewTimeline([])
    //             await fetchTimeline()
    //         } else {
    //             setTimeline(infoByFeed[feedKey].posts)
    //             //setNewTimeline(infoByFeed[feedKey].newPosts)
    //             cursor.current = infoByFeed[feedKey].cursor

    //             console.log(
    //                 "infoByFeed[feedKey].latestCID",
    //                 infoByFeed[feedKey].latestCID
    //             )

    //             latestCID.current = infoByFeed[feedKey].latestCID

    //             if (cursor.current !== "") {
    //                 setHasMore(true)
    //             }
    //         }

    //         setShouldCheckUpdate(true)
    //     }

    //     initialAction()
    // }, [agent, feedKey, isActive, pathname])

    // useEffect(() => {
    //     if (feedKey === "") {
    //         return
    //     }

    //     setInfoByFeed((prevInfoByFeed) => {
    //         const newPostsByFeed = prevInfoByFeed

    //         if (prevInfoByFeed[feedKey]) {
    //             newPostsByFeed[feedKey] = {
    //                 posts: timeline,
    //                 newPosts: [],
    //                 cursor: cursor.current,
    //                 latestCID:
    //                     timeline !== null && timeline.length > 0
    //                         ? timeline[0].post.cid
    //                         : "",
    //             }

    //             return newPostsByFeed
    //         } else {
    //             const newData = {
    //                 posts: timeline,
    //                 newPosts: [],
    //                 cursor: cursor.current,
    //                 latestCID:
    //                     timeline !== null && timeline.length > 0
    //                         ? timeline[0].post.cid
    //                         : "",
    //             }

    //             return { ...prevInfoByFeed, newData }
    //         }
    //     })
    // }, [timeline, feedKey, cursor.current])

    // useEffect(() => {
    //     console.log("isActive")
    //     if (shouldCheckUpdate === false) {
    //         if (timeline !== null) {
    //             cursor.current = timeline[0].post.cid
    //         }
    //         setShouldCheckUpdate(true)
    //     }
    // }, [isActive])

    // useEffect(() => {
    //     if (feedKey === "") {
    //         return
    //     }

    //     setInfoByFeed((prevInfoByFeed) => {
    //         const newPostsByFeed = prevInfoByFeed

    //         if (prevInfoByFeed[feedKey]) {
    //             prevInfoByFeed[feedKey].newPosts = newTimeline
    //         } else {
    //             prevInfoByFeed[feedKey] = {
    //                 posts: [],
    //                 newPosts: newTimeline,
    //                 cursor: cursor.current,
    //             }
    //         }

    //         return newPostsByFeed
    //     })
    // }, [newTimeline, feedKey])

    const handleRefresh = () => {
        shouldScrollToTop.current = true

        const mergedTimeline = mergePosts(newTimeline, timeline)

        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        if (mergedTimeline.length > 0) {
            latestCID.current = mergedTimeline[0].post.cid
        }

        // setShouldCheckUpdate(true)
    }

    const timelineWithDummy = useMemo((): FeedViewPost[] => {
        // Need to add data for top padding
        const dummyData: FeedViewPost = {} as FeedViewPost

        if (timeline === null) {
            return [dummyData]
        } else {
            return [dummyData, ...timeline]
        }
    }, [timeline])

    useEffect(() => {
        if (isActive === false) {
            return
        }

        console.log("shouldCheckUpdate", shouldCheckUpdate)

        if (shouldCheckUpdate == false) {
            return
        }

        const timeoutId = setTimeout(async () => {
            console.log("setTimeout", feedKey)
            checkNewTimeline()
        }, CHECK_FEED_UPDATE_INTERVAL)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [shouldCheckUpdate, isActive])

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
            {hasUpdate && (
                <div
                    className={
                        "absolute flex justify-center z-[10] left-16 right-16 md:top-[120px] top-[100px]"
                    }
                >
                    <div
                        className={
                            "text-white bg-blue-500/50 backdrop-blur-[15px] rounded-full cursor-pointer pl-[10px] pr-[10px] pt-[5px] pb-[5px] text-[14px]"
                        }
                        onClick={handleRefresh}
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} />{" "}
                        {t("button.newPosts")}
                    </div>
                </div>
            )}
            {timeline === null && (
                <Virtuoso
                    overscan={100}
                    increaseViewportBy={200}
                    totalCount={20}
                    initialItemCount={20}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, _) => (
                        <ViewPostCardCell
                            {...{
                                isMobile,
                                isSkeleton: true,
                                isDummyHeader: index === 0,
                                nextQueryParams,
                                t,
                            }}
                        />
                    )}
                    style={{ overflowY: "auto", height: "calc(100% - 50px)" }}
                />
            )}
            {timeline !== null && (
                <Virtuoso
                    scrollerRef={(ref) => {
                        if (ref instanceof HTMLElement) {
                            scrollRef.current = ref
                            // setListScrollRefAtom(ref)
                        }
                    }}
                    context={{ hasMore }}
                    overscan={200}
                    increaseViewportBy={200}
                    // overscan={50}
                    data={timelineWithDummy}
                    // initialItemCount={Math.min(18, timeline?.length || 0)}
                    atTopThreshold={100}
                    atBottomThreshold={100}
                    itemContent={(index, item) => (
                        <ViewPostCardCell
                            {...{
                                isMobile,
                                isSkeleton: false,
                                postJson: item.post || null,
                                json: item,
                                isDummyHeader: index === 0,
                                now,
                                nextQueryParams,
                                t,
                            }}
                        />
                    )}
                    components={{
                        // @ts-ignore
                        Footer: !isEndOfFeed
                            ? ListFooterSpinner
                            : ListFooterNoContent,
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
