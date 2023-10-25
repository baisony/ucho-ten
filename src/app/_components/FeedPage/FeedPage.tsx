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

const FEED_FETCH_LIMIT: number = 30
const CHECK_FEED_UPDATE_INTERVAL: number = 5 * 1000
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
    const { t } = useTranslation()

    const [agent] = useAgent()
    const [infoByFeed, setInfoByFeed] = useInfoByFeedAtom()
    const [nextQueryParams] = useNextQueryParamsAtom()

    const [timeline, setTimeline] = useState<FeedViewPost[] | null>(null)
    const [newTimeline, setNewTimeline] = useState<FeedViewPost[]>([])
    const [hasMore, setHasMore] = useState<boolean>(false)
    const [hasUpdate, setHasUpdate] = useState<boolean>(false)
    const [shouldCheckUpdate, setShouldCheckUpdate] = useState<boolean>(false)

    const cursor = useRef<string>("")
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

                if (
                    filteredData.length > 0 &&
                    timeline !== null &&
                    timeline.length > 0
                ) {
                    console.log(
                        "new and old cid",
                        filteredData[0].post.cid,
                        timeline[0].post.cid
                    )

                    if (filteredData[0].post.cid !== timeline[0].post.cid) {
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
        if (!agent) {
            return
        }

        if (!isActive) {
            return
        }

        const initialAction = async () => {
            if (!infoByFeed[feedKey] || infoByFeed[feedKey].posts == null) {
                setNewTimeline([])
                await fetchTimeline()
            } else {
                setTimeline(infoByFeed[feedKey].posts)
                //setNewTimeline(infoByFeed[feedKey].newPosts)
                cursor.current = infoByFeed[feedKey].cursor

                if (cursor.current !== "") {
                    setHasMore(true)
                }
            }

            setShouldCheckUpdate(true)
        }

        initialAction()
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
        shouldScrollToTop.current = true

        const mergedTimeline = mergePosts(newTimeline, timeline)

        setTimeline(mergedTimeline)
        setNewTimeline([])
        setHasUpdate(false)

        setShouldCheckUpdate(true)
    }

    const timelineWithDummy = useMemo((): FeedViewPost[] => {
        console.log("timelineWithDummy timeline", timeline)
        // Need to add data for top padding
        const dummyData: FeedViewPost = {} as FeedViewPost

        if (timeline == null) {
            return [dummyData]
        } else {
            return [dummyData, ...timeline]
        }
    }, [timeline])

    useEffect(() => {
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
    }, [shouldCheckUpdate])

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
            {timeline == null && (
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
            {timeline !== null && (
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
